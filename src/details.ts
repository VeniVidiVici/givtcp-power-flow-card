import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HassEntity } from 'home-assistant-js-websocket';
import { fireEvent } from 'custom-card-helpers';

@customElement('givtcp-power-flow-card-details')
export class GivTCPPowerFlowCardDetails extends LitElement {
	@property() entities!: HassEntity[];
	constructor() {
		super();
		this.addEventListener('click', (e) => {
			if (e.target && (e.target instanceof HTMLElement || e.target instanceof SVGElement)) {
				const type = e.target.closest('.gtpc-detail')?.getAttribute('data-entity-id');
				if (type) {
					e.stopPropagation();
					fireEvent(this, 'hass-more-info', { entityId: type });
				}
			}
		});
	}
	protected createRenderRoot() {
		return this;
	}
	render(): TemplateResult {
		return html`<div class="gtpc-details">
			${this.entities?.map(
				(entity) =>
					html`<div class="gtpc-detail" data-entity-id="${entity?.entity_id}">
						<div class="gtpc-detail-title">${this.formatEntityName(entity?.attributes?.friendly_name)}</div>
						<state-badge .stateObj=${entity} .stateColor=${true}></state-badge>
						<div class="gtpc-detail-state">${entity?.state} ${entity?.attributes?.unit_of_measurement}</div>
					</div>`,
			)}
		</div>`;
	}
	private formatEntityName(entity: string | undefined): string {
		return entity ? entity.replace(/^givtcp [a-zA-Z]{2}\d{4}[a-zA-Z]\d{3}\s/i, '').replace(/\s*kwh$/i, '') : '';
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-details': GivTCPPowerFlowCardDetails;
	}
}
