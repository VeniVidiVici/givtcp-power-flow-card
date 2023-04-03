import { fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, state } from 'lit/decorators.js'

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
			{ title: "Name", name: "name", selector: { text: {} } },
			{ title: "Invertor", name: "invertor", selector: { entity: { include_entities: invertors } } },
			{ title: "Battery", name: "battery", selector: { entity: { include_entities: batteries } } },
			{
				name: "entity_layout",
				label: "Layout",
				selector: {
					select: {
						mode: "dropdown",
						options: [
							{ value: "cross", label: "Cross" },
							{ value: "square", label: "Square" },
							{ value: "circle", label: "Circle" }
						],
					},
				},
			},
			{
				name: "centre_entity",
				label: "Centre entity",
				selector: {
					select: {
						mode: "dropdown",
						options: [
							{ value: 'none', label: 'None' },
							{ value: 'house', label: 'House' },
							{ value: 'inverter', label: 'Inverter' },
							{ value: 'solar', label: 'Solar' },
							{ value: 'battery', label: 'Battery' },
						],
					},
				},
			},
			{
				name: "power_margin",
				label: "Power margin",
				selector: { number: { mode: "box", unit_of_measurement: 'w' } },
			},
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