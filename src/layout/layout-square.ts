import { TemplateResult, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from '../utils/svg-utils';
import { LineStyle } from '../types';

@customElement('givtcp-power-flow-card-layout-square')
export class GivTCPPowerFlowCardLayoutSquare extends GivTCPPowerFlowCardLayout {
	@property() lineGap!: number;
	@property() lineStyle!: string;
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
			<div class="gtpc-layout gtpc-${showClass} gtpc-line-style-${this.lineStyle} gtpc-layout-square">
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
		const halfEntity = this.entityWidth / 2;
		let midY = this.height / 2;
		if (!this.hasSolar) {
			midY = this.height / this.entitySize;
		} else if (!this.hasBattery) {
			midY = this.height - this.entityWidth / 2;
		}
		switch (flow) {
			case 'solar-to-house':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.midX + this.lineGap,
							this.entityWidth,
							this.width - this.entityWidth,
							midY - this.lineGap,
							-90
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.midX + halfEntity,
							halfEntity,
							this.width - halfEntity,
							midY - this.entityWidth / 2,
							0
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.midX + halfEntity,
							halfEntity,
							this.width - halfEntity,
							midY - this.entityWidth / 2
						);
					default:
						return '';
				}
			case 'battery-to-house':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.width - this.entityWidth,
							midY + this.lineGap,
							this.midX + this.lineGap,
							this.height - this.entityWidth,
							-90
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.width - halfEntity,
							midY + this.entityWidth / 2,
							this.midX + halfEntity,
							this.height - halfEntity,
							1
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.width - halfEntity,
							midY + this.entityWidth / 2,
							this.midX + halfEntity,
							this.height - halfEntity
						);
					default:
						return '';
				}
			case 'battery-to-grid':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.midX - this.lineGap,
							this.height - this.entityWidth,
							this.entityWidth,
							midY + this.lineGap,
							-90
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							midY + this.entityWidth / 2,
							0
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							midY + this.entityWidth / 2
						);
					default:
						return '';
				}
			case 'grid-to-battery':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.midX - this.lineGap,
							this.height - this.entityWidth,
							this.entityWidth,
							midY + this.lineGap,
							-90
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							midY + this.entityWidth / 2,
							0
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							midY + this.entityWidth / 2
						);
					default:
						return '';
				}
			case 'solar-to-grid':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.entityWidth,
							midY - this.lineGap,
							this.midX - this.lineGap,
							this.entityWidth,
							-90
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(halfEntity, midY - this.entityWidth / 2, this.midX - halfEntity, halfEntity, 1);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							halfEntity,
							midY - this.entityWidth / 2,
							this.midX - halfEntity,
							halfEntity
						);
					default:
						return '';
				}
			case 'solar-to-battery':
				return SVGUtils.getCurvePath(this.midX, this.entityWidth, this.midX, this.height - this.entityWidth, 0);
			case 'grid-to-house':
				return SVGUtils.getCurvePath(this.entityWidth, midY, this.width - this.entityWidth, midY, 0);
			default:
				return '';
		}
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-layout-square': GivTCPPowerFlowCardLayoutSquare;
	}
}
