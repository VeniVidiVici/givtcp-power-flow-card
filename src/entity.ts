import { html, LitElement, svg, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from './utils/svg-utils';
import { FlowData, UnitOfPower } from './types';

@customElement('givtcp-power-flow-card-entity')
export class GivTCPPowerFlowCardEntity extends LitElement {
	@property() data!: FlowData;
	@property() lineWidth!: number;
	constructor() {
		super();
		this.addEventListener('click', (e) => {
			e.stopPropagation();
			const eventDetails = new CustomEvent('entity-details', {
				bubbles: true,
				composed: true,
				detail: { type: this.data.type },
			});
			this.dispatchEvent(eventDetails);
		});
	}
	protected createRenderRoot() {
		return this;
	}
	static get observedAttributes() {
		return ['entityDetails'];
	}
	render(): TemplateResult {
		let fullTotal = 0;
		const partTotals: { [n: string]: number } = {};
		[this.data.in, this.data.out].forEach((flow) => {
			if (flow) {
				fullTotal += flow.total;
				flow.parts.forEach((part) => {
					if (!partTotals[part.type]) partTotals[part.type] = 0;
					partTotals[part.type] += part.value;
				});
			}
		});

		let offset = 0;
		this.style.setProperty('--gtpc-color', `var(--gtpc-${this.data.type}-color)`);
		return html`
			${svg`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		${
			fullTotal <= 0
				? svg`<path d="${SVGUtils.getCirclePath(100, 0, 50 - this.lineWidth / 2)}" style="stroke: var(--gtpc-${
						this.data.type
				  }-color)" />`
				: Object.keys(partTotals).map((key) => {
						const percentage = (partTotals[key] / fullTotal) * 100;
						offset += fullTotal > 0 ? ((fullTotal - partTotals[key]) / fullTotal) * 100 : 0;
						return percentage > 0
							? svg`<path d="${SVGUtils.getCirclePath(
									percentage,
									offset,
									50 - this.lineWidth / 2
							  )}" style="stroke: var(--gtpc-${key}-color)" />`
							: html``;
				  })
		}
		</svg>`}
			<div
				class="gtpc-entity ${this.data.in === undefined || this.data.out === undefined
					? 'gtpc-entity-single'
					: 'gtpc-entity-both'}"
			>
				<span class="gtpc-entity-name" data-entity-type="${this.data.type}">${this.data.name}</span>
				${this.data.in !== undefined
					? html`<span data-power="${this.data.in.total}" class="gtpc-entity-in"
							><ha-icon icon="mdi:arrow-right"></ha-icon> ${this.formatPower(this.data.in.total)}</span
					  >`
					: html``}
				${this.data.out !== undefined
					? html`<span data-power="${this.data.out.total}" class="gtpc-entity-out"
							><ha-icon icon="mdi:arrow-left"></ha-icon> ${this.formatPower(this.data.out.total)}</span
					  >`
					: html``}
				<ha-icon class="gtpc-entity-icon" .icon="${this.data.icon}"></ha-icon>
				${this.data.extra !== undefined ? html`<span class="gtpc-entity-extra">${this.data.extra}</span>` : html``}
			</div>
		`;
	}
	private formatPower(power: number): string {
		if (power < 1000) return `${power}${UnitOfPower.WATT}`;
		if (power < 1000000) return `${(power / 1000).toFixed(1)}${UnitOfPower.KILO_WATT}`;
		return `${(power / 1000000).toFixed(1)}${UnitOfPower.MEGA_WATT}`;
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-entity': GivTCPPowerFlowCardEntity;
	}
}
