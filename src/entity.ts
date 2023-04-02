import { css, html, LitElement, svg, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SVGUtils } from "./svg-utils";
import { EntityData } from './types';

@customElement('givtcp-power-flow-card-entity')
export class GivTCPPowerFlowCardEntity extends LitElement {
	@property() data!: EntityData;
	// protected createRenderRoot() {
	// 	return this;
	//   }
	render(): TemplateResult {
		let fullTotal = 0;
		let partTotals:{ [n: string]: number } = {};
		[this.data.in, this.data.out].forEach(flow => {
			if(flow){
				fullTotal += flow.total;
				flow.parts.forEach(part => {
					if(!partTotals[part.type]) partTotals[part.type] = 0;
					partTotals[part.type] += part.value;
				});
			}
		});

		let offset = 0;
		this.style.setProperty('--gtpc-color', `var(--gtpc-${this.data.type}-color)`);
		return html`
		${svg`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		${Object.keys(partTotals).map(key => {
			const percentage = fullTotal > 0 ? partTotals[key] / fullTotal * 100 : 100;
			offset += fullTotal > 0 ? (fullTotal - partTotals[key]) / fullTotal * 100 : 0;
			return svg`<path d="${SVGUtils.getCirclePath(percentage, offset, 49)}" style="stroke: var(--gtpc-${key}-color)" />`;
		}
		)}
		</svg>`}
		<div class='gtpc-entity'>
			${this.data.in!==undefined?html`<span class="gtpc-entity-in"><ha-icon icon="mdi:arrow-right"></ha-icon> ${this.formatPower(this.data.in.total)}</span>`:html``}
			${this.data.out!==undefined?html`<span class="gtpc-entity-out"><ha-icon icon="mdi:arrow-left"></ha-icon> ${this.formatPower(this.data.out.total)}</span>`:html``}
			<ha-icon class="gtpc-entity-icon" .icon="${this.data.icon}"></ha-icon>
		</div>
		`;
	}
	private formatPower(power: number): string {
		if (power < 1000) return `${power}W`;
		if (power < 1000000) return `${(power / 1000).toFixed(1)}kW`;
		return `${(power / 1000000).toFixed(1)}MW`;
	}





	static styles = css`
    :host {
    }
	svg{
		position: absolute;
		z-index: 1;
	}
	svg>path{
		stroke: var(--gtpc-border);
		fill:none;
		stroke-width: var(--gtpc-line-size);
		vector-effect: non-scaling-stroke;
	}
	.gtpc-entity-in,
	.gtpc-entity-out,
	.gtpc-entity-name{
		color: var(--gtpc-color);
		box-sizing: border-box;
		font-size: calc(var(--gtpc-size) * 0.1);
		--mdc-icon-size: calc(var(--gtpc-size) * 0.1);
		line-height: 1;
	}
	.gtpc-entity-icon{
		--mdc-icon-size: calc(var(--gtpc-size) * 0.5);
		color: var(--gtpc-color);
	}
	.gtpc-entity-name{
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
	.gtpc-entity>div {
		display: block;
		flex-grow: 0;
		flex-shrink: 1;
		flex-basis: auto;
		align-self: auto;
		order: 0;
	}
  `
}
declare global {
	interface HTMLElementTagNameMap {
		"givtcp-power-flow-card-entity": GivTCPPowerFlowCardEntity;
	}
}

