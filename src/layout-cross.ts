import { TemplateResult, css, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from './svg-utils';

@customElement('givtcp-power-flow-card-layout-cross')
export class GivTCPPowerFlowCardLayoutCross extends GivTCPPowerFlowCardLayout {
	@property() lineGap!: number;

	render(): TemplateResult {
		let height = 100;
		let showClass = 'full';
		if (!this.hasSolar) {
			showClass = 'no-solar';
			height = height * 0.625;
		} else if (!this.hasBattery) {
			showClass = 'no-battery';
			height = height * 0.625;
		}
		return html`
			<div class="gtpc-layout gtpc-${showClass} gtpc-layout-cross">
				${this.flowData.map(
			(flow) =>
				html`<givtcp-power-flow-card-entity data-type="${flow.type}" .data=${flow}></givtcp-power-flow-card-entity>`
		)}
				<svg viewBox="0 0 100 ${height}" xmlns="http://www.w3.org/2000/svg">
					${this.flows.map((flow) => this.getGroupForFlow(flow.from, flow.to))}
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
				return SVGUtils.getCurvePath(50 + this.lineGap, 25, 75, 50 - this.lineGap, -90);
			case 'battery-to-house':
				return SVGUtils.getCurvePath(75, midY + this.lineGap, 50 + this.lineGap, midY + 25, -90);
			case 'battery-to-grid':
				return SVGUtils.getCurvePath(50 - this.lineGap, midY + 25, 25, midY + this.lineGap, -90);
			case 'grid-to-battery':
				return SVGUtils.getCurvePath(50 - this.lineGap, midY + 25, 25, midY + this.lineGap, -90);
			case 'solar-to-grid':
				return SVGUtils.getCurvePath(25, 50 - this.lineGap, 50 - this.lineGap, 25, -90);
			case 'solar-to-battery':
				return SVGUtils.getCurvePath(50, 25, 50, 75, 0);
			case 'grid-to-house':
				return SVGUtils.getCurvePath(25, midY, 75, midY, 0);
			default:
				return '';
		}
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-layout-cross': GivTCPPowerFlowCardLayoutCross;
	}
}
