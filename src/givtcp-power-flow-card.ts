/* eslint-disable @typescript-eslint/no-explicit-any */
import { LovelaceCardConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor';
import './entity';
import './layout/layout-cross';
import './layout/layout-circle';
import './layout/layout-square';

import { HassEntity } from 'home-assistant-js-websocket';

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
	CORNER_RADIUS_DEFAULT,
	LINE_STYLE_DEFAULT,
	EPS_ENABLED_DEFAULT,
	CUSTOM1_ICON_DEFAULT,
	CUSTOM2_ICON_DEFAULT,
	EPS_ICON_DEFAULT,
	CUSTOM1_ENABLED_DEFAULT,
	CUSTOM2_ENABLED_DEFAULT,
} from './const';
import { ConfigUtils } from './utils/config-utils';

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
		{ from: 'house', to: 'custom1', direction: FlowDirection.Out },
		{ from: 'house', to: 'custom2', direction: FlowDirection.Out },
	];

	private _width!: number;
	private _resizeObserver!: ResizeObserver;
	private _animate!: boolean;
	private _previousTimeStamp!: number;

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('givtcp-power-flow-card-editor') as LovelaceCardEditor;
	}
	private get _activeFlows(): { from: string; to: string; direction: FlowDirection }[] {
		return this.flows.filter((flow) => {
			if (!this._solarEnabled && flow.from === 'solar') return false;
			if (!this._batteryEnabled && (flow.from === 'battery' || flow.to === 'battery')) return false;
			if (!this._custom1Enabled && flow.to === 'custom1') return false;
			if (!this._custom2Enabled && flow.to === 'custom2') return false;
			if (!this._epsEnabled && flow.to === 'eps') return false;
			return true;
		});
	}
	private get _custom1Extra(): string | undefined {
		const entity: HassEntity = this.hass.states[this._config?.custom1_extra_sensor];
		return !entity || !this._custom1Enabled ? undefined : this.getFormatedState(entity);
	}
	private get _custom2Extra(): string | undefined {
		const entity = this.hass.states[this._config?.custom2_extra_sensor];
		return !entity || !this._custom2Enabled ? undefined : this.getFormatedState(entity);
	}
	private get _epsEnabled(): boolean {
		return this._config?.eps_enabled == undefined || !this._batteryEnabled
			? EPS_ENABLED_DEFAULT
			: this._config?.eps_enabled;
	}
	private get _epsTotal(): FlowTotal | undefined {
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_eps_power`];
		return !entity || !this._epsEnabled
			? undefined
			: {
					total: parseInt(entity.state, 10),
					parts: [{ type: 'eps', value: parseInt(entity.state, 10) }],
			  };
	}
	private get _custom1Total(): FlowTotal | undefined {
		const entity = this.hass.states[this._config?.custom1_sensor];
		return !entity || !this._custom1Enabled
			? undefined
			: {
					total: this.getStateAsWatts(entity),
					parts: [{ type: 'custom1', value: this.getStateAsWatts(entity) }],
			  };
	}
	private get _custom2Total(): FlowTotal | undefined {
		const entity = this.hass.states[this._config?.custom2_sensor];
		return !entity || !this._custom2Enabled
			? undefined
			: {
					total: this.getStateAsWatts(entity),
					parts: [{ type: 'custom2', value: this.getStateAsWatts(entity) }],
			  };
	}
	private get _custom1Enabled(): boolean {
		return this._config?.custom1_enabled == undefined ? CUSTOM1_ENABLED_DEFAULT : this._config?.custom1_enabled;
	}
	private get _custom2Enabled(): boolean {
		return this._config?.custom2_enabled == undefined ? CUSTOM2_ENABLED_DEFAULT : this._config?.custom2_enabled;
	}
	private get _custom1Name(): string {
		return this._config?.custom1_name || 'Custom 1';
	}
	private get _custom2Name(): string {
		return this._config?.custom2_name || 'Custom 2';
	}
	private get _lineStyle(): string {
		return this._config?.line_style || LINE_STYLE_DEFAULT;
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
	private get _cornerRadius(): number {
		return this._config?.corner_radius || CORNER_RADIUS_DEFAULT;
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
		return this._config?.line_gap === undefined ? LINE_GAP_DEFAULT : this._config?.line_gap;
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
	private getFormatedState(entity: HassEntity): string {
		return `${entity.state}${entity.attributes.unit_of_measurement || ''}`;
	}
	private getStateAsWatts(entity: HassEntity): number {
		if (entity.state === undefined) {
			return 0;
		}
		if (entity.attributes.unit_of_measurement === undefined) {
			return parseInt(entity.state, 10);
		}
		switch (entity.attributes.unit_of_measurement.toLowerCase()) {
			case 'w':
				return parseInt(entity.state, 10);
			case 'kw':
				return parseInt(entity.state, 10) * 1000;
			case 'wh':
				return parseInt(entity.state, 10) / 3600;
			case 'kwh':
				return (parseInt(entity.state, 10) * 1000) / 3600;
			default:
				return parseInt(entity.state, 10);
		}
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
			case 'eps':
				return this._config?.eps_icon || EPS_ICON_DEFAULT;
			case 'custom1':
				return this._config?.custom1_icon || CUSTOM1_ICON_DEFAULT;
			case 'custom2':
				return this._config?.custom2_icon || CUSTOM2_ICON_DEFAULT;
			default:
				return '';
		}
	}
	private getDemoPowerForFlow(from: string, to: string): number | undefined {
		let entity;
		if (to === 'custom1') {
			entity = entity = this.hass.states[this._config?.custom1_sensor];
		} else if (to === 'custom2') {
			entity = entity = this.hass.states[this._config?.custom2_sensor];
		} else {
			entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_${from}_to_${to}`];
		}
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
			} else if (from === 'house' && to === 'custom1') {
				return 800;
			} else if (from === 'house' && to === 'custom2') {
				return 1000;
			}
			return 0;
		}
		return undefined;
	}
	private getCleanPowerForFlow(from: string, to: string): number | undefined {
		if (!this._batteryEnabled && (from === 'battery' || to === 'battery')) return undefined;
		if (!this._solarEnabled && (from === 'solar' || to === 'solar')) return undefined;
		if (!this._epsEnabled && (from === 'eps' || to === 'eps')) return undefined;
		if (!this._custom1Enabled && (from === 'custom1' || to === 'custom1')) return undefined;
		if (!this._custom2Enabled && (from === 'custom2' || to === 'custom2')) return undefined;
		if (this._config?.demo_mode) return this.getDemoPowerForFlow(from, to);
		if (to === 'custom1') {
			return this._custom1Total ? this.cleanSensorData(this._custom1Total.total) : undefined;
		} else if (to === 'custom2') {
			return this._custom2Total ? this.cleanSensorData(this._custom2Total.total) : undefined;
		} else if (to === 'eps') {
			return this._epsTotal ? this.cleanSensorData(this._epsTotal.total) : undefined;
		}
		const entity = this.hass.states[`sensor.givtcp_${this._invertorSerial}_${from}_to_${to}`];
		return entity !== undefined ? this.cleanSensorData(parseFloat(entity?.state)) : undefined;
	}
	private cleanSensorData(amount: number): number {
		return amount < this._powerMargin ? 0 : amount;
	}
	private getTotalFor(type: string, direction: FlowDirection): FlowTotal | undefined {
		switch (type) {
			case 'eps':
				return this._epsTotal;
			case 'custom1':
				return this._custom1Total;
			case 'custom2':
				return this._custom2Total;
			default:
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
	}
	constructor() {
		super();
	}
	private setEntitySize(width: number): void {
		setTimeout(() => {
			this._width = width;
			this.style.setProperty('--gtpc-size', this._width / this._entitySize + 'px');
			// this.style.setProperty('--gtpc-circle-offset', `${(width - (this._circleSize / 50) * width)}px`);
			this.requestUpdate();
		}, 0);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => {
			const elem = <Element>this.shadowRoot?.querySelector(`.gtpc-content`);
			if (elem) {
				if (elem.clientWidth != this._width) this.setEntitySize(elem.clientWidth);
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
				type: 'eps',
				icon: this.getIconFor('eps'),
				name: 'EPS',
				out: this.getTotalFor('eps', FlowDirection.Out),
			},
			{
				type: 'custom1',
				icon: this.getIconFor('custom1'),
				name: this._custom1Name,
				extra: this._custom1Extra,
				out: this.getTotalFor('custom1', FlowDirection.Out),
			},
			{
				type: 'custom2',
				icon: this.getIconFor('custom2'),
				name: this._custom2Name,
				extra: this._custom2Extra,
				out: this.getTotalFor('custom2', FlowDirection.Out),
			},
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
		let classes = 'gtpc-content';
		if (this._epsEnabled) classes += ' gtpc-eps';
		if (this._custom1Enabled) classes += ' gtpc-custom1';
		if (this._custom2Enabled) classes += ' gtpc-custom2';
		switch (this._entityLayout) {
			case EntityLayout.Cross:
				layout = html`<givtcp-power-flow-card-layout-cross
					class="${classes}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.lineWidth=${this._lineWidth}
					.lineGap=${this._lineGap}
					.cornerRadius=${this._cornerRadius}
					.entitySize=${this._entitySize}
					.custom1Enabled=${this._custom1Enabled}
					.custom2Enabled=${this._custom2Enabled}
				/>`;
				break;
			case EntityLayout.Square:
				layout = html`<givtcp-power-flow-card-layout-square
					class="${classes}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.lineWidth=${this._lineWidth}
					.lineGap=${this._lineGap}
					.lineStyle=${this._lineStyle}
					.entitySize=${this._entitySize}
					.custom1Enabled=${this._custom1Enabled}
					.custom2Enabled=${this._custom2Enabled}
				/>`;
				break;
			case EntityLayout.Circle:
				layout = html`<givtcp-power-flow-card-layout-circle
					class="${classes}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.lineWidth=${this._lineWidth}
					.centreEntity=${this._centreEntity}
					.circleSize=${this._circleSize}
					.entitySize=${this._entitySize}
					.custom1Enabled=${this._custom1Enabled}
					.custom2Enabled=${this._custom2Enabled}
				/>`;
				break;
			default:
				return html``;
		}
		return html`<ha-card header="${this._config?.name}">
			${this._width > 0
				? html`<div class="card-content">${layout}</div>`
				: html`<div class="card-content"><div class="${classes}" /></div>`}
		</ha-card>`;
	}
	private entityDetails(evt: CustomEvent): void {
		evt.stopPropagation();
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
			case 'eps':
				fireEvent(this, 'hass-more-info', { entityId: `sensor.givtcp_${this._invertorSerial}_eps_power` });
				break;
			case 'custom1':
				fireEvent(this, 'hass-more-info', { entityId: this._config?.custom1_sensor });
				break;
			case 'custom2':
				fireEvent(this, 'hass-more-info', { entityId: this._config?.custom2_sensor });
				break;
			case 'house':
				fireEvent(this, 'hass-more-info', { entityId: `sensor.givtcp_${this._invertorSerial}_load_power` });
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

		const elem = <Element>this.shadowRoot?.querySelector(`.gtpc-content`);
		if (elem) {
			this.setEntitySize(elem.clientWidth);
		}
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
		.gtpc-content,
		.gtpc-layout > svg {
			display: block;
		}
		givtcp-power-flow-card-entity {
			position: absolute;
			width: var(--gtpc-size);
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
			margin: 30px 0;
		}
		givtcp-power-flow-card-entity[data-type='custom1'],
		givtcp-power-flow-card-entity[data-type='custom2'],
		givtcp-power-flow-card-entity[data-type='house'],
		givtcp-power-flow-card-entity[data-type='eps'],
		givtcp-power-flow-card-entity[data-type='grid'],
		givtcp-power-flow-card-entity[data-type='solar'],
		givtcp-power-flow-card-entity[data-type='battery'] {
			cursor: var(--gtpc-click-cursor);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='custom1'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='custom1'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='custom1'] {
			right: 0;
			top: 0;
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='custom2'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='custom2'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='custom2'] {
			right: 0;
			bottom: 0;
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='eps'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='eps'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='eps'] {
			left: 0;
			bottom: 0;
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'] {
			left: 0;
			top: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='solar'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='solar'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='solar'] {
			top: 0;
			left: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			right: 0;
			top: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='battery'],
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='battery'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='battery'] {
			bottom: 0;
			left: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-no-solar.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-solar.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-solar.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			top: 0;
		}
		.gtpc-no-battery.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-battery.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-battery.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-battery.gtpc-layout-circle > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-battery.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-battery.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			bottom: 0;
			top: initial;
		}
		.gtpc-line-style-angled.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='eps'] {
			left: var(--gtpc-size);
			bottom: var(--gtpc-size);
		}
		.gtpc-line-style-angled.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='custom1'] {
			right: var(--gtpc-size);
			top: var(--gtpc-size);
		}
		.gtpc-line-style-angled.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='custom2'] {
			right: var(--gtpc-size);
			bottom: var(--gtpc-size);
		}
		givtcp-power-flow-card-layout-square.gtpc-custom2
			.gtpc-line-style-curved.gtpc-layout-square
			.gtpc-entity-name[data-entity-type='house'],
		givtcp-power-flow-card-layout-cross.gtpc-custom2 .gtpc-entity-name[data-entity-type='house'] {
			display: none;
		}
		.gtpc-layout-circle .gtpc-entity-name[data-entity-type='grid'] {
			display: none;
		}
		.gtpc-layout-circle .gtpc-entity-name[data-entity-type='house'] {
			display: none;
		}
		.gtpc-line-style-straight.gtpc-layout-square .gtpc-entity-name[data-entity-type='grid'],
		.gtpc-line-style-angled.gtpc-layout-square .gtpc-entity-name[data-entity-type='grid'] {
			display: none;
		}
		.gtpc-line-style-straight.gtpc-layout-square .gtpc-entity-name[data-entity-type='house'],
		.gtpc-line-style-angled.gtpc-layout-square .gtpc-entity-name[data-entity-type='house'] {
			display: none;
		}

		.gtpc-entity {
			z-index: 2;
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			justify-content: center;
			align-items: center;
			align-content: normal;
			width: var(--gtpc-size);
			aspect-ratio: 1 / 1;
			box-sizing: border-box;
			overflow: hidden;
		}
		.gtpc-entity > * {
			display: block;
			flex-grow: 0;
			flex-shrink: 1;
			flex-basis: auto;
			align-self: auto;
			order: 0;
			z-index: 2;
		}
		.gtpc-entity > span[data-power='0'] {
			display: none;
		}
		.gtpc-entity.gtpc-entity-single > span > ha-icon {
			display: none;
		}
		.gtpc-entity-extra,
		.gtpc-entity-in,
		.gtpc-entity-out,
		.gtpc-entity-name {
			color: var(--gtpc-icons-and-text-colour, var(--gtpc-color));
			box-sizing: border-box;
			font-size: calc(var(--gtpc-size) * 0.15);
			--mdc-icon-size: calc(var(--gtpc-size) * 0.15);
			line-height: 1;
		}
		.gtpc-entity-icon {
			--mdc-icon-size: calc(var(--gtpc-size) * 0.3);
			color: var(--gtpc-icons-and-text-colour, var(--gtpc-color));
		}
		.gtpc-entity-name {
			text-align: center;
			position: absolute;
			bottom: calc(var(--gtpc-size) * -0.2);
		}
		.gtpc-entity-name[data-entity-type='custom1'],
		.gtpc-entity-name[data-entity-type='solar'] {
			bottom: initial;
			top: calc(var(--gtpc-size) * -0.2);
		}
		givtcp-power-flow-card-entity > svg {
			position: absolute;
			z-index: 0;
		}
		givtcp-power-flow-card-entity > svg > path {
			fill: var(--ha-card-background, var(--card-background-color, white));
			stroke-width: var(--gtpc-line-size);
			vector-effect: non-scaling-stroke;
		}
	`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card': GivTCPPowerFlowCard;
	}
}
