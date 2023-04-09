/* eslint-disable @typescript-eslint/no-explicit-any */
import { LovelaceCardConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor';
import './entity';
import './layout-cross';
import './layout-circle';
import './layout-square';

import { CentreEntity, FlowData, EntityLayout, FlowDirection, FlowTotal } from './types';
import {
	CENTRE_ENTITY_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	ENTITY_LAYOUT_DEFAULT,
	HIDE_INACTIVE_FLOWS_DEFAULT,
	COLOUR_ICONS_AND_TEXT_DEFAULT,
	BATTERY_ICON_DEFAULT,
	GRID_ICON_DEFAULT,
	HOUSE_ICON_DEFAULT,
	SOLAR_ICON_DEFAULT,
	LINE_GAP_DEFAULT,
	LINE_WIDTH_DEFAULT,
	POWER_MARGIN_DEFAULT,
	PERCENTAGE,
	DOT_SIZE_DEFAULT,
	DOT_SPEED_DEFAULT,
	ENTITY_SIZE_DEFAULT,
	ENTITIES,
	SOLAR_ENABLED_DEFAULT,
} from './const';
import { ConfigUtils } from './config-utils';

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

	private flows: { from: string; to: string; direction: FlowDirection }[] = [
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

	private get _activeFlows(): { from: string; to: string; direction: FlowDirection }[] {
		return this.flows.filter((flow) => {
			if (!this._solarEnabled && flow.from === 'solar') return false;
			if (!this._batteryEnabled && (flow.from === 'battery' || flow.to === 'battery')) return false;
			return true;
		});
	}
	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('givtcp-power-flow-card-editor') as LovelaceCardEditor;
	}
	private get _entitySize(): number {
		return 10 - (this._config?.entity_size || ENTITY_SIZE_DEFAULT);
	}
	private get _dotSpeed(): number {
		return this._config?.dot_speed || DOT_SPEED_DEFAULT;
	}
	private get _dotSize(): number {
		return this._config?.dot_size || DOT_SIZE_DEFAULT;
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
		try {
			return this._config?.invertor && this.hass.states[this._config?.invertor]
				? this.hass.states[this._config?.invertor].state.toLowerCase() || ''
				: '';
		} catch (e) {
			console.error(e);
			return '';
		}
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
		return this._config?.hide_inactive_flows == undefined
			? HIDE_INACTIVE_FLOWS_DEFAULT
			: this._config?.hide_inactive_flows;
	}
	private get _colourIconsAndText(): boolean {
		return this._config?.colour_icons_and_text == undefined
			? COLOUR_ICONS_AND_TEXT_DEFAULT
			: this._config?.colour_icons_and_text;
	}
	private get _solarEnabled(): boolean {
		return this._config?.solar_enabled == undefined ? SOLAR_ENABLED_DEFAULT : this._config?.solar_enabled;
	}
	private get _batteryEnabled(): boolean {
		return this._config?.battery_enabled == undefined ? true : this._config?.battery_enabled;
	}
	private getIconFor(type: string, level: undefined | number = undefined): string {
		let icon;
		switch (type) {
			case 'solar':
				return this._config?.solar_icon || SOLAR_ICON_DEFAULT;
			case 'battery':
				icon = this._config?.battery_icon || BATTERY_ICON_DEFAULT;
				if (icon === BATTERY_ICON_DEFAULT && level !== undefined) {
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
				return this._config?.grid_icon || GRID_ICON_DEFAULT;
			case 'house':
				return this._config?.house_icon || HOUSE_ICON_DEFAULT;
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
		if (!this._batteryEnabled && (from === 'battery' || to === 'battery')) return undefined;
		if (!this._solarEnabled && (from === 'solar' || to === 'solar')) return undefined;
		if (this._config?.demo_mode) return this.getDemoPowerForFlow(from, to);
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_${from}_to_${to}`];
		return entity !== undefined ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private cleanSensorData(amount: number): number {
		return amount < this._powerMargin ? 0 : amount;
	}
	private getTotalFor(type: string, direction: FlowDirection): FlowTotal | undefined {
		return this._activeFlows.reduce((acc: FlowTotal | undefined, flow) => {
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
	private setEntitySize(width: number): void {
		setTimeout(() => {
			this._width = width;
			this.style.setProperty('--gtpc-size', Math.round(width / this._entitySize) + 'px');
			this.requestUpdate();
		}, 0);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver((changes) => {
			for (const change of changes) {
				if (change.contentRect.width !== this._width) {
					this.setEntitySize(change.contentRect.width);
				}
			}
		});
		this._resizeObserver.observe(this);
		this.style.display = 'block';
		window.requestAnimationFrame((timestamp) => {
			this._animate = true;
			this.animateFlows(timestamp);
		});
	}
	private animateFlows(timestamp: number): void {
		const elapsed = timestamp - this._previousTimeStamp;
		this._activeFlows.forEach((flow) => {
			this.advanceFlowDot(elapsed, flow.from, flow.to, flow.direction);
		});
		this._previousTimeStamp = timestamp;
		//TODO: reorder flows so that the ones with the most power are on top
		//parent.insertBefore(parent.removeChild(gRobot), gDoorway)
		if (this._animate) {
			window.requestAnimationFrame((timestamp) => {
				this.animateFlows(timestamp);
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
		const circle = <SVGCircleElement>g.querySelector('circle');

		const power = this.getCleanPowerForFlow(from, to);
		if (power === undefined) {
			return;
		}
		let pos = parseFloat(g.getAttribute('data-pos') || '0');
		circle.setAttribute('visibility', power ? 'visible' : 'hidden');
		const lineLength = path.getTotalLength();
		const point = path.getPointAtLength(lineLength * pos);
		circle.setAttributeNS(null, 'cx', point.x.toString());
		circle.setAttributeNS(null, 'cy', point.y.toString());
		circle.setAttributeNS(null, 'r', (this._dotSize / 4).toString());
		const moveBy = (elapsed * power * this._dotSpeed) / 10000 / 1000;
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
	render(): TemplateResult {
		const flowData: FlowData[] = [
			{
				type: 'solar',
				icon: this.getIconFor('solar'),
				name: 'Solar',
				out: this.getTotalFor('solar', FlowDirection.Out),
			},
			{
				type: 'house',
				icon: this.getIconFor('house'),
				name: 'House',
				in: this.getTotalFor('house', FlowDirection.In),
			},
			{
				type: 'grid',
				icon: this.getIconFor('grid'),
				name: 'Grid',
				out: this.getTotalFor('grid', FlowDirection.In),
				in: this.getTotalFor('grid', FlowDirection.Out),
			},
			{
				type: 'battery',
				icon: this.getIconFor('battery', this._batterySoc),
				name: 'Battery',
				extra: this._batterySoc !== undefined ? `${this._batterySoc}${PERCENTAGE}` : undefined,
				out: this.getTotalFor('battery', FlowDirection.Out),
				in: this.getTotalFor('battery', FlowDirection.In),
			},
		].filter((v) => v.in !== undefined || v.out !== undefined);
		let layout = html``;
		switch (this._entityLayout) {
			case EntityLayout.Cross:
				layout = html`<givtcp-power-flow-card-layout-cross
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.lineWidth=${this._lineWidth}
					.hasBattery=${this._batteryEnabled}
					.hasSolar=${this._solarEnabled}
					.lineGap=${this._lineGap}
					.entitySize=${this._entitySize}
				/>`;
				break;
			case EntityLayout.Square:
				layout = html`<givtcp-power-flow-card-layout-square
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.lineWidth=${this._lineWidth}
					.hasBattery=${this._batteryEnabled}
					.hasSolar=${this._solarEnabled}
					.lineGap=${this._lineGap}
					.entitySize=${this._entitySize}
				/>`;
				break;
			case EntityLayout.Circle:
				layout = html`<givtcp-power-flow-card-layout-circle
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.lineWidth=${this._lineWidth}
					.hasBattery=${this._batteryEnabled}
					.hasSolar=${this._solarEnabled}
					.centreEntity=${this._centreEntity}
					.circleSize=${this._circleSize}
					.entitySize=${this._entitySize}
				/>`;
				break;
			default:
				return html``;
		}
		return html`<ha-card header="${this._config?.name}">
			${this._width > 0 ? html`<div class="card-content">${layout}</div>` : html``}
		</ha-card>`;
	}
	private entityDetails(evt: CustomEvent): void {
		evt.stopPropagation();
		console.log(evt.detail.type);
		switch (evt.detail.type) {
			case 'grid':
				fireEvent(this, 'hass-more-info', { entityId: `sensor.givtcp_${this._invertorSerial}_grid_power` });
				break;
			case 'solar':
				fireEvent(this, 'hass-more-info', { entityId: `sensor.givtcp_${this._invertorSerial}_pv_power` });
				break;
			case 'battery':
				fireEvent(this, 'hass-more-info', { entityId: `sensor.givtcp_${this._invertorSerial}_battery_power` });
				break;
			case 'house':
				break;
			default:
		}
	}
	setConfig(config: LovelaceCardConfig): void {
		if (!config.invertor || !config.battery) {
			throw new Error('You need to define battery and invertor entities');
		}
		this._config = ConfigUtils.migrateConfig(config, true);
		const defaults = ConfigUtils.getDefaults(this._config);

		if (this.clientWidth > 0) this.setEntitySize(this.clientWidth);
		this.style.setProperty('--gtpc-line-size', `${this._lineWidth}px`);
		this.style.setProperty('--gtpc-inactive-flow-display', this._hideInactiveFlows ? 'none' : 'block');
		if (this._colourIconsAndText) {
			this.style.removeProperty('--gtpc-icons-and-text-colour');
		} else {
			this.style.setProperty('--gtpc-icons-and-text-colour', 'var(--primary-text-color)');
		}
		ENTITIES.forEach((entity) => {
			let colour = this._config[entity + '_colour'];
			if (!colour) {
				colour = defaults[entity + '_colour'];
			}
			if (typeof colour !== 'string') {
				colour = `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
			} else {
				colour = `var(--${colour}-color)`;
			}
			this.style.setProperty(`--gtpc-${entity}-color`, colour);
		});
	}
	getCardSize(): number {
		return 3;
	}
	static styles = css`
		:host {
			--gtpc-click-cursor: pointer;
			--gtpc-grid-color: var(--primary-text-color);
			--gtpc-solar-color: var(--warning-color);
			--gtpc-house-color: var(--info-color);
			--gtpc-battery-color: var(--success-color);
		}

		givtcp-power-flow-card-entity {
			position: absolute;
			width: var(--gtpc-size);
			aspect-ratio: 1 / 1;
		}
		.gtpc-flow > circle {
			stroke-width: 0;
			stroke: none;
		}
		.gtpc-flow > path {
			fill: none;
			stroke-width: var(--gtpc-line-size);
			vector-effect: non-scaling-stroke;
		}
		.gtpc-flow[data-pos='0'] {
			display: var(--gtpc-inactive-flow-display);
		}
		.gtpc-flow[data-pos='0'] > circle {
			display: none;
		}

		.gtpc-layout {
			position: relative;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
		}
		givtcp-power-flow-card-entity[data-type='grid'],
		givtcp-power-flow-card-entity[data-type='solar'],
		givtcp-power-flow-card-entity[data-type='battery'] {
			cursor: var(--gtpc-click-cursor);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'] {
			left: 0;
			top: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='solar'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='solar'] {
			top: 0;
			left: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			right: 0;
			top: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='battery'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='battery'] {
			bottom: 0;
			left: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-no-solar.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-solar.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			top: 0;
		}
		.gtpc-no-battery.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-battery.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-battery.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-battery.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			bottom: 0;
			top: initial;
		}
	`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card': GivTCPPowerFlowCard;
	}
}
