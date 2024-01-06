import { fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig } from 'custom-card-helpers';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
	BATTERY_SCHEMA,
	cardConfigStruct,
	INVERTER_BATTERY_SCHEMA,
	GRID_SCHEMA,
	HOUSE_SCHEMA,
	LAYOUT_SCHEMA,
	LAYOUT_TYPE_SCHEMA,
	SOLAR_SCHEMA,
	EXTRAS_SCHEMA,
	DETAILS_SCHEMA,
} from './schemas';
import { assert } from 'superstruct';
import {
	LINE_WIDTH_DEFAULT,
	POWER_MARGIN_DEFAULT,
	DOT_SIZE_DEFAULT,
	DOT_SPEED_DEFAULT,
	ENTITY_SIZE_DEFAULT,
	ENTITIES,
	SINGLE_INVERTOR_DEFAULT,
	SINGLE_BATTERY_DEFAULT,
} from './const';
import { UnitOfPower } from './types';
import { ConfigUtils } from './utils/config-utils';

@customElement('givtcp-power-flow-card-editor')
export class GivTCPPowerFlowCardEditor extends LitElement implements LovelaceCardEditor {
	@property() hass!: HomeAssistant;
	lovelace?: LovelaceConfig | undefined;
	@state() private _config!: LovelaceCardConfig;
	@state() private _curView?: number;

	private get _extraEntities(): string[] {
		const invertors = this._invertorSerial;
		const batteries = this._batterySerial;
		return this.hass
			? Object.keys(this.hass.states).filter(
					(eid) =>
						invertors.some((invertor) => eid.includes(invertor)) ||
						batteries.some(
							(battery) =>
								eid.includes(battery) &&
								(['battery', 'energy', 'monetary', 'power', 'current', 'voltage', 'timestamp'].includes(
									this.hass.states[eid].attributes.device_class || '',
								) ||
									['total_increasing', 'total', 'measurement'].includes(
										this.hass.states[eid].attributes.state_class || '',
									)),
						),
				)
			: [];
	}
	private get _singleInverter(): boolean {
		return this._config?.single_invertor == undefined ? SINGLE_INVERTOR_DEFAULT : this._config?.single_invertor;
	}
	private get _singleBattery(): boolean {
		return this._config?.single_battery == undefined ? SINGLE_BATTERY_DEFAULT : this._config?.single_battery;
	}
	private get _batterySerial(): string[] {
		if (this._singleBattery) {
			try {
				return this._config?.battery && this.hass.states[this._config?.battery]
					? [this.hass.states[this._config?.battery].state.toLowerCase()] || []
					: [];
			} catch (e) {
				console.error(e);
				return [];
			}
		} else {
			try {
				return (
					this._config?.batteries
						?.filter((battery: string) => this.hass.states[battery])
						.map((battery: string) => this.hass.states[battery].state.toLowerCase() || '') || []
				);
			} catch (e) {
				console.error(e);
				return [];
			}
		}
	}
	private get _invertorSerial(): string[] {
		if (this._singleInverter) {
			try {
				return this._config?.invertor && this.hass.states[this._config?.invertor]
					? [this.hass.states[this._config?.invertor].state.toLowerCase()] || []
					: [];
			} catch (e) {
				console.error(e);
				return [];
			}
		} else {
			try {
				return (
					this._config?.invertors
						?.filter((invertor: string) => this.hass.states[invertor])
						.map((invertor: string) => this.hass.states[invertor].state.toLowerCase() || '') || []
				);
			} catch (e) {
				console.error(e);
				return [];
			}
		}
	}
	private get _batteries(): string[] {
		return this.hass ? Object.keys(this.hass.states).filter((eid) => eid.includes('battery_serial_number')) : [];
	}
	private get _invertors(): string[] {
		return this.hass ? Object.keys(this.hass.states).filter((eid) => eid.includes('invertor_serial_number')) : [];
	}
	private get _defaults(): LovelaceCardConfig {
		return ConfigUtils.getDefaults(this._config);
	}
	// private get _invertorsAndBatteries(): string[] {
	// 	return this.hass ? Object.keys(this.hass.states).filter((eid) =>
	// 	/^sensor\.givtcp_[a-zA-Z]{2}\d{4}[a-zA-Z]\d{3}_(invertor|battery)_serial_number$/g.test(eid)
	// ) : [];
	// }
	//state_class: total_increasing, total, measurement
	//device_class: battery, energy, monetary, power, current, voltage, timestamp
	private get _schema(): object[] {
		switch (this._curView) {
			case 0:
				return [
					{ name: 'name', label: 'Name', selector: { text: {} } },
					...INVERTER_BATTERY_SCHEMA(this._config, this._invertors, this._batteries),
					{
						type: 'grid',
						name: '',
						schema: [
							{
								name: 'dot_size',
								label: 'Dot Size',
								default: DOT_SIZE_DEFAULT,
								selector: { number: { mode: 'slider', min: 1, max: 10 } },
							},
							{
								name: 'dot_speed',
								label: 'Dot Speed',
								default: DOT_SPEED_DEFAULT,
								selector: { number: { mode: 'slider', min: 1, max: 10 } },
							},
							{
								name: 'line_width',
								label: 'Flow Size',
								default: LINE_WIDTH_DEFAULT,
								selector: { number: { mode: 'slider', min: 1, max: 10 } },
							},
							{
								name: 'entity_line_width',
								label: 'Outline Size',
								default: LINE_WIDTH_DEFAULT,
								selector: { number: { mode: 'slider', min: 1, max: 10 } },
							},
							{
								name: 'entity_size',
								label: 'Entity Size',
								default: ENTITY_SIZE_DEFAULT,
								selector: { number: { mode: 'slider', min: 3, max: 7 } },
							},
							{
								name: 'power_margin',
								label: 'Power Threshold',
								default: POWER_MARGIN_DEFAULT,
								selector: { number: { mode: 'box', unit_of_measurement: UnitOfPower.WATT } },
							},
							{ name: 'hide_inactive_flows', label: 'Hide Inactive Flows', selector: { boolean: {} } },
							{ name: 'colour_icons_and_text', label: 'Colour Icons and Text', selector: { boolean: {} } },
						],
					},
				];
			case 1:
				return [...LAYOUT_SCHEMA, ...LAYOUT_TYPE_SCHEMA(this._config)];
			case 2:
				return [...GRID_SCHEMA(this._config)];
			case 3:
				return [...SOLAR_SCHEMA(this._config)];
			case 4:
				return [...BATTERY_SCHEMA(this._config)];
			case 5:
				return [...HOUSE_SCHEMA(this._config), ...EXTRAS_SCHEMA(this._config)];
			case 6:
				return [...DETAILS_SCHEMA(this._config, this._extraEntities)];
			default:
				return [];
		}
	}
	constructor() {
		super();
		this._curView = 0;
	}
	public setConfig(config: LovelaceCardConfig): void {
		config = ConfigUtils.migrateConfig(config, false);
		assert(config, cardConfigStruct);
		this._config = config;
	}
	protected render(): TemplateResult {
		if (!this.hass || !this._config) {
			return html``;
		}
		const data = {
			...this._defaults,
			...this._config,
		};
		ENTITIES.forEach((key) => {
			if (
				(data[key + '_colour_type'] !== 'ui' && typeof data[key] === 'string') ||
				(data[key + '_colour_type'] === 'ui' && typeof data[key] === 'object')
			) {
				data[key] = this._defaults[key];
			}
		});
		return html`
			<ha-tabs scrollable .selected=${this._curView} @iron-activate=${this._handleTabChanged}>
				<paper-tab>General</paper-tab>
				<paper-tab>Layout</paper-tab>
				<paper-tab>Grid</paper-tab>
				<paper-tab>Solar</paper-tab>
				<paper-tab>Battery</paper-tab>
				<paper-tab>House</paper-tab>
				<paper-tab>Details</paper-tab>
			</ha-tabs>
			<ha-form
				.hass=${this.hass}
				.data=${data}
				.schema=${this._schema}
				.computeLabel=${this._computeLabelCallback}
				@value-changed=${this._valueChanged}
			></ha-form>
		`;
	}
	private _handleTabChanged(ev: CustomEvent): void {
		ev.preventDefault();
		const tab = ev.detail.selected as number;
		this._curView = tab;
	}
	private _computeLabelCallback = (schema: { name: string; label?: string }) => {
		if (schema.label) return schema.label;
		switch (schema.name) {
			case 'invertor':
				return 'Invertor';
			case 'battery':
				return 'Battery';
			case 'entity_layout':
				return 'Layout';
			default:
				return schema.name;
		}
	};
	private _valueChanged(ev: CustomEvent): void {
		const config = ev.detail.value;
		fireEvent(this, 'config-changed', { config });
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-editor': GivTCPPowerFlowCardEditor;
	}
}
