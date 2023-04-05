import { LovelaceCardConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor';
import './entity';
import './layout-cross';
import './layout-circle';

import { CentreEntity, FlowData, EntityLayout, FlowDirection, FlowTotal } from './types';
import { CENTRE_ENTITY_DEFAULT, CIRCLE_SIZE_DEFAULT, ENTITY_LAYOUT_DEFAULT, HIDE_INACTIVE_FLOWS_DEFAULT, COLOUR_ICONS_AND_TEXT_DEFAULT, ICON_BATTERY_DEFAULT, ICON_GRID_DEFAULT, ICON_HOUSE_DEFAULT, ICON_SOLAR_DEFAULT, LINE_GAP_DEFAULT, LINE_WIDTH_DEFAULT, POWER_MARGIN_DEFAULT, PERCENTAGE } from './const';

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	type: 'givtcp-power-flow-card',
	name: 'GivTCP Power Flow Card',
	description: 'GivTCP Power Flow Card',
});

@customElement('givtcp-power-flow-card')
export class GivTCPPowerFlowCard extends LitElement implements LovelaceCard {
	isPanel?: boolean | undefined;
	editMode?: boolean | undefined;
	@state() private _config!: LovelaceCardConfig;
	@property() hass!: HomeAssistant;

	private flows: { from: string, to: string, direction: FlowDirection }[] = [
		{ from: 'solar', to: 'grid', direction: FlowDirection.Out },
		{ from: 'solar', to: 'battery', direction: FlowDirection.In },
		{ from: 'solar', to: 'house', direction: FlowDirection.In },
		{ from: 'battery', to: 'house', direction: FlowDirection.Out },
		{ from: 'battery', to: 'grid', direction: FlowDirection.In },
		{ from: 'grid', to: 'house', direction: FlowDirection.In },
		{ from: 'grid', to: 'battery', direction: FlowDirection.Out },
	];

	private _width!: number;
	private _resizeObserver!: ResizeObserver;
	private _animate!: boolean;
	private _previousTimeStamp!: number;

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('givtcp-power-flow-card-editor') as LovelaceCardEditor;
	}
	private get _batterySoc(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_soc`];
		return entity ? parseInt(entity.state, 10) : undefined;
	}
	private get _entityLayout(): EntityLayout {
		return this._config?.entity_layout || ENTITY_LAYOUT_DEFAULT;
	}
	private get _centreEntity(): CentreEntity {
		return this._config?.centre_entity || CENTRE_ENTITY_DEFAULT;
	}
	private get _invertorSerial(): string {
		return this._config?.invertor ? this.hass.states[this._config?.invertor].state.toLowerCase() || '' : '';
	}
	// private get _batterySerial(): string {
	// 	return this._config?.battery ? this.hass.states[this._config?.battery].state.toLowerCase() || '' : '';
	// }
	private get _powerMargin(): number {
		return this._config?.power_margin || POWER_MARGIN_DEFAULT;
	}
	private get _lineGap(): number {
		return this._config?.line_gap || LINE_GAP_DEFAULT;
	}
	private get _circleSize(): number {
		return this._config?.circle_size || CIRCLE_SIZE_DEFAULT;
	}
	private get _lineWidth(): number {
		return this._config?.line_width || LINE_WIDTH_DEFAULT;
	}
	private get _hideInactiveFlows(): boolean {
		return this._config?.hide_inactive_flows == undefined ? HIDE_INACTIVE_FLOWS_DEFAULT : this._config?.hide_inactive_flows;
	}
	private get _colourIconsAndText(): boolean {
		return this._config?.colour_icons_and_text == undefined ? COLOUR_ICONS_AND_TEXT_DEFAULT : this._config?.colour_icons_and_text;
	}
	private get _hasBattery(): boolean {
		return this.flows.some(f => f.from === 'battery' && this.hass.states[`sensor.givtcp_${this._invertorSerial}_${f.from}_to_${f.to}`] !== undefined);
	}
	private get _hasSolar(): boolean {
		return this.flows.some(f => f.from === 'solar' && this.hass.states[`sensor.givtcp_${this._invertorSerial}_${f.from}_to_${f.to}`] !== undefined);
	}
	private getIconFor(type: string, level: undefined | number = undefined): string {
		switch (type) {
			case 'solar':
				return this._config?.icon_solar || ICON_SOLAR_DEFAULT;
			case 'battery':
				let icon = this._config?.icon_battery || ICON_BATTERY_DEFAULT;
				if (icon === ICON_BATTERY_DEFAULT && level !== undefined) {
					const bIn = this.getTotalFor('battery', FlowDirection.In);
					const bOut = this.getTotalFor('battery', FlowDirection.Out);
					if (bIn && bOut && bIn.total > bOut.total) {
						icon = icon + '-charging';
					}

					const soc = Math.ceil(level / 10) * 10;
					icon = icon + '-' + soc.toString();
				}
				return icon;
			case 'grid':
				return this._config?.icon_grid || ICON_GRID_DEFAULT;
			case 'house':
				return this._config?.icon_house || ICON_HOUSE_DEFAULT;
			default:
				return '';
		}
	}
	private getDemoPowerForFlow(from: string, to: string): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_${from}_to_${to}`];
		if (entity !== undefined) {
			if (from === 'grid' && to === 'house') {
				return 668;
			} else if (from === 'solar' && to === 'house') {
				return 724;
			} else if (from === 'solar' && to === 'battery') {
				return 764;
			} else if (from === 'battery' && to === 'house') {
				return 0;
			} else if (from === 'battery' && to === 'grid') {
				return 0;
			} else if (from === 'grid' && to === 'battery') {
				return 445;
			} else if (from === 'solar' && to === 'grid') {
				return 0;
			}
			return 0;
		}
		return undefined;
	}
	private getCleanPowerForFlow(from: string, to: string): number | undefined {
		if (this._config?.demo_mode) return this.getDemoPowerForFlow(from, to);
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_${from}_to_${to}`];
		return entity !== undefined ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private cleanSensorData(amount: number): number {
		return amount < this._powerMargin ? 0 : amount;
	}
	private getTotalFor(type: string, direction: FlowDirection): FlowTotal | undefined {
		return this.flows.reduce((acc: FlowTotal | undefined, flow) => {
			const m = direction === FlowDirection.In ? flow.to === type : flow.from === type;
			const power = this.getCleanPowerForFlow(flow.from, flow.to);
			if (m && power !== undefined) {
				if (acc === undefined) {
					acc = { total: 0, parts: [] };
				}
				acc.parts.push({ type: flow.from, value: power });
				acc.total += power;
			}
			return acc;
		}, undefined);
	}
	constructor() {
		super();
	}
	connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(changes => {
			for (const change of changes) {
				const t = change.target as GivTCPPowerFlowCard;
				if (change.contentRect.width !== t._width) {
					setTimeout(() => {
						t._width = change.contentRect.width;
						t.style.setProperty('--gtpc-size', (t._width / 4) + 'px');
						t.requestUpdate();
					}, 0);
				}
			}
		});
		this._resizeObserver.observe(this);
		this.style.display = "block";
		const self = this;
		window.requestAnimationFrame(timestamp => {
			self._animate = true;
			self.animateFlows(timestamp);
		});
	}
	private animateFlows(timestamp: number): void {
		const elapsed = timestamp - this._previousTimeStamp;
		this.flows.forEach(flow => {
			this.advanceFlowDot(elapsed, flow.from, flow.to, flow.direction);
		});
		this._previousTimeStamp = timestamp;
		//TODO: reorder flows so that the ones with the most power are on top
		//parent.insertBefore(parent.removeChild(gRobot), gDoorway)
		const self = this;
		if (this._animate) {
			window.requestAnimationFrame(timestamp => {
				self.animateFlows(timestamp);
			});
		}
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this._resizeObserver?.unobserve(this);
		this._animate = false;
	}
	private advanceFlowDot(elapsed: number, from: string, to: string, direction: FlowDirection): void {
		const g = <SVGGElement>this.shadowRoot?.querySelector(`.gtpc-${from}-to-${to}-flow`);
		if (!g) return;
		const path = <SVGPathElement>g.querySelector('path');
		const line = <SVGLineElement>g.querySelector('line');

		let power = this.getCleanPowerForFlow(from, to);
		if (power === undefined) {
			return;
		};
		let pos = parseFloat(g.getAttribute('data-pos') || '0');
		line.setAttribute('visibility', power ? 'visible' : 'hidden');
		const lineLength = path.getTotalLength();
		const point = path.getPointAtLength(lineLength * pos);
		line.setAttributeNS(null, 'x1', point.x.toString());
		line.setAttributeNS(null, 'y1', point.y.toString());
		line.setAttributeNS(null, 'x2', point.x.toString());
		line.setAttributeNS(null, 'y2', point.y.toString());

		const moveBy = ((elapsed * power) / 10000) / 1000;
		if (direction === FlowDirection.In) {
			pos += moveBy;
			if (pos > 1) pos = 0;
		} else {
			pos -= moveBy;
			if (pos < 0) pos = 1;
		}
		g.setAttribute('data-pos', pos.toString());
		g.setAttribute('data-power', power.toString());
	}
	updated(): void {
	}
	render(): TemplateResult {
		const flowData: FlowData[] = [
			{
				type: 'solar',
				icon: this.getIconFor('solar'),
				name: 'Solar',
				out: this.getTotalFor('solar', FlowDirection.Out)
			},
			{
				type: 'house',
				icon: this.getIconFor('house'),
				name: 'House',
				in: this.getTotalFor('house', FlowDirection.In)
			},
			{
				type: 'grid',
				icon: this.getIconFor('grid'),
				name: 'Grid',
				out: this.getTotalFor('grid', FlowDirection.In),
				in: this.getTotalFor('grid', FlowDirection.Out)
			},
			{
				type: 'battery',
				icon: this.getIconFor('battery', this._batterySoc),
				name: 'Battery',
				extra: this._batterySoc !== undefined ? `${this._batterySoc}${PERCENTAGE}` : undefined,
				out: this.getTotalFor('battery', FlowDirection.Out),
				in: this.getTotalFor('battery', FlowDirection.In)
			},
		].filter((v) => v.in !== undefined || v.out !== undefined);
		let layout = html``;
		switch (this._entityLayout) {
			case EntityLayout.Cross:
				layout = html`
						<givtcp-power-flow-card-layout-cross
						.flowData=${flowData}
						.flows=${this.flows}
						.hasBattery=${this._hasBattery}
						.hasSolar=${this._hasSolar}
						.lineGap=${this._lineGap}
						>
						</givtcp-power-flow-card-layout-cross>`;
				break;
			case EntityLayout.Circle:
				layout = html`
						<givtcp-power-flow-card-layout-circle
						.flowData=${flowData}
						.flows=${this.flows}
						.hasBattery=${this._hasBattery}
						.hasSolar=${this._hasSolar}
						.centreEntity=${this._centreEntity}
						.circleSize=${this._circleSize}
						>
						</givtcp-power-flow-card-layout-circle>`;
				break;
			default:
				return html``;
		}
		return html`<ha-card header="${this._config?.name}">
		${this._width > 0 ? html`<div class="card-content">${layout}</div>` : html``}
		</ha-card>`;
	}
	setConfig(config: LovelaceCardConfig): void {
		if (!config.invertor || !config.battery) {
			throw new Error("You need to define battery and invertor entities");
		}
		this._config = config;
		this.style.setProperty('--gtpc-line-size', `${this._lineWidth}px`);
		this.style.setProperty('--gtpc-inactive-flow-display', this._hideInactiveFlows ? 'none' : 'block');
		if (this._colourIconsAndText) {
			this.style.removeProperty('--gtpc-icons-and-text-colour');
		} else {
			this.style.setProperty('--gtpc-icons-and-text-colour', 'var(--primary-text-color)');
		}
	}
	getCardSize(): number {
		return 3;
	}
	static styles = css`
    :host {
		--gtpc-grid-color: var(--primary-text-color);
		--gtpc-solar-color: var(--warning-color);
		--gtpc-house-color: var(--info-color);
		--gtpc-battery-color: var(--success-color);
    }
	`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card': GivTCPPowerFlowCard
	}
}