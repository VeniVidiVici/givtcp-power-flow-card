import { TemplateResult, css, html, svg } from "lit";
import { GivTCPPowerFlowCardLayout } from "./layout";
import { customElement, property } from "lit/decorators.js";
import { SVGUtils } from "./svg-utils";

@customElement('givtcp-power-flow-card-layout-circle')
export class GivTCPPowerFlowCardLayoutCircle extends GivTCPPowerFlowCardLayout {
	@property() centreEntity!: string;
	@property() circleSize!: number;


	render(): TemplateResult {
		let height = 100;
		let showClass = 'full';
		if (!this.hasSolar) {
			showClass = 'no-solar';
			height = height * .625;
		} else if (!this.hasBattery) {
			showClass = 'no-battery';
			height = height * .625;
		}
		return html`
			<div class="gtpc-layout gtpc-${showClass} gtpc-layout-circle gtpc-centre-${this.centreEntity}">
				${this.flowData.map(flow => html`<givtcp-power-flow-card-entity data-type="${flow.type}"  .data=${flow}></givtcp-power-flow-card-entity>`)}
				<svg viewBox="0 0 100 ${height}" xmlns="http://www.w3.org/2000/svg">
					${this.flows.map(flow => this.getGroupForFlow(flow.from, flow.to))}
				</svg>
			</div>
		`;
	}

	private getGroupForFlow(from: string, to: string): TemplateResult {
		return svg`<g data-pos="0" class="gtpc-flow gtpc-${from}-to-${to}-flow" style="stroke: var(--gtpc-${from}-color)">
			<line x1="0" y1="0" x2="0" y2="0"/>
			<path d="${this.getPathForFlow(`${from}-to-${to}`)}" />
		</g>`;
	}

	private getPathForFlow(flow: string): string {
		let midY = 50;
		if (!this.hasSolar) {
			midY = 12.5;
		}
		switch (flow) {
			case 'solar-to-house':
					return SVGUtils.getCirclePath(15, 5, this.circleSize, { x: 50, y: midY });
			case 'battery-to-house':
					return SVGUtils.getCirclePath(15, 30, this.circleSize, { x: 50, y: midY });
			case 'battery-to-grid':
					return SVGUtils.getCirclePath(15, 55, this.circleSize, { x: 50, y: midY });
			case 'grid-to-battery':
					return SVGUtils.getCirclePath(15, 55, this.circleSize, { x: 50, y: midY });
			case 'solar-to-grid':
					return SVGUtils.getCirclePath(15, 80, this.circleSize, { x: 50, y: midY });
			case 'solar-to-battery':
					return SVGUtils.getCurvePath(50, 25, 50, 75, 0);
			case 'grid-to-house':
					return SVGUtils.getCurvePath(25, midY, 75, midY, 0);
			default:
				return '';
		}
	}
	static styles = css`
	givtcp-power-flow-card-entity {
		position: absolute;
		width: var(--gtpc-size);
		aspect-ratio: 1 / 1;
	}
	.gtpc-flow>line{
		stroke: var(--gtpc-border);
		stroke-linecap: round;
		stroke-width: calc(var(--gtpc-line-size) * 1);
		vector-effect: non-scaling-stroke;
	}
	.gtpc-flow>path{
		stroke: var(--gtpc-border);
		fill:none;
		stroke-width: var(--gtpc-line-size);
		vector-effect: non-scaling-stroke;
	}
	.gtpc-flow[data-pos="0"]{
		display: var(--gtpc-inactive-flow-display);
	}
	.gtpc-flow[data-pos="0"]>line{
		display: none;
	}
	.gtpc-layout {
		position: relative;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="grid"] {
		left: 0;
		top: calc(50% - var(--gtpc-size) / 2);
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="solar"] {
		top: 0;
		left: calc(50% - var(--gtpc-size) / 2);
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="house"] {
		right: 0;
		top: calc(50% - var(--gtpc-size) / 2);
	}
	.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="battery"] {
		bottom: 0;
		left: calc(50% - var(--gtpc-size) / 2);
	}

	.gtpc-no-solar.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="grid"],
	.gtpc-no-solar.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="house"] {
		top: 0;
	}
	.gtpc-no-battery.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="grid"],
	.gtpc-no-battery.gtpc-layout-circle>givtcp-power-flow-card-entity[data-type="house"] {
		bottom: 0;
		top: initial;
	}
	`;
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-layout-circle': GivTCPPowerFlowCardLayoutCircle
	}
}