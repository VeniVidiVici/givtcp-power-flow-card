import { LovelaceCardConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { LitElement, css, html, TemplateResult, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor';
import './entity';
import { SVGUtils } from './svg-utils';
import { CentreEntity, EntityData, EntityLayout, FlowDirection, FlowTotal } from './types';

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	type: 'givtcp-power-flow-card',
	name: 'GivTCP Power Flow Card',
	description: 'GivTCP Power Flow Card',
});

@customElement('givtcp-power-flow-card')
export class GivTCPPowerFlowCard extends LitElement implements LovelaceCard {
	@state() private _config!: LovelaceCardConfig;
	@property() hass!: HomeAssistant;

	private _entityNames: string[] = [
		'_gridToHouse',
		'_gridToBattery',
		'_solarToGrid',
		'_solarToBattery',
		'_solarToHouse',
		'_batteryToHouse',
		'_batteryToGrid'
	];
	private _width!: number;
	private _resizeObserver!: ResizeObserver;
	private _animate!: boolean;
	private _previousTimeStamp!: number;

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('givtcp-power-flow-card-editor') as LovelaceCardEditor;
	}
	private get _entityLayout(): EntityLayout {
		return this._config?.entity_layout || EntityLayout.Circle;
	}
	private get _centreEntity(): CentreEntity {
		return this._config?.centre_entity || CentreEntity.None;
	}
	private get _invertorSerial(): string {
		return this._config?.invertor ? this.hass.states[this._config?.invertor].state.toLowerCase() || '' : '';
	}
	private get _batterySerial(): string {
		return this._config?.battery ? this.hass.states[this._config?.battery].state.toLowerCase() || '' : '';
	}
	private get _gridToHouse(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_grid_to_house`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _gridToBattery(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_grid_to_battery`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _solarToGrid(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_solar_to_grid`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _solarToBattery(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_solar_to_battery`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _solarToHouse(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_solar_to_house`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _batteryToHouse(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_battery_to_house`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _batteryToGrid(): number | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_battery_to_grid`];
		return entity ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private get _powerMargin(): number {
		return this._config?.power_margin || 10;
	}
	private cleanSensorData(amount: number): number {
		return amount < this._powerMargin ? 0 : amount;
	}
	private getTotalFor(type: string, direction: FlowDirection): FlowTotal | undefined {
		return this._entityNames.reduce((acc: FlowTotal | undefined, key) => {
			const m = direction === FlowDirection.In ? key.toLowerCase().endsWith(type) : key.toLowerCase().startsWith(`_${type}`);
			if (m && this[key as keyof GivTCPPowerFlowCard] !== undefined) {
				const v = this[key as keyof GivTCPPowerFlowCard] as number;
				const match = key.match(/_(.*?)To/);
				if (match !== null && match.length > 1) {
					if (acc === undefined) {
						acc = { total: 0, parts: [] };
					}
					acc.parts.push({ type: match[1], value: v });
					acc.total += v;
				}
			}
			return acc;
		}, undefined);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this.style.setProperty('--gtpc-line-size', '2px');
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
		this.advanceFlowDot(elapsed, 'solar', 'house', FlowDirection.In);
		this.advanceFlowDot(elapsed, 'solar', 'grid', FlowDirection.Out);
		this.advanceFlowDot(elapsed, 'battery', 'grid', FlowDirection.In);
		this.advanceFlowDot(elapsed, 'battery', 'house', FlowDirection.Out);
		this.advanceFlowDot(elapsed, 'grid', 'battery', FlowDirection.Out);
		this.advanceFlowDot(elapsed, 'solar', 'battery', FlowDirection.In);
		this.advanceFlowDot(elapsed, 'grid', 'house', FlowDirection.In);
		this._previousTimeStamp = timestamp;
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

		let power = this[`_${from}To${to.charAt(0).toUpperCase() + to.slice(1)}` as keyof GivTCPPowerFlowCard] as number;
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
				icon: 'mdi:solar-panel-large',
				name: 'Solar',
				out: this.getTotalFor('solar', FlowDirection.Out)
			},
			{
				size: '100px',
				type: 'house',
				icon: 'mdi:home',
				name: 'House',
				in: this.getTotalFor('house', FlowDirection.In)
			},
			{
				size: '100px',
				type: 'grid',
				icon: 'mdi:transmission-tower',
				name: 'Grid',
				out: this.getTotalFor('grid', FlowDirection.In),
				in: this.getTotalFor('grid', FlowDirection.Out)
			},
			{
				size: '100px',
				type: 'battery',
				icon: 'mdi:battery-medium',
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
							${this.getGroupForFlow('battery', 'grid')}
							${this.getGroupForFlow('grid', 'battery')}
							${this.getGroupForFlow('grid', 'house')}
							${this.getGroupForFlow('battery', 'house')}
							${this.getGroupForFlow('solar', 'house')}
							${this.getGroupForFlow('solar', 'grid')}
							${this.getGroupForFlow('solar', 'battery')}
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
						return SVGUtils.getCurvePath(50, 25, 75, 50, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 5, 35);
				}
			case 'battery-to-house':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(75, 50, 50, 75, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 30, 35);
				}
			case 'battery-to-grid':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(50, 75, 25, 50, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 55, 35);
				}
			case 'grid-to-battery':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(50, 75, 25, 50, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 55, 35);
				}
			case 'solar-to-grid':
				switch (this._entityLayout) {
					case 'cross':
						return SVGUtils.getCurvePath(25, 50, 50, 25, -90);
					case 'square':
					case 'circle':
					default:
						return SVGUtils.getCirclePath(15, 80, 35);
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
	}

  `
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card': GivTCPPowerFlowCard
	}
}