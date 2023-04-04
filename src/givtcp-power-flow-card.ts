import { LovelaceCardConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { LitElement, css, html, TemplateResult, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor';
import './entity';
import { SVGUtils } from './svg-utils';
import { CentreEntity, EntityData, EntityLayout, FlowDirection, FlowTotal } from './types';
import { CENTRE_ENTITY_DEFAULT, CIRCLE_SIZE_DEFAULT, ENTITY_LAYOUT_DEFAULT, HIDE_INACTIVE_TOTALS_DEFAULT, HIDE_INACTIVE_FLOWS_DEFAULT, ICON_BATTERY_DEFAULT, ICON_GRID_DEFAULT, ICON_HOUSE_DEFAULT, ICON_SOLAR_DEFAULT, LINE_GAP_DEFAULT, LINE_WIDTH_DEFAULT, POWER_MARGIN_DEFAULT } from './const';

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

	private flows: {from:string, to:string, direction:FlowDirection}[] = [
		{from: 'solar', to: 'grid', direction: FlowDirection.Out},
		{from: 'solar', to: 'battery', direction: FlowDirection.In},
		{from: 'solar', to: 'house', direction: FlowDirection.In},
		{from: 'battery', to: 'house', direction: FlowDirection.Out},
		{from: 'battery', to: 'grid', direction: FlowDirection.In},
		{from: 'grid', to: 'house', direction: FlowDirection.In},
		{from: 'grid', to: 'battery', direction: FlowDirection.Out},
	];

	private _width!: number;
	private _resizeObserver!: ResizeObserver;
	private _animate!: boolean;
	private _previousTimeStamp!: number;

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('givtcp-power-flow-card-editor') as LovelaceCardEditor;
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
	private get _hideInactiveTotals(): boolean {
		return this._config?.hide_inactive_totals == undefined ? HIDE_INACTIVE_TOTALS_DEFAULT : this._config?.hide_inactive_totals;
	}
	private getIconFor(type: string): string {
		switch (type) {
			case 'solar':
				return this._config?.icon_solar || ICON_SOLAR_DEFAULT;
			case 'battery':
				return this._config?.icon_battery || ICON_BATTERY_DEFAULT;
			case 'grid':
				return this._config?.icon_grid || ICON_GRID_DEFAULT;
			case 'house':
				return this._config?.icon_house || ICON_HOUSE_DEFAULT;
			default:
				return '';
		}
	}
	private getCleanPowerForFlow(from: string, to: string): number | undefined {
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
	connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(changes => {
			for (const change of changes) {
				const t = change.target as GivTCPPowerFlowCard;
				if (change.contentRect.width !== t._width) {
					setTimeout(() => {
						t._width = change.contentRect.width;
						t.style.setProperty('--gtpc-size', (t._width / 4) + 'px');
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
		line.setAttribute('visibility', power?'visible':'hidden');
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
		const entities: EntityData[] = [
			{
				size: '100px',
				type: 'solar',
				icon: this.getIconFor('solar'),
				name: 'Solar',
				out: this.getTotalFor('solar', FlowDirection.Out)
			},
			{
				size: '100px',
				type: 'house',
				icon: this.getIconFor('house'),
				name: 'House',
				in: this.getTotalFor('house', FlowDirection.In)
			},
			{
				size: '100px',
				type: 'grid',
				icon: this.getIconFor('grid'),
				name: 'Grid',
				out: this.getTotalFor('grid', FlowDirection.In),
				in: this.getTotalFor('grid', FlowDirection.Out)
			},
			{
				size: '100px',
				type: 'battery',
				icon: this.getIconFor('battery'),
				name: 'Battery',
				out: this.getTotalFor('battery', FlowDirection.In),
				in: this.getTotalFor('battery', FlowDirection.Out)
			},
		].filter((v) => v.in !== undefined || v.out !== undefined);
		return html`
			<ha-card header="${this._config?.name}">
				${this._width > 0 ? html`
				<div class="card-content">
					<div class="gtpc-layout gtpc-layout-${this._entityLayout} gtpc-centre-${this._centreEntity}">
						${entities.map(entity => html`<givtcp-power-flow-card-entity data-type="${entity.type}"  .data=${entity}></givtcp-power-flow-card-entity>`)}
						<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
							${this.flows.map(flow => this.getGroupForFlow(flow.from, flow.to))}
						</svg>
					</div>
				</div>
				`: html``}
			</ha-card>`;
	}
	private getGroupForFlow(from: string, to: string): TemplateResult {
		return svg`<g data-pos="0" class="gtpc-flow gtpc-${from}-to-${to}-flow" style="stroke: var(--gtpc-${from}-color)">
			<line x1="0" y1="0" x2="0" y2="0"/>
			<path d="${this.getPathForFlow(`${from}-to-${to}`)}" />
		</g>`;
	}
	private getPathForFlow(flow: string): string {
		switch (flow) {
			case 'solar-to-house':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(50+this._lineGap, 25, 75, 50-this._lineGap, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 5, this._circleSize);
				}
			case 'battery-to-house':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(75, 50+this._lineGap, 50+this._lineGap, 75, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 30, this._circleSize);
				}
			case 'battery-to-grid':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(50-this._lineGap, 75, 25, 50+this._lineGap, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 55, this._circleSize);
				}
			case 'grid-to-battery':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(50-this._lineGap, 75, 25, 50+this._lineGap, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 55, this._circleSize);
				}
			case 'solar-to-grid':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(25, 50-this._lineGap, 50-this._lineGap, 25, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 80, this._circleSize);
				}
			case 'solar-to-battery':
				switch (this._entityLayout) {
					case 'cross':
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCurvePath(50, 25, 50, 75, 0);
				}
			case 'grid-to-house':
				switch (this._entityLayout) {
					case 'cross':
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCurvePath(25, 50, 75, 50, 0);
				}
			default:
				return '';
		}
	}
	setConfig(config: LovelaceCardConfig): void {
		if (!config.invertor || !config.battery) {
			throw new Error("You need to define battery and invertor entities");
		}
		this._config = config;
		this.style.setProperty('--gtpc-line-size', `${this._lineWidth}px`);
		this.style.setProperty('--gtpc-inactive-flow-display', this._hideInactiveFlows ? 'none' : 'block');
		this.style.setProperty('--gtpc-inactive-totals-display', this._hideInactiveTotals ? 'none' : 'block');
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
	.gtpc-flow>line{
		stroke: var(--gtpc-border);
		stroke-linecap: round;
		stroke-width: calc(var(--gtpc-line-size) * 1);
		vector-effect: non-scaling-stroke;
	}
	.gtpc-flow>path{
		stroke: var(--gtpc-border);
		fill:none;
		stroke-width: var(--gtpc-line-size);
		vector-effect: non-scaling-stroke;
	}
	.gtpc-flow[data-pos="0"]{
		display: var(--gtpc-inactive-flow-display);
	}
	.gtpc-flow[data-pos="0"]>line{
		display: none;
	}
	givtcp-power-flow-card-entity {
		position: absolute;
		width: var(--gtpc-size);
		aspect-ratio: 1 / 1;
	}
	.gtpc-layout {
		position: relative;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="grid"],
	.gtpc-layout-cross>givtcp-power-flow-card-entity[data-type="grid"] {
		left: 0;
		top: calc(50% - var(--gtpc-size) / 2);
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="solar"],
	.gtpc-layout-cross>givtcp-power-flow-card-entity[data-type="solar"] {
		top: 0;
		left: calc(50% - var(--gtpc-size) / 2);
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="house"],
	.gtpc-layout-cross>givtcp-power-flow-card-entity[data-type="house"] {
		right: 0;
		top: calc(50% - var(--gtpc-size) / 2);
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="battery"],
	.gtpc-layout-cross>givtcp-power-flow-card-entity[data-type="battery"] {
		bottom: 0;
		left: calc(50% - var(--gtpc-size) / 2);
	}`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card': GivTCPPowerFlowCard
	}
}