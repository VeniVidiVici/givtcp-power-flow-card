import { TemplateResult, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from '../utils/svg-utils';

@customElement('givtcp-power-flow-card-layout-cross')
export class GivTCPPowerFlowCardLayoutCross extends GivTCPPowerFlowCardLayout {
	@property() lineGap!: number;
	@property() cornerRadius!: number;

	private get xLineGap(): number {
		if (!this.hasSolar || !this.hasBattery) {
			return this.lineGap / 2;
		} else {
			return this.lineGap;
		}
	}
	render(): TemplateResult {
		let showClass = 'full';
		if (!this.hasSolar && !this.hasCustom1) {
			showClass = 'no-solar';
		} else if (!this.hasBattery && !this.hasCustom2) {
			showClass = 'no-battery';
		}
		return html`
			<div class="gtpc-layout gtpc-${showClass} gtpc-layout-cross">
				${this.flowData.map(
					(flow) =>
						html`<givtcp-power-flow-card-entity
							data-type="${flow.type}"
							.entityLineWidth=${this.entityLineWidth}
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
		const halfEntity = this.entityWidth / 2;
		switch (flow) {
			case 'solar-to-house':
				return SVGUtils.getRoundedCornerPath(
					this.midX + this.xLineGap,
					this.entityWidth,
					this.width - this.entityWidth,
					this.midY - this.lineGap,
					this.cornerRadius,
					0
				);
			case 'battery-to-house':
				return SVGUtils.getRoundedCornerPath(
					this.width - this.entityWidth,
					this.midY + this.lineGap,
					this.midX + this.xLineGap,
					this.height - this.entityWidth,
					this.cornerRadius,
					2
				);
			case 'battery-to-grid':
				return SVGUtils.getRoundedCornerPath(
					this.midX - this.xLineGap,
					this.height - this.entityWidth,
					this.entityWidth,
					this.midY + this.lineGap,
					this.cornerRadius,
					3
				);
			case 'grid-to-battery':
				return SVGUtils.getRoundedCornerPath(
					this.midX - this.xLineGap,
					this.height - this.entityWidth,
					this.entityWidth,
					this.midY + this.lineGap,
					this.cornerRadius,
					3
				);
			case 'solar-to-grid':
				return SVGUtils.getRoundedCornerPath(
					this.entityWidth,
					this.midY - this.lineGap,
					this.midX - this.xLineGap,
					this.entityWidth,
					this.cornerRadius,
					1
				);
			case 'solar-to-battery':
				return SVGUtils.getCurvePath(this.midX, this.entityWidth, this.midX, this.height - this.entityWidth, 0);
			case 'grid-to-house':
				return SVGUtils.getCurvePath(this.entityWidth, this.midY, this.width - this.entityWidth, this.midY, 0);
			case 'house-to-custom1':
				return SVGUtils.getStraightPath(
					this.width - halfEntity,
					this.entityWidth,
					this.width - halfEntity,
					this.midY - halfEntity
				);
			case 'house-to-custom2':
				return SVGUtils.getStraightPath(
					this.width - halfEntity,
					this.height - this.entityWidth,
					this.width - halfEntity,
					this.midY + halfEntity
				);
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
