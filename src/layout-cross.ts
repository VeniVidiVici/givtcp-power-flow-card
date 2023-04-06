import { TemplateResult, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from './svg-utils';

@customElement('givtcp-power-flow-card-layout-cross')
export class GivTCPPowerFlowCardLayoutCross extends GivTCPPowerFlowCardLayout {
	@property() lineGap!: number;

	private width = 100;
	private midX = 50;

	private get entityWidth(): number {
		return 100 / this.entitySize;
	}
	private get curve(): number {
		return 5;
	}
	private get height(): number {
		if (!this.hasSolar || !this.hasBattery) {
			return (this.entityWidth * 4) / 2;
		} else {
			return this.entityWidth * 4;
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
			<div class="gtpc-layout gtpc-${showClass} gtpc-layout-cross">
				${this.flowData.map(
					(flow) =>
						html`<givtcp-power-flow-card-entity data-type="${flow.type}" .data=${flow}></givtcp-power-flow-card-entity>`
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
		let midY = this.height / 2;
		if (!this.hasSolar) {
			midY = this.height / this.entitySize;
		} else if (!this.hasBattery) {
			midY = this.height - this.entityWidth / 2;
		}
		const entityPos = 100 / this.entitySize;
		switch (flow) {
			case 'solar-to-house':
				return SVGUtils.getRoundedCornerPath(
					this.midX + this.lineGap,
					entityPos,
					this.width - entityPos,
					midY - this.lineGap,
					this.curve,
					0
				);
			case 'battery-to-house':
				return SVGUtils.getRoundedCornerPath(
					this.width - entityPos,
					midY + this.lineGap,
					this.midX + this.lineGap,
					this.height - entityPos,
					this.curve,
					2
				);
			case 'battery-to-grid':
				return SVGUtils.getRoundedCornerPath(
					this.midX - this.lineGap,
					this.height - entityPos,
					entityPos,
					midY + this.lineGap,
					this.curve,
					3
				);
			case 'grid-to-battery':
				return SVGUtils.getRoundedCornerPath(
					this.midX - this.lineGap,
					this.height - entityPos,
					entityPos,
					midY + this.lineGap,
					this.curve,
					3
				);
			case 'solar-to-grid':
				return SVGUtils.getRoundedCornerPath(
					entityPos,
					midY - this.lineGap,
					this.midX - this.lineGap,
					entityPos,
					this.curve,
					1
				);
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
		'givtcp-power-flow-card-layout-cross': GivTCPPowerFlowCardLayoutCross;
	}
}
