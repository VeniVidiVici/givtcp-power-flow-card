import { fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from 'lit/decorators.js'
import { ENTITY_SCHEMA, ICON_SCHEMA, LAYOUT_SCHEMA, LAYOUT_TYPE_SCHEMA } from "./schemas";
import { HIDE_INACTIVE_TOTALS_DEFAULT, HIDE_INACTIVE_FLOWS_DEFAULT, LINE_WIDTH_DEFAULT, POWER_MARGIN_DEFAULT, UnitOfPower } from "./const";

@customElement('givtcp-power-flow-card-editor')
export class GivTCPPowerFlowCardEditor extends LitElement implements LovelaceCardEditor {
	hass?: HomeAssistant | undefined;
	lovelace?: LovelaceConfig | undefined;
	@state() private _config!: LovelaceCardConfig;
	public setConfig(config: LovelaceCardConfig): void {
		this._config = config;
	}
	protected render(): TemplateResult {
		if (!this.hass || !this._config) {
			return html``;
		}
		const data = {
			hide_inactive_flows: HIDE_INACTIVE_FLOWS_DEFAULT,
			hide_inactive_totals: HIDE_INACTIVE_TOTALS_DEFAULT,
			...this._config,
		  };
		// const regex = /^sensor\.givtcp_[a-zA-Z]{2}\d{4}[a-zA-Z]\d{3}_(invertor|battery)_serial_number$/g;
		const invertors = Object.keys(this.hass.states).filter(eid => /^sensor\.givtcp_[a-zA-Z]{2}\d{4}[a-zA-Z]\d{3}_invertor_serial_number$/g.test(eid));
		const batteries = Object.keys(this.hass.states).filter(eid => /^sensor\.givtcp_[a-zA-Z]{2}\d{4}[a-zA-Z]\d{3}_battery_serial_number$/g.test(eid));
		const schema = [
			{ name: "name", selector: { text: {} } },
			...ENTITY_SCHEMA(invertors, batteries),
			...ICON_SCHEMA,
			{
				name: "power_margin",
				default: POWER_MARGIN_DEFAULT,
				selector: { number: {mode: "box", unit_of_measurement: UnitOfPower.WATT } },
			},
			{
				name: "line_width",
				default: LINE_WIDTH_DEFAULT,
				selector: { number: {mode: "slider", min: 1, max: 10, unit_of_measurement: 'px' } },
			},
			...LAYOUT_SCHEMA,
			...LAYOUT_TYPE_SCHEMA(this._config?.entity_layout),
			{
				type: "grid",
				name: "",
				schema: [
					{ name: "hide_inactive_flows",  selector: { boolean: {} } },
					{ name: "hide_inactive_totals",  selector: { boolean: {} } },
				],
			  },
		]
		return html`
		<ha-form
			.hass=${this.hass}
			.data=${data}
			.schema=${schema}
			.computeLabel=${this._computeLabelCallback}
			@value-changed=${this._valueChanged}
		></ha-form>
		`;
	}
	private _computeLabelCallback = (schema:{name:string} ) => {
		switch(schema.name) {
			case "invertor":
				return "Invertor";
			case "battery":
				return "Battery";
			case "icon_battery":
				return "Battery Icon";
			case "icon_grid":
				return "Grid Icon";
			case "icon_house":
				return "House Icon";
			case "icon_solar":
				return "Solar Icon";
			case "entity_layout":
				return "Layout";
			case "hide_inactive_flows":
				return "Hide Inactive Flows";
			case "hide_inactive_totals":
				return "Hide Inactive Totals";
			case "power_margin":
				return "Power Margin";
			case "line_width":
				return "Line Width";
			case "line_gap":
				return "Line Gap";
			case "circle_size":
				return "Circle Size";
			case "centre_entity":
				return "Centre Entity";
			default:
				return schema.name;
		}
	}
	private _valueChanged(ev: CustomEvent): void {
		fireEvent(this, "config-changed", { config: ev.detail.value });
	}
}
declare global {
	interface HTMLElementTagNameMap {
		"givtcp-power-flow-card-editor": GivTCPPowerFlowCardEditor;
	}
}