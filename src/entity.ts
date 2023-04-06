import { css, html, LitElement, svg, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from './svg-utils';
import { FlowData, UnitOfPower } from './types';

@customElement('givtcp-power-flow-card-entity')
export class GivTCPPowerFlowCardEntity extends LitElement {
	@property() data!: FlowData;
	// protected createRenderRoot() {
	// 	return this;
	//   }
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
				? svg`<path d="${SVGUtils.getCirclePath(100, 0, 49)}" style="stroke: var(--gtpc-${this.data.type}-color)" />`
				: Object.keys(partTotals).map((key) => {
						const percentage = (partTotals[key] / fullTotal) * 100;
						offset += fullTotal > 0 ? ((fullTotal - partTotals[key]) / fullTotal) * 100 : 0;
						return percentage > 0
							? svg`<path d="${SVGUtils.getCirclePath(
									percentage,
									offset,
									49
							  )}" style="stroke: var(--gtpc-${key}-color)" />`
							: html``;
				  })
		}
		</svg>`}
			<div class="gtpc-entity">
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

	static styles = css`
		:host {
		}
		svg {
			position: absolute;
			z-index: 1;
		}
		svg > path {
			fill: none;
			stroke-width: var(--gtpc-line-size);
			vector-effect: non-scaling-stroke;
		}
		.gtpc-entity > span[data-power='0'] {
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
			--mdc-icon-size: calc(var(--gtpc-size) * 0.4);
			color: var(--gtpc-icons-and-text-colour, var(--gtpc-color));
		}
		.gtpc-entity-name {
			text-align: center;
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
			background: var(--ha-card-background, var(--card-background-color, white));
			border-radius: 50%;
		}
		.gtpc-entity > div {
			display: block;
			flex-grow: 0;
			flex-shrink: 1;
			flex-basis: auto;
			align-self: auto;
			order: 0;
		}
	`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-entity': GivTCPPowerFlowCardEntity;
	}
}
