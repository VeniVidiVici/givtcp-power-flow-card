import { TemplateResult, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from '../utils/svg-utils';
import { LineStyle } from '../types';

@customElement('givtcp-power-flow-card-layout-square')
export class GivTCPPowerFlowCardLayoutSquare extends GivTCPPowerFlowCardLayout {
	@property() lineGap!: number;
	@property() lineStyle!: string;

	private get xLineGap(): number {
		if (!this.hasSolar || !this.hasBattery) {
			return Math.round(this.lineGap / 2);
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
			<div class="gtpc-layout gtpc-${showClass} gtpc-line-style-${this.lineStyle} gtpc-layout-square">
				${this.flowData.map(
					(flow) =>
						html`<givtcp-power-flow-card-entity
							data-type="${flow.type}"
							.entityLineWidth=${this.entityLineWidth}
							.data=${flow}
						/>`,
				)}
				<svg viewBox="0 0 ${this.width} ${this.height}" xmlns="http://www.w3.org/2000/svg">
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
		let start, end;
		switch (flow) {
			case 'solar-to-house':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.midX + this.xLineGap,
							this.entityWidth,
							this.width - this.entityWidth,
							this.midY - this.lineGap,
							-90,
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.midX + halfEntity,
							halfEntity,
							this.width - halfEntity,
							this.midY - halfEntity,
							0,
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.midX + halfEntity,
							halfEntity,
							this.width - halfEntity,
							this.midY - halfEntity,
						);
					default:
						return '';
				}
			case 'battery-to-house':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.width - this.entityWidth,
							this.midY + this.lineGap,
							this.midX + this.xLineGap,
							this.height - this.entityWidth,
							-90,
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.width - halfEntity,
							this.midY + halfEntity,
							this.midX + halfEntity,
							this.height - halfEntity,
							1,
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.width - halfEntity,
							this.midY + halfEntity,
							this.midX + halfEntity,
							this.height - halfEntity,
						);
					default:
						return '';
				}
			case 'battery-to-grid':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.midX - this.xLineGap,
							this.height - this.entityWidth,
							this.entityWidth,
							this.midY + this.lineGap,
							-90,
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							this.midY + halfEntity,
							0,
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							this.midY + halfEntity,
						);
					default:
						return '';
				}
			case 'grid-to-battery':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.midX - this.xLineGap,
							this.height - this.entityWidth,
							this.entityWidth,
							this.midY + this.lineGap,
							-90,
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							this.midY + halfEntity,
							0,
						);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.midX - halfEntity,
							this.height - halfEntity,
							halfEntity,
							this.midY + halfEntity,
						);
					default:
						return '';
				}
			case 'solar-to-grid':
				switch (this.lineStyle) {
					case LineStyle.Curved:
						return SVGUtils.getCurvePath(
							this.entityWidth,
							this.midY - this.lineGap,
							this.midX - this.xLineGap,
							this.entityWidth,
							-90,
						);
					case LineStyle.Angled:
						return SVGUtils.getLShape(halfEntity, this.midY - halfEntity, this.midX - halfEntity, halfEntity, 1);
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(halfEntity, this.midY - halfEntity, this.midX - halfEntity, halfEntity);
					default:
						return '';
				}
			case 'solar-to-battery':
				return SVGUtils.getCurvePath(this.midX, this.entityWidth, this.midX, this.height - this.entityWidth, 0);
			case 'grid-to-house':
				return SVGUtils.getCurvePath(this.entityWidth, this.midY, this.width - this.entityWidth, this.midY, 0);
			case 'house-to-custom1':
				switch (this.lineStyle) {
					case LineStyle.Curved:
					case LineStyle.Straight:
						// start = this.calculateCirclePoint(0.25, halfEntity, [
						// 	this.width - halfEntity,
						// 	halfEntity,
						// ]);
						// end = this.calculateCirclePoint(0.75, halfEntity, [this.width - halfEntity, this.midY]);
						// return SVGUtils.getStraightPath(start[0], start[1], end[0], end[1]);
						return SVGUtils.getStraightPath(
							this.width - halfEntity,
							this.entityWidth,
							this.width - halfEntity,
							this.midY - halfEntity,
						);
					case LineStyle.Angled:
						start = this.calculateCirclePoint(0.125, halfEntity, [
							this.width - (this.entityWidth + halfEntity),
							this.entityWidth + halfEntity,
						]);
						end = this.calculateCirclePoint(0.625, halfEntity, [this.width - halfEntity, this.midY]);
						return SVGUtils.getStraightPath(start[0], start[1], end[0], end[1]);
					default:
						return '';
				}
			case 'house-to-custom2':
				switch (this.lineStyle) {
					case LineStyle.Curved:
					case LineStyle.Straight:
						return SVGUtils.getStraightPath(
							this.width - halfEntity,
							this.height - this.entityWidth,
							this.width - halfEntity,
							this.midY + halfEntity,
						);
					case LineStyle.Angled:
						start = this.calculateCirclePoint(0.875, halfEntity, [
							this.width - (this.entityWidth + halfEntity),
							this.height - (this.entityWidth + halfEntity),
						]);
						end = this.calculateCirclePoint(0.375, halfEntity, [this.width - halfEntity, this.midY]);
						return SVGUtils.getStraightPath(start[0], start[1], end[0], end[1]);
					default:
						return '';
				}
			default:
				return '';
		}
	}
	private calculateCirclePoint(
		percentAroundCircumference: number,
		radius: number,
		centerPoint: [number, number],
	): [number, number] {
		// Calculate the angle in radians for the given percent around the circumference
		const angle = percentAroundCircumference * 2 * Math.PI;

		// Calculate the x and y coordinates of the point on the circle using trigonometry
		const x = centerPoint[0] + radius * Math.cos(angle);
		const y = centerPoint[1] + radius * Math.sin(angle);

		// Return the x and y coordinates
		return [x, y];
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-layout-square': GivTCPPowerFlowCardLayoutSquare;
	}
}
