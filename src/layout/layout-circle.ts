import { TemplateResult, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from '../utils/svg-utils';

@customElement('givtcp-power-flow-card-layout-circle')
export class GivTCPPowerFlowCardLayoutCircle extends GivTCPPowerFlowCardLayout {
	@property() centreEntity!: string;
	@property() circleSize!: number;

	private width = 100;
	private midX = 50;

	private get entityWidth(): number {
		return 100 / this.entitySize;
	}
	private get height(): number {
		if (!this.hasSolar || !this.hasBattery) {
			return this.width / 2;
		} else {
			return this.width;
		}
	}
	render(): TemplateResult {
		let showClass = 'full';
		if (!this.hasSolar) {
			showClass = 'no-solar';
		} else if (!this.hasBattery) {
			showClass = 'no-battery';
		}
		return html`
			<div class="gtpc-layout gtpc-${showClass} gtpc-layout-circle gtpc-centre-${this.centreEntity}">
				${this.flowData.map(
					(flow) =>
						html`<givtcp-power-flow-card-entity
							data-type="${flow.type}"
							.lineWidth=${this.lineWidth}
							.data=${flow}
						></givtcp-power-flow-card-entity>`
				)}
				<svg viewBox="0 0 100 ${this.height}" xmlns="http://www.w3.org/2000/svg">
					${this.flows.map((flow) => this.getGroupForFlow(flow.from, flow.to))}
				</svg>
			</div>
		`;
	}

	private getGroupForFlow(from: string, to: string): TemplateResult {
		return svg`<g data-pos="0" class="gtpc-flow gtpc-${from}-to-${to}-flow" style="stroke: var(--gtpc-${from}-color)">
			<path d="${this.getPathForFlow(`${from}-to-${to}`)}" />
			<circle cx="0" cy="0" r="0.5" style="fill: var(--gtpc-${from}-color)"/>
		</g>`;
	}

	private getPathForFlow(flow: string): string {
		const entityPos = 100 / this.entitySize;

		let midY = this.height / 2;
		if (!this.hasSolar) {
			midY = this.height / this.entitySize;
		} else if (!this.hasBattery) {
			midY = this.height - this.entityWidth / 2;
		}

		const circumference = Math.ceil(2 * Math.PI * this.circleSize);
		const offset = Math.ceil(((this.entityWidth - 0) / circumference) * 100);
		const segment = 25 - offset;
		switch (flow) {
			case 'solar-to-house':
				return SVGUtils.getCirclePath(segment, offset / 2, this.circleSize, { x: 50, y: midY });
			case 'battery-to-house':
				return SVGUtils.getCirclePath(segment, 25 + offset / 2, this.circleSize, { x: 50, y: midY });
			case 'battery-to-grid':
				return SVGUtils.getCirclePath(segment, 50 + offset / 2, this.circleSize, { x: 50, y: midY });
			case 'grid-to-battery':
				return SVGUtils.getCirclePath(segment, 50 + offset / 2, this.circleSize, { x: 50, y: midY });
			case 'solar-to-grid':
				return SVGUtils.getCirclePath(segment, 75 + offset / 2, this.circleSize, { x: 50, y: midY });
			case 'solar-to-battery':
				return SVGUtils.getCurvePath(this.midX, entityPos, this.midX, this.height - entityPos, 0);
			case 'grid-to-house':
				return SVGUtils.getCurvePath(entityPos, midY, this.width - entityPos, midY, 0);
			default:
				return '';
		}
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-layout-circle': GivTCPPowerFlowCardLayoutCircle;
	}
}
