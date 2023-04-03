import { fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from 'lit/decorators.js'
import { ENTITY_SCHEMA, ICON_SCHEMA, LAYOUT_SCHEMA, LAYOUT_TYPE_SCHEMA } from "./schemas";
import { LINE_WIDTH_DEFAULT, POWER_MARGIN_DEFAULT, UnitOfPower } from "./const";

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
		]
		return html`
		<ha-form
			.hass=${this.hass}
			.data=${this._config}
			.schema=${schema}
			@value-changed=${this._valueChanged}
		></ha-form>
		`;
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