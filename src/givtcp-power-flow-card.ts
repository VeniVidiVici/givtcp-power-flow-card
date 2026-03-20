/* eslint-disable @typescript-eslint/no-explicit-any */
import { LovelaceCardConfig, HomeAssistant, LovelaceCard, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor';
import './entity';
import './details';
import './layout/layout-cross';
import './layout/layout-circle';
import './layout/layout-square';
import './layout/layout-list';

import { HassEntity } from 'home-assistant-js-websocket';

import {
	CentreEntity,
	FlowData,
	EntityLayout,
	FlowDirection,
	FlowTotal,
	FlowPower,
	DotEasing,
	entityName,
} from './types';
import { formatPower } from './utils/power-utils';
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
	SINGLE_BATTERY_DEFAULT,
	SINGLE_INVERTOR_DEFAULT,
	DETAILS_ENABLED_DEFAULT,
	NUM_DETAIL_COLUMNS_DEFAULT,
	GRID_DOT_EASING_DEFAULT,
	HOUSE_DOT_EASING_DEFAULT,
	SOLAR_DOT_EASING_DEFAULT,
	BATTERY_DOT_EASING_DEFAULT,
	CUSTOM1_DOT_EASING_DEFAULT,
	CUSTOM2_DOT_EASING_DEFAULT,
	EPS_DOT_EASING_DEFAULT,
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
	private get _gridDotEasing(): DotEasing {
		return this._config?.grid_dot_easing === undefined ? GRID_DOT_EASING_DEFAULT : this._config?.grid_dot_easing;
	}
	private get _houseDotEasing(): DotEasing {
		return this._config?.house_dot_easing === undefined ? HOUSE_DOT_EASING_DEFAULT : this._config?.house_dot_easing;
	}
	private get _solarDotEasing(): DotEasing {
		return this._config?.solar_dot_easing === undefined ? SOLAR_DOT_EASING_DEFAULT : this._config?.solar_dot_easing;
	}
	private get _batteryDotEasing(): DotEasing {
		return this._config?.battery_dot_easing === undefined
			? BATTERY_DOT_EASING_DEFAULT
			: this._config?.battery_dot_easing;
	}
	private get _epsDotEasing(): DotEasing {
		return this._config?.eps_dot_easing === undefined ? EPS_DOT_EASING_DEFAULT : this._config?.eps_dot_easing;
	}
	private get _custom1DotEasing(): DotEasing {
		return this._config?.custom1_dot_easing === undefined
			? CUSTOM1_DOT_EASING_DEFAULT
			: this._config?.custom1_dot_easing;
	}
	private get _custom2DotEasing(): DotEasing {
		return this._config?.custom2_dot_easing === undefined
			? CUSTOM2_DOT_EASING_DEFAULT
			: this._config?.custom2_dot_easing;
	}
	private get _epsEnabled(): boolean {
		return this._config?.eps_enabled === undefined || !this._batteryEnabled
			? EPS_ENABLED_DEFAULT
			: this._config?.eps_enabled;
	}
	private get _detailsEnabled(): boolean {
		return this._config?.details_enabled === undefined ? DETAILS_ENABLED_DEFAULT : this._config?.details_enabled;
	}
	private get _detailEntities(): HassEntity[] {
		return this._detailsEnabled ? this._config?.detail_entities?.map((e: string) => this.hass.states[e]) : [];
	}
	private get _epsTotal(): FlowTotal | undefined {
		return this._inverterName && this._epsEnabled
			? this._inverterName.reduce(
					(acc, name) => {
						const entity = this.hass.states[`sensor.${name.prefix}_eps_power${name.suffix}`];
						if (entity) {
							const value = this.parseNumericState(entity);
							if (value !== undefined) {
								acc.total += value;
								acc.parts.push({ type: 'eps', value });
							}
						}
						return acc;
					},
					{ total: 0, parts: [] } as FlowTotal,
				)
			: undefined;
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
	private get _singleInverter(): boolean {
		return this._config?.single_invertor === undefined ? SINGLE_INVERTOR_DEFAULT : this._config?.single_invertor;
	}
	private get _singleBattery(): boolean {
		return this._config?.single_battery === undefined ? SINGLE_BATTERY_DEFAULT : this._config?.single_battery;
	}
	private get _custom1Enabled(): boolean {
		return this._config?.custom1_enabled === undefined ? CUSTOM1_ENABLED_DEFAULT : this._config?.custom1_enabled;
	}
	private get _custom2Enabled(): boolean {
		return this._config?.custom2_enabled === undefined ? CUSTOM2_ENABLED_DEFAULT : this._config?.custom2_enabled;
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
		const allSoc = this._inverterName
			.map((name) => {
				const entity = this.hass.states[`sensor.${name.prefix}_soc${name.suffix}`];
				return entity ? this.parseNumericState(entity) : undefined;
			})
			.filter((soc) => soc !== undefined) as number[];

		if (allSoc.length === 0) {
			return undefined;
		}

		const sum = allSoc.reduce((a, b) => a + b, 0);
		return Math.max(0, Math.min(Math.round(sum / allSoc.length), 100));
	}
	private get _inverterCount(): number {
		return this._inverterName.length;
	}
	private get _batteryCount(): number {
		if (this._singleBattery) {
			return this._config?.battery ? 1 : 0;
		}
		return this._config?.batteries?.length || 0;
	}
	private getEntityLabel(type: string): string {
		switch (type) {
			case 'battery':
				return this._batteryCount > 1 ? 'Batteries' : 'Battery';
			case 'solar':
				return this._inverterCount > 1 ? 'Solar' : 'Solar';
			case 'grid':
				return 'Grid';
			case 'house':
				return 'House';
			default:
				return type;
		}
	}
	private getEntityCountExtra(type: string): string | undefined {
		switch (type) {
			case 'battery':
				return this._batteryCount > 1 ? `${this._batteryCount} units` : undefined;
			case 'solar':
				return this._inverterCount > 1 ? `${this._inverterCount} inverters` : undefined;
			default:
				return undefined;
		}
	}
	private getSolarInputTotal(sensorIds: string[] | undefined): number | undefined {
		if (!sensorIds?.length) {
			return undefined;
		}
		const values = sensorIds
			.map((entityId) => this.hass.states[entityId])
			.filter((entity): entity is HassEntity => entity !== undefined)
			.map((entity) => this.getStateAsWatts(entity))
			.filter((value) => value > 0);

		if (!values.length) {
			return undefined;
		}

		return values.reduce((total, value) => total + value, 0);
	}
	private get _solarExtra(): string | undefined {
		const lines = [this.getEntityCountExtra('solar')].filter((value): value is string => !!value);
		const input1 = this.getSolarInputTotal(this._config?.solar_input_1_sensors);
		const input2 = this.getSolarInputTotal(this._config?.solar_input_2_sensors);

		if (input1 !== undefined) {
			lines.push(`PV1 ${formatPower(input1)}`);
		}
		if (input2 !== undefined) {
			lines.push(`PV2 ${formatPower(input2)}`);
		}

		return lines.length ? lines.join('\n') : undefined;
	}
	private isAggregateEntity(type: string): boolean {
		switch (type) {
			case 'battery':
				return this._batteryCount > 1;
			case 'solar':
				return this._inverterCount > 1;
			default:
				return false;
		}
	}
	private scaleFlowTotal(flow: FlowTotal | undefined, nextTotal: number): FlowTotal | undefined {
		if (!flow || flow.total <= 0 || nextTotal <= 0) {
			return undefined;
		}
		const scale = nextTotal / flow.total;
		return {
			total: nextTotal,
			parts: flow.parts.map((part) => ({
				...part,
				value: part.value * scale,
			})),
		};
	}
	private getZeroFlowTotal(): FlowTotal {
		return { total: 0, parts: [] };
	}
	private getDisplayTotals(type: string): { in?: FlowTotal; out?: FlowTotal } {
		const incoming = this.getTotalFor(type, FlowDirection.In);
		const outgoing = this.getTotalFor(type, FlowDirection.Out);

		if (this._singleInverter || (type !== 'grid' && type !== 'battery') || !incoming || !outgoing) {
			return { in: incoming, out: outgoing };
		}

		if (incoming.total === outgoing.total) {
			return { in: this.getZeroFlowTotal() };
		}

		if (incoming.total > outgoing.total) {
			return { in: this.scaleFlowTotal(incoming, incoming.total - outgoing.total) };
		}

		return { out: this.scaleFlowTotal(outgoing, outgoing.total - incoming.total) };
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
	private get _inverterName(): entityName[] {
		if (this._singleInverter) {
			// try {
			// 	return this._config?.invertor && this.hass.states[this._config?.invertor]
			// 		? [this.hass.states[this._config?.invertor].state.toLowerCase()] || []
			// 		: [];
			// } catch (e) {
			// 	console.error(e);
			// 	return [];
			// }
			try {
				const name = this.extractInvertorName(this._config?.invertor);
				return name ? [name] : [];
			} catch (e) {
				console.error(e);
				return [];
			}
		} else {
			try {
				return this._config?.invertors?.map((invertor: string) => this.extractInvertorName(invertor)) || [];
			} catch (e) {
				console.error(e);
				return [];
			}
			// try {
			// 	return (
			// 		this._config?.invertors
			// 			?.filter((invertor: string) => this.hass.states[invertor])
			// 			.map((invertor: string) => this.hass.states[invertor].state.toLowerCase() || '') || []
			// 	);
			// } catch (e) {
			// 	console.error(e);
			// 	return [];
			// }
		}
	}
	private get _primaryInverter(): entityName | undefined {
		return this._inverterName[0];
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
	private get _entityLineWidth(): number {
		return this._config?.entity_line_width || this._lineWidth;
	}
	private get _numColumn(): number {
		return this._config?.num_detail_columns || NUM_DETAIL_COLUMNS_DEFAULT;
	}
	private get _hideInactiveFlows(): boolean {
		return this._config?.hide_inactive_flows === undefined
			? HIDE_INACTIVE_FLOWS_DEFAULT
			: this._config?.hide_inactive_flows;
	}
	private get _colourIconsAndText(): boolean {
		return this._config?.colour_icons_and_text === undefined
			? COLOUR_ICONS_AND_TEXT_DEFAULT
			: this._config?.colour_icons_and_text;
	}
	private get _solarEnabled(): boolean {
		return this._config?.solar_enabled === undefined ? SOLAR_ENABLED_DEFAULT : this._config?.solar_enabled;
	}
	private get _batteryEnabled(): boolean {
		return this._config?.battery_enabled === undefined ? true : this._config?.battery_enabled;
	}
	private getFormatedState(entity: HassEntity): string {
		return `${entity?.state}${entity?.attributes.unit_of_measurement || ''}`;
	}
	private parseNumericState(entity: HassEntity): number | undefined {
		const value = parseFloat(entity.state);
		return Number.isFinite(value) ? value : undefined;
	}
	private getStateAsWatts(entity: HassEntity): number {
		const value = this.parseNumericState(entity);
		if (value === undefined) {
			return 0;
		}
		if (entity.attributes.unit_of_measurement === undefined) {
			return value;
		}
		switch (entity.attributes.unit_of_measurement.toLowerCase()) {
			case 'w':
				return value;
			case 'kw':
				return value * 1000;
			case 'wh':
				return value / 3600;
			case 'kwh':
				return (value * 1000) / 3600;
			default:
				return value;
		}
	}
	private _dotEasingFor(type: string): DotEasing {
		switch (type) {
			case 'solar':
				return this._solarDotEasing;
			case 'battery':
				return this._batteryDotEasing;
			case 'grid':
				return this._gridDotEasing;
			case 'house':
				return this._houseDotEasing;
			case 'eps':
				return this._epsDotEasing;
			case 'custom1':
				return this._custom1DotEasing;
			case 'custom2':
				return this._custom2DotEasing;
			default:
				return DotEasing.Linear;
		}
	}
	private getIconFor(type: string, level: undefined | number = undefined): string {
		let icon: string;
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
					if (soc < 100) {
						icon = icon + '-' + soc.toString();
					}
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
	private extractInvertorName(str: string): entityName | undefined {
		const name = { prefix: '', suffix: '' };
		const prefixMatch = /sensor\.([\w]+)_invertor_serial_number/g.exec(str);
		if (prefixMatch) {
			name.prefix = prefixMatch[1];
		}

		const suffixMatch = /sensor\.[\w]+_invertor_serial_number_(\d+)/g.exec(str);
		if (suffixMatch) {
			name.suffix = '_' + suffixMatch[1];
		}
		return name.suffix === '' && name.prefix === '' ? undefined : name;
	}
	private getDemoPowerForFlow(from: string, to: string): number | undefined {
		const inverter = this._primaryInverter;
		let entity: HassEntity | undefined;
		if (to === 'custom1') {
			entity = entity = this.hass.states[this._config?.custom1_sensor];
		} else if (to === 'custom2') {
			entity = entity = this.hass.states[this._config?.custom2_sensor];
		} else if (!inverter) {
			return undefined;
		} else {
			entity = this.hass.states[`sensor.${inverter.prefix}_${from}_to_${to}${inverter.suffix}`];
		}
		if (entity !== undefined) {
			if (from === 'grid' && to === 'house') {
				return 0;
			} else if (from === 'solar' && to === 'house') {
				return 870;
			} else if (from === 'solar' && to === 'battery') {
				return 3600;
			} else if (from === 'battery' && to === 'house') {
				return 0;
			} else if (from === 'battery' && to === 'grid') {
				return 0;
			} else if (from === 'grid' && to === 'battery') {
				return 0;
			} else if (from === 'solar' && to === 'grid') {
				return 567;
			} else if (from === 'house' && to === 'custom1') {
				return 0;
			} else if (from === 'house' && to === 'custom2') {
				return 0;
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
		return this._inverterName.reduce((acc, name) => {
			const entity = this.hass.states[`sensor.${name.prefix}_${from}_to_${to}${name.suffix}`];
			if (entity !== undefined) {
				acc += this.cleanSensorData(parseFloat(entity?.state));
			}
			return acc;
		}, 0);
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
						acc.parts.push({ type: flow.from, to: flow.to, value: power });
						acc.total += power;
					}
					return acc;
				}, undefined);
		}
	}
	constructor() {
		super();
	}
	private get _gridRows(): number | undefined {
		const rows = this._config?.grid_options?.rows;
		return typeof rows === 'number' && Number.isFinite(rows) ? rows : undefined;
	}
	private get _usesDefaultHeightFallback(): boolean {
		return this._gridRows === undefined;
	}
	private getCompactLevel(width: number): number {
		if (this._entityLayout === EntityLayout.Circle) {
			if (width < 180) {
				return 2;
			}
			if (width < 240) {
				return 1;
			}
			return 0;
		}
		const rows = this._gridRows;
		if (rows !== undefined) {
			if (rows <= 2) {
				return 3;
			}
			if (rows <= 3) {
				return 2;
			}
			if (rows <= 4) {
				return 1;
			}
		}
		if (width < 260) {
			return 2;
		}
		if (width < 340) {
			return 1;
		}
		return 0;
	}
	private getListRowCount(): number {
		const count = this._activeFlows
			.map((flow) => this.getCleanPowerForFlow(flow.from, flow.to))
			.filter((value) => value !== undefined).length;

		return Math.max(count, 1);
	}
	private updateResponsiveVars(containerWidth: number, entitySizeWidth = containerWidth): void {
		const compactLevel = this.getCompactLevel(containerWidth);
		const compactContained =
			(this._entityLayout === EntityLayout.Cross || this._entityLayout === EntityLayout.Square) &&
			entitySizeWidth < 140;
		const baseEntitySize =
			this._entityLayout === EntityLayout.List
				? entitySizeWidth
				: this._entityLayout === EntityLayout.Circle
					? entitySizeWidth / (this._entitySize + 0.9)
					: this._entityLayout === EntityLayout.Cross || this._entityLayout === EntityLayout.Square
						? entitySizeWidth / (this._entitySize + 0.36)
						: entitySizeWidth / this._entitySize;
		const textScale = compactLevel === 3 ? 0.68 : compactLevel === 2 ? 0.8 : compactLevel === 1 ? 0.9 : 1;
		const aggregateTextScale = compactLevel === 3 ? 0.62 : compactLevel === 2 ? 0.72 : compactLevel === 1 ? 0.84 : 1;
		const iconScale = compactLevel === 3 ? 0.72 : compactLevel === 2 ? 0.82 : compactLevel === 1 ? 0.92 : 1;
		const lineScale = compactLevel === 3 ? 0.62 : compactLevel === 2 ? 0.75 : compactLevel === 1 ? 0.88 : 1;

		this.style.setProperty('--gtpc-size', `${baseEntitySize}px`);
		this.style.setProperty('--gtpc-text-scale', `${textScale}`);
		this.style.setProperty('--gtpc-aggregate-text-scale', `${aggregateTextScale}`);
		this.style.setProperty('--gtpc-icon-scale', `${iconScale}`);
		this.style.setProperty('--gtpc-line-size', `${this._lineWidth * lineScale}px`);
		this.style.setProperty('--gtpc-entity-line-size', `${this._entityLineWidth * lineScale}px`);
		this.style.setProperty('--gtpc-extra-display', compactLevel >= 2 ? 'none' : 'block');
		this.style.setProperty('--gtpc-contained-label-display', compactContained ? 'none' : 'block');
		this.style.setProperty('--gtpc-contained-extra-display', compactContained ? 'none' : 'block');
		this.style.setProperty('--gtpc-circle-label-display', compactLevel >= 2 ? 'none' : 'block');
		this.style.setProperty('--gtpc-list-row-gap', compactLevel >= 2 ? '2px' : compactLevel === 1 ? '4px' : '6px');
		this.style.setProperty('--gtpc-list-extra-display', compactLevel >= 1 ? 'none' : 'block');
		this.style.setProperty(
			'--gtpc-layout-margin',
			compactLevel === 3 ? '8px 0' : compactLevel === 2 ? '12px 0' : compactLevel === 1 ? '16px 0' : '20px 0',
		);
		this.style.setProperty(
			'--gtpc-top-padding',
			compactLevel === 3 ? '4px' : compactLevel === 2 ? '6px' : compactLevel === 1 ? '8px' : '12px',
		);
	}
	private setEntitySize(width: number): void {
		setTimeout(() => {
			this._width = width;
			const content = this.shadowRoot?.querySelector('.card-content') as HTMLElement | null;
			const fitWidth = this.getResponsiveFitSize(content, width);
			this.updateResponsiveVars(width, fitWidth || width);
			// this.style.setProperty('--gtpc-circle-offset', `${(width - (this._circleSize / 50) * width)}px`);
			this.requestUpdate();
		}, 0);
	}
	private getResponsiveFitSize(content: HTMLElement | null, fallbackWidth: number): number {
		if (this._entityLayout === EntityLayout.List) {
			return this.getResponsiveListSize(content, fallbackWidth);
		}

		const isContainedLayout =
			this._entityLayout === EntityLayout.Circle ||
			this._entityLayout === EntityLayout.Square ||
			this._entityLayout === EntityLayout.Cross;
		if (!isContainedLayout || !content) {
			return fallbackWidth;
		}

		const styles = getComputedStyle(content);
		const horizontalPadding = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
		const verticalPadding = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
		const innerWidth = Math.max((content.clientWidth || fallbackWidth) - horizontalPadding, 0);
		const innerHeight = Math.max((content.clientHeight || fallbackWidth) - verticalPadding, 0);

		return Math.min(innerWidth || fallbackWidth, innerHeight || fallbackWidth);
	}
	private getResponsiveListSize(content: HTMLElement | null, fallbackWidth: number): number {
		if (!content) {
			return fallbackWidth;
		}

		const styles = getComputedStyle(content);
		const horizontalPadding = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
		const verticalPadding = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
		const innerWidth = Math.max((content.clientWidth || fallbackWidth) - horizontalPadding, 0);
		const innerHeight = Math.max((content.clientHeight || fallbackWidth) - verticalPadding, 0);
		const rowCount = this.getListRowCount();
		const rowGap = innerWidth < 260 ? 2 : innerWidth < 340 ? 4 : 6;
		const totalGap = Math.max(rowCount - 1, 0) * rowGap;
		const rowHeight = Math.max((innerHeight - totalGap) / rowCount, 0);
		const widthLimitedSize = innerWidth / this._entitySize;
		const heightLimitedSize = Math.max(rowHeight - 4, 0) * 2;

		return Math.min(widthLimitedSize || fallbackWidth, heightLimitedSize || fallbackWidth);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this._resizeObserver = new ResizeObserver(() => {
			const elem = <Element>this.shadowRoot?.querySelector(`.gtpc-content`);
			if (elem) {
				if (elem.clientWidth !== this._width) this.setEntitySize(elem.clientWidth);
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

	private calculateDotPosition(
		elapsedTime: number,
		lastPosition: number,
		speedFactor: number,
		ease: DotEasing,
	): number {
		const percentPerMillisecond = 0.0075 * speedFactor;
		const pixelsMoved = elapsedTime * percentPerMillisecond;
		const newPosition = lastPosition + pixelsMoved / 100;

		if (newPosition >= 1) {
			return 0; // the dot has completed the path, so it starts again
		}

		let easedPosition: number;
		const t = newPosition;

		// apply ease-in and ease-out effect
		switch (ease) {
			case DotEasing.EaseIn:
				// ease-in effect
				easedPosition = t * t * t;
				break;
			case DotEasing.EaseOut:
				// ease-out effect
				easedPosition = 1 - (1 - t) ** 3;
				break;
			case DotEasing.EaseInOut:
				// ease-in-out effect
				if (t < 0.5) {
					easedPosition = 4 * t ** 3;
				} else {
					easedPosition = 1 - (-2 * t + 2) ** 3 / 2;
				}
				break;
			case DotEasing.Linear:
			default:
				easedPosition = t;
				break;
		}

		return easedPosition;
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
		try {
			const currentPos = parseFloat(g.getAttribute('data-pos') || '0');
			g.setAttribute(
				'data-pos',
				this.calculateDotPosition(elapsed, currentPos, (power / 1000) * this._dotSpeed, DotEasing.Linear).toString(),
			);

			let newDisplayPos = this.calculateDotPosition(
				elapsed,
				currentPos,
				(power / 1000) * this._dotSpeed,
				this._dotEasingFor(from),
			);
			if (direction === FlowDirection.Out) {
				newDisplayPos = 1 - newDisplayPos;
			}

			circle.setAttribute('visibility', power ? 'visible' : 'hidden');
			const lineLength = path.getTotalLength();
			const point = path.getPointAtLength(lineLength * newDisplayPos);
			circle.setAttributeNS(null, 'cx', point.x.toString());
			circle.setAttributeNS(null, 'cy', point.y.toString());
			circle.setAttributeNS(null, 'r', (this._dotSize / 4).toString());

			g.setAttribute('data-power', power.toString());
		} catch (e) {
			console.error(e);
		}
	}
	render(): TemplateResult {
		const batteryTotals = this.getDisplayTotals('battery');
		const gridTotals = this.getDisplayTotals('grid');
		const batteryExtra = [
			this.getEntityCountExtra('battery'),
			this._batterySoc !== undefined ? `${this._batterySoc}${PERCENTAGE}` : undefined,
		]
			.filter((value): value is string => !!value)
			.join(' - ');
		const flowData: FlowData[] = [
			{
				type: 'eps',
				linePos: 90,
				icon: this.getIconFor('eps'),
				name: 'EPS',
				out: this.getTotalFor('eps', FlowDirection.Out),
			},
			{
				type: 'custom1',
				linePos: 180,
				icon: this.getIconFor('custom1'),
				name: this._custom1Name,
				extra: this._custom1Extra,
				out: this.getTotalFor('custom1', FlowDirection.Out),
			},
			{
				type: 'custom2',
				linePos: 0,
				icon: this.getIconFor('custom2'),
				name: this._custom2Name,
				extra: this._custom2Extra,
				out: this.getTotalFor('custom2', FlowDirection.Out),
			},
			{
				type: 'solar',
				linePos: 180,
				icon: this.getIconFor('solar'),
				name: this.getEntityLabel('solar'),
				extra: this._solarExtra,
				aggregate: this.isAggregateEntity('solar'),
				out: this.getTotalFor('solar', FlowDirection.Out),
			},
			{
				type: 'house',
				linePos: 270,
				icon: this.getIconFor('house'),
				name: this.getEntityLabel('house'),
				in: this.getTotalFor('house', FlowDirection.In),
			},
			{
				type: 'grid',
				linePos: 90,
				icon: this.getIconFor('grid'),
				name: this.getEntityLabel('grid'),
				out: gridTotals.in,
				in: gridTotals.out,
			},
			{
				type: 'battery',
				linePos: 0,
				icon: this.getIconFor('battery', this._batterySoc),
				name: this.getEntityLabel('battery'),
				extra: batteryExtra || undefined,
				aggregate: this.isAggregateEntity('battery'),
				out: batteryTotals.in,
				in: batteryTotals.out,
			},
		].filter((v) => v.in !== undefined || v.out !== undefined);
		const flowPowers: FlowPower[] = this._activeFlows
			.map((flow) => ({
				from: flow.from,
				to: flow.to,
				value: this.getCleanPowerForFlow(flow.from, flow.to),
			}))
			.filter((v) => v.value !== undefined) as FlowPower[];

		let layout = html``;
		let layoutHostClasses = '';
		let contentClasses = 'gtpc-content';
		let cardClasses = '';
		if (this._usesDefaultHeightFallback) {
			contentClasses += ' gtpc-default-height';
			cardClasses = 'gtpc-default-height';
		}
		if (this._epsEnabled) {
			layoutHostClasses += ' gtpc-eps';
			contentClasses += ' gtpc-eps';
		}
		if (this._custom1Enabled) {
			layoutHostClasses += ' gtpc-custom1';
			contentClasses += ' gtpc-custom1';
		}
		if (this._custom2Enabled) {
			layoutHostClasses += ' gtpc-custom2';
			contentClasses += ' gtpc-custom2';
		}
		switch (this._entityLayout) {
			case EntityLayout.Cross:
				contentClasses += ' gtpc-content-contained gtpc-content-cross';
				layout = html`<givtcp-power-flow-card-layout-cross
					class="${layoutHostClasses.trim()}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.entityLineWidth=${this._entityLineWidth}
					.lineGap=${this._lineGap}
					.cornerRadius=${this._cornerRadius}
					.entitySize=${this._entitySize}
				/>`;
				break;
			case EntityLayout.Square:
				contentClasses += ' gtpc-content-contained gtpc-content-square';
				layout = html`<givtcp-power-flow-card-layout-square
					class="${layoutHostClasses.trim()}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.entityLineWidth=${this._entityLineWidth}
					.lineGap=${this._lineGap}
					.lineStyle=${this._lineStyle}
					.entitySize=${this._entitySize}
				/>`;
				break;
			case EntityLayout.Circle:
				contentClasses += ' gtpc-content-contained gtpc-content-circle';
				layout = html`<givtcp-power-flow-card-layout-circle
					class="${layoutHostClasses.trim()}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.entityLineWidth=${this._entityLineWidth}
					.centreEntity=${this._centreEntity}
					.circleSize=${this._circleSize}
					.entitySize=${this._entitySize}
				/>`;
				break;
			case EntityLayout.List:
				contentClasses += ' gtpc-content-list';
				layout = html`<givtcp-power-flow-card-layout-list
					class="gtpc-content gtpc-content-list${layoutHostClasses}"
					.flowData=${flowData}
					.flows=${this._activeFlows}
					.flowPowers=${flowPowers}
					@entity-details=${(e: CustomEvent) => this.entityDetails(e)}
					.entityLineWidth=${this._entityLineWidth}
					.entitySize=${this._entitySize}
				/>`;
				break;
			default:
				return html``;
		}
		const details = html`<givtcp-power-flow-card-details .entities=${this._detailEntities} />`;
		return html`<ha-card class="${cardClasses}" header="${this._config?.name}">
			${this._width > 0
				? this._entityLayout === EntityLayout.Circle ||
					this._entityLayout === EntityLayout.Square ||
					this._entityLayout === EntityLayout.Cross
					? html`<div class="card-content ${contentClasses}">
							<div class="gtpc-fit-shell">${layout}</div>
							${details}
						</div>`
					: html`<div class="card-content ${contentClasses}">${layout}${details}</div>`
				: html`<div class="card-content"><div class="${contentClasses}" /></div>`}
		</ha-card>`;
	}
	private entityDetails(evt: CustomEvent): void {
		evt.stopPropagation();
		const inverter = this._primaryInverter;
		switch (evt.detail.type) {
			case 'grid':
				if (!inverter) return;
				fireEvent(this, 'hass-more-info', {
					entityId: `sensor.${inverter.prefix}_grid_power${inverter.suffix}`,
				});
				break;
			case 'solar':
				if (!inverter) return;
				fireEvent(this, 'hass-more-info', {
					entityId: `sensor.${inverter.prefix}_pv_power${inverter.suffix}`,
				});
				break;
			case 'battery':
				if (!inverter) return;
				fireEvent(this, 'hass-more-info', {
					entityId: `sensor.${inverter.prefix}_battery_power${inverter.suffix}`,
				});
				break;
			case 'eps':
				if (!inverter) return;
				fireEvent(this, 'hass-more-info', {
					entityId: `sensor.${inverter.prefix}_eps_power${inverter.suffix}`,
				});
				break;
			case 'custom1':
				fireEvent(this, 'hass-more-info', { entityId: this._config?.custom1_sensor });
				break;
			case 'custom2':
				fireEvent(this, 'hass-more-info', { entityId: this._config?.custom2_sensor });
				break;
			case 'house':
				if (!inverter) return;
				fireEvent(this, 'hass-more-info', {
					entityId: `sensor.${inverter.prefix}_load_power${inverter.suffix}`,
				});
				break;
			default:
		}
	}
	setConfig(config: LovelaceCardConfig): void {
		if (!config.invertor && !config.invertors) {
			throw new Error(
				'You need to define at least one GivTCP invertor serial number entity (for example sensor.*_invertor_serial_number).',
			);
		}
		// if (!config.battery && !config.batteries) {
		// 	throw new Error('You need to define at least one battery entity');
		// }
		this._config = ConfigUtils.migrateConfig(config, true);
		const defaults = ConfigUtils.getDefaults(this._config);

		const elem = <Element>this.shadowRoot?.querySelector(`.gtpc-content`);
		if (elem) {
			this.setEntitySize(elem.clientWidth);
		}

		this.style.setProperty('--gtpc-column-width', `${100 / this._numColumn}%`);
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
		const responsiveWidth = elem ? elem.clientWidth : this._width || this.clientWidth || 0;
		if (responsiveWidth > 0) {
			const content = this.shadowRoot?.querySelector('.card-content') as HTMLElement | null;
			const fitWidth = this.getResponsiveFitSize(content, responsiveWidth);
			this.updateResponsiveVars(responsiveWidth, fitWidth || responsiveWidth);
		}
	}
	getCardSize(): number {
		if (this._gridRows !== undefined) {
			return this._gridRows;
		}
		return this.clientHeight > 0 ? Math.ceil(this.clientHeight / 50) : 3;
	}
	static styles = css`
		:host {
			--gtpc-click-cursor: pointer;
			--gtpc-grid-color: var(--primary-text-color);
			--gtpc-solar-color: var(--warning-color);
			--gtpc-house-color: var(--info-color);
			--gtpc-battery-color: var(--success-color);
			--gtpc-max-width: 100%;
			--gtpc-text-scale: 1;
			--gtpc-aggregate-text-scale: 1;
			--gtpc-icon-scale: 1;
			--gtpc-extra-display: block;
			--gtpc-layout-margin: 20px 0;
			--gtpc-top-padding: 12px;
			--gtpc-circle-gutter: calc(var(--gtpc-size) * 0.28);
			--gtpc-circle-offset-y: calc(var(--gtpc-size) * 0.08);
			--gtpc-contained-gutter: calc(var(--gtpc-size) * 0.18);
			--gtpc-contained-label-display: block;
			--gtpc-contained-extra-display: block;
			--gtpc-circle-label-display: block;
			--gtpc-list-row-gap: 6px;
			--gtpc-list-extra-display: block;
			--gtpc-list-min-height: clamp(220px, 50vw, 360px);
			--gtpc-contained-min-height: clamp(260px, 60vw, 420px);
			height: 100%;
		}
		ha-card {
			height: 100%;
		}
		ha-card.gtpc-default-height {
			height: auto;
		}
		.card-content {
			height: 100%;
			box-sizing: border-box;
		}
		.card-content.gtpc-default-height {
			height: auto;
		}
		.card-content.gtpc-content-list {
			display: flex;
			flex-direction: column;
			min-height: 0;
		}
		.gtpc-content,
		.gtpc-layout > svg {
			display: block;
		}
		.gtpc-content {
			width: min(100%, var(--gtpc-max-width));
			margin: 0 auto;
			padding-top: var(--gtpc-top-padding);
			box-sizing: border-box;
		}
		.gtpc-content.gtpc-content-list {
			width: 100%;
			flex: 1 1 auto;
			min-height: 0;
		}
		.gtpc-content.gtpc-content-list.gtpc-default-height {
			min-height: var(--gtpc-list-min-height);
		}
		.gtpc-content.gtpc-content-contained {
			container-type: size;
			display: grid;
			place-items: center;
			width: 100%;
			height: 100%;
			padding: 1.5rem;
			margin: 0 auto;
			min-height: 0;
			box-sizing: border-box;
		}
		.gtpc-content.gtpc-content-contained.gtpc-default-height {
			container-type: inline-size;
			height: auto;
			min-height: var(--gtpc-contained-min-height);
		}
		.gtpc-content.gtpc-content-contained > .gtpc-fit-shell {
			width: min(100cqw, 100cqh);
			height: min(100cqw, 100cqh);
			aspect-ratio: 1 / 1;
			max-width: 100%;
			max-height: 100%;
			min-width: 0;
			min-height: 0;
		}
		.gtpc-content.gtpc-content-contained.gtpc-default-height > .gtpc-fit-shell {
			width: 100%;
			height: auto;
		}
		.gtpc-content.gtpc-content-square > .gtpc-fit-shell,
		.gtpc-content.gtpc-content-cross > .gtpc-fit-shell {
			padding: var(--gtpc-contained-gutter);
			box-sizing: border-box;
		}
		.gtpc-content.gtpc-content-circle > .gtpc-fit-shell {
			padding: var(--gtpc-circle-gutter);
			box-sizing: border-box;
		}
		.gtpc-content.gtpc-content-contained > .gtpc-fit-shell > .gtpc-layout {
			width: 100%;
			height: 100%;
			margin: 0;
			padding: 0;
			box-sizing: border-box;
			overflow: hidden;
		}
		.gtpc-content.gtpc-content-square > .gtpc-fit-shell > .gtpc-layout-square,
		.gtpc-content.gtpc-content-cross > .gtpc-fit-shell > .gtpc-layout-cross {
			padding: 0;
		}
		.gtpc-content.gtpc-content-square .gtpc-entity-name,
		.gtpc-content.gtpc-content-cross .gtpc-entity-name {
			display: var(--gtpc-contained-label-display);
		}
		.gtpc-content.gtpc-content-square .gtpc-entity-extra,
		.gtpc-content.gtpc-content-cross .gtpc-entity-extra {
			display: var(--gtpc-contained-extra-display);
		}
		.gtpc-content.gtpc-content-square > .gtpc-fit-shell > givtcp-power-flow-card-layout-square > .gtpc-layout-square,
		.gtpc-content.gtpc-content-cross > .gtpc-fit-shell > givtcp-power-flow-card-layout-cross > .gtpc-layout-cross {
			margin: 0;
		}
		.gtpc-content.gtpc-content-circle > .gtpc-fit-shell > givtcp-power-flow-card-layout-circle > .gtpc-layout-circle {
			margin: 0;
			transform: translateY(var(--gtpc-circle-offset-y));
			transform-origin: center center;
		}
		.gtpc-content.gtpc-content-circle .gtpc-entity-name {
			display: var(--gtpc-circle-label-display);
			bottom: calc(var(--gtpc-size) * -0.2);
			white-space: nowrap;
			left: 50%;
			transform: translateX(-50%);
		}
		.gtpc-content.gtpc-content-circle .gtpc-entity-name[data-entity-type='custom1'],
		.gtpc-content.gtpc-content-circle .gtpc-entity-name[data-entity-type='solar'] {
			top: calc(var(--gtpc-size) * -0.2);
			bottom: auto;
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
		.gtpc-flow[data-pos='0'],
		.gtpc-layout-list > div[data-power='0'] {
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
			margin: var(--gtpc-layout-margin);
		}
		.gtpc-detail,
		.gtpc-list-row[data-from],
		.gtpc-list-row[data-from],
		.gtpc-list-row[data-from],
		.gtpc-list-row[data-from],
		.gtpc-list-row[data-from],
		.gtpc-list-row[data-from],
		.gtpc-list-row[data-from],
		givtcp-power-flow-card-entity[data-type],
		givtcp-power-flow-card-entity[data-type],
		givtcp-power-flow-card-entity[data-type],
		givtcp-power-flow-card-entity[data-type],
		givtcp-power-flow-card-entity[data-type],
		givtcp-power-flow-card-entity[data-type],
		givtcp-power-flow-card-entity[data-type] {
			cursor: var(--gtpc-click-cursor);
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='custom1'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='custom1'] {
			right: 0;
			top: 0;
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='custom2'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='custom2'] {
			right: 0;
			bottom: 0;
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='eps'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='eps'] {
			left: 0;
			bottom: 0;
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'] {
			left: 0;
			top: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='solar'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='solar'] {
			top: 0;
			left: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			right: 0;
			top: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='battery'],
		.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='battery'] {
			bottom: 0;
			left: calc(50% - var(--gtpc-size) / 2);
		}
		.gtpc-no-solar.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='house'],
		.gtpc-no-solar.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-solar.gtpc-layout-cross > givtcp-power-flow-card-entity[data-type='house'] {
			top: 0;
		}
		.gtpc-no-battery.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='grid'],
		.gtpc-no-battery.gtpc-layout-square > givtcp-power-flow-card-entity[data-type='house'],
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

		.gtpc-entity,
		.gtpc-list-entity {
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
		.gtpc-entity > *,
		.gtpc-list-entity > * {
			display: block;
			flex-grow: 0;
			flex-shrink: 1;
			flex-basis: auto;
			align-self: auto;
			order: 0;
			z-index: 2;
			line-height: 1;
		}
		.gtpc-entity > span[data-power='0'] {
			display: none;
		}
		.gtpc-entity.gtpc-entity-single > span > svg {
			display: none;
		}
		.gtpc-entity-extra,
		.gtpc-entity-in,
		.gtpc-entity-out,
		.gtpc-entity-name {
			color: var(--gtpc-icons-and-text-colour, var(--gtpc-color));
			box-sizing: border-box;
			font-size: calc(var(--gtpc-size) * 0.15 * var(--gtpc-text-scale));
			--mdc-icon-size: calc(var(--gtpc-size) * 0.15 * var(--gtpc-text-scale));
			line-height: 1;
		}
		.gtpc-entity-extra {
			white-space: pre-line;
			text-align: center;
			display: var(--gtpc-extra-display);
		}
		.gtpc-entity.gtpc-entity-aggregate {
			gap: calc(var(--gtpc-size) * 0.01);
		}
		.gtpc-entity.gtpc-entity-aggregate .gtpc-entity-extra,
		.gtpc-entity.gtpc-entity-aggregate .gtpc-entity-in,
		.gtpc-entity.gtpc-entity-aggregate .gtpc-entity-out,
		.gtpc-entity.gtpc-entity-aggregate .gtpc-entity-name {
			font-size: calc(var(--gtpc-size) * 0.115 * var(--gtpc-aggregate-text-scale));
			--mdc-icon-size: calc(var(--gtpc-size) * 0.115 * var(--gtpc-aggregate-text-scale));
		}
		.gtpc-entity.gtpc-entity-aggregate .gtpc-entity-icon {
			--mdc-icon-size: calc(var(--gtpc-size) * 0.21 * var(--gtpc-icon-scale));
		}
		.gtpc-entity.gtpc-entity-aggregate .gtpc-entity-extra {
			max-width: 78%;
			text-align: center;
			line-height: 1.05;
			text-wrap: balance;
		}
		.gtpc-entity-in > svg,
		.gtpc-entity-out > svg {
			width: calc(var(--gtpc-size) * 0.1);
			height: calc(var(--gtpc-size) * 0.1);
			stroke-width: calc(var(--gtpc-size) * 0.02);
		}
		.gtpc-entity-icon {
			--mdc-icon-size: calc(var(--gtpc-size) * 0.3 * var(--gtpc-icon-scale));
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
			fill-opacity: 0;
			fill: var(--ha-card-background, var(--card-background-color, white));
			stroke-width: var(--gtpc-entity-line-size);
			vector-effect: non-scaling-stroke;
		}
		.gtpc-list-row {
			flex: 1 1 0;
			min-height: 0;
			margin-bottom: 0;
		}
		.gtpc-layout.gtpc-layout-list {
			display: flex;
			flex-direction: column;
			gap: var(--gtpc-list-row-gap);
			width: 100%;
			height: 100%;
			margin: 0;
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity {
			--mdc-icon-size: calc(var(--gtpc-size) * 0.2 * var(--gtpc-icon-scale));
			font-size: calc(var(--gtpc-size) * 0.15 * var(--gtpc-text-scale));
		}
		.gtpc-layout.gtpc-layout-list .gtpc-entity-extra {
			display: var(--gtpc-list-extra-display);
		}
		.gtpc-list-flow-value {
			position: absolute;
			top: calc(50% + var(--gtpc-size) * 0.22);
			left: 50%;
			transform: translate(-50%, -50%);
			line-height: 1;
			white-space: nowrap;
			background: var(--ha-card-background, var(--card-background-color, white));
			padding: 0 0.2em;
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity {
			border-radius: 50%;
			border-style: solid;
			border-width: var(--gtpc-entity-line-size);
			height: calc(var(--gtpc-size) / 2);
			width: calc(var(--gtpc-size) / 2);
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			background-color: var(--ha-card-background, var(--card-background-color, white));
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity ha-icon {
			color: var(--gtpc-icons-and-text-colour, var(--gtpc-color));
		}

		.gtpc-layout.gtpc-layout-list .gtpc-list-entity.gtpc-from-entity {
			left: 0;
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity.gtpc-to-entity {
			right: 0;
		}
		.gtpc-layout-list > div {
			position: relative;
			min-height: 0;
		}
		.gtpc-layout-list > div > svg {
			position: absolute;
			left: calc(var(--gtpc-size) / 2);
			top: 50%;
			height: var(--gtpc-line-size);
			width: calc(100% - var(--gtpc-size));
			transform: translateY(-50%);
			display: block;
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='grid'] {
			color: var(--gtpc-grid-color);
			border-color: var(--gtpc-grid-color);
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='solar'] {
			color: var(--gtpc-solar-color);
			border-color: var(--gtpc-solar-color);
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='house'] {
			color: var(--gtpc-house-color);
			border-color: var(--gtpc-house-color);
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='battery'] {
			color: var(--gtpc-battery-color);
			border-color: var(--gtpc-battery-color);
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='eps'] {
			color: var(--gtpc-eps-color);
			border-color: var(--gtpc-eps-color);
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='custom1'] {
			color: var(--gtpc-custom1-color);
			border-color: var(--gtpc-custom1-color);
		}
		.gtpc-layout.gtpc-layout-list .gtpc-list-entity[data-type='custom2'] {
			color: var(--gtpc-custom2-color);
			border-color: var(--gtpc-custom2-color);
		}
		.gtpc-details {
			display: flex;
			flex-wrap: wrap;
			box-sizing: border-box;
			align-items: center;
			align-content: center;
		}
		.gtpc-detail {
			flex-direction: column;
			align-items: center;
			padding: 1rem 0.5rem;
			box-sizing: border-box;
			width: var(--gtpc-column-width, 33.3%);
			text-align: center;
		}
		.gtpc-detail-title {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			font-size: 0.8rem;
			--mdc-icon-size: 1.1rem;
			color: var(--secondary-text-color);
		}
		.gtpc-detail-state {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			font-size: 1rem;
		}
		.gtpc-detail-title > *:nth-child(1) {
			flex-grow: 1;
		}
	`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card': GivTCPPowerFlowCard;
	}
}
