import { TemplateResult, html, svg } from 'lit';
import { GivTCPPowerFlowCardLayout } from './layout';
import { customElement, property } from 'lit/decorators.js';
import { SVGUtils } from '../utils/svg-utils';

@customElement('givtcp-power-flow-card-layout-circle')
export class GivTCPPowerFlowCardLayoutCircle extends GivTCPPowerFlowCardLayout {
	@property() centreEntity!: string;
	@property() circleSize!: number;
	private readonly _coreTypes = ['solar', 'grid', 'house', 'battery'];
	private readonly _coreSlotOrder = ['solar', 'house', 'battery', 'grid'];

	private get circleMidY(): number {
		if ((this.hasCustom1 && this.hasCustom2) || (this.hasSolar && this.hasCustom2)) {
			return Math.round(this.height / 2);
		} else if (this.hasBattery && !this.hasSolar) {
			return 0;
		} else if (this.hasSolar && !this.hasBattery) {
			return this.height;
		} else {
			return Math.round(this.height / 2);
		}
	}
	private isCentred(type: string): boolean {
		return this.centreEntity !== 'none' && this.centreEntity !== 'inverter' && this.centreEntity === type;
	}
	private get hasCentredCore(): boolean {
		return this._coreTypes.includes(this.centreEntity);
	}
	private isCoreType(type: string): boolean {
		return this._coreTypes.includes(type);
	}
	private getVisibleOuterCoreTypes(): string[] {
		return this._coreSlotOrder.filter(
			(type) => this.flowData.some((flow) => flow.type === type) && !this.isCentred(type),
		);
	}
	private getCoreSlot(type: string): number | undefined {
		const order = this.hasCentredCore ? this.getVisibleOuterCoreTypes() : this._coreSlotOrder;
		const index = order.indexOf(type);
		return index === -1 ? undefined : index;
	}
	private getPresentOuterCoreSlots(): number[] {
		return this.getVisibleOuterCoreTypes()
			.map((type) => this.getCoreSlot(type))
			.filter((slot): slot is number => slot !== undefined);
	}
	private getIntermediateSlots(start: number, end: number, clockwise: boolean, totalSlots: number): number[] {
		const slots: number[] = [];
		let current = start;
		while (true) {
			current = clockwise ? (current + 1) % totalSlots : (current + totalSlots - 1) % totalSlots;
			if (current === end) {
				return slots;
			}
			slots.push(current);
		}
	}
	private getArcPath(startSlot: number, endSlot: number, clockwise: boolean, totalSlots: number): string {
		const circumference = 2 * Math.PI * this.circleSize;
		const trimDegrees = ((this.entityWidth / circumference) * 360) / 2;
		const angleStep = 360 / totalSlots;
		const slotToAngle = (slot: number) => -90 + slot * angleStep;
		const startAngle = slotToAngle(startSlot) + (clockwise ? trimDegrees : -trimDegrees);
		const endAngle = slotToAngle(endSlot) + (clockwise ? -trimDegrees : trimDegrees);
		const normalisedSweep = clockwise ? (endAngle - startAngle + 360) % 360 : (startAngle - endAngle + 360) % 360;
		const largeArcFlag = normalisedSweep > 180 ? 1 : 0;
		const sweepFlag = clockwise ? 1 : 0;
		const toPoint = (angle: number) => {
			const radians = (angle * Math.PI) / 180;
			return {
				x: this.midX + this.circleSize * Math.cos(radians),
				y: this.circleMidY + this.circleSize * Math.sin(radians),
			};
		};
		const start = toPoint(startAngle);
		const end = toPoint(endAngle);
		return `M ${start.x} ${start.y} A ${this.circleSize} ${this.circleSize} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
	}
	private getTrimmedStraightPath(from: string, to: string): string {
		const start = this.getEntityPoint(from);
		const end = this.getEntityPoint(to);
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance === 0) {
			return '';
		}
		const trim = this.entityWidth / 2;
		const startX = start.x + (dx / distance) * trim;
		const startY = start.y + (dy / distance) * trim;
		const endX = end.x - (dx / distance) * trim;
		const endY = end.y - (dy / distance) * trim;
		return SVGUtils.getStraightPath(startX, startY, endX, endY);
	}
	private getDynamicCorePoint(type: string): { x: number; y: number } | undefined {
		if (!this.hasCentredCore || !this.isCoreType(type) || this.isCentred(type)) {
			return undefined;
		}
		const slot = this.getCoreSlot(type);
		const totalSlots = this.getVisibleOuterCoreTypes().length;
		if (slot === undefined || totalSlots === 0) {
			return undefined;
		}
		const angle = -90 + slot * (360 / totalSlots);
		const radians = (angle * Math.PI) / 180;
		return {
			x: this.midX + this.circleSize * Math.cos(radians),
			y: this.circleMidY + this.circleSize * Math.sin(radians),
		};
	}
	private getEntityPoint(type: string): { x: number; y: number } {
		const half = this.entityWidth / 2;
		if (this.isCentred(type)) {
			return { x: this.midX, y: this.circleMidY };
		}
		const dynamicCorePoint = this.getDynamicCorePoint(type);
		if (dynamicCorePoint) {
			return dynamicCorePoint;
		}

		switch (type) {
			case 'grid':
				return { x: half, y: this.midY };
			case 'solar':
				return { x: this.midX, y: half };
			case 'house':
				return { x: this.width - half, y: this.midY };
			case 'battery':
				return { x: this.midX, y: this.height - half };
			case 'eps':
				return { x: half, y: this.height - half };
			case 'custom1':
				return { x: this.width - half, y: half };
			case 'custom2':
				return { x: this.width - half, y: this.height - half };
			default:
				return { x: this.midX, y: this.circleMidY };
		}
	}
	private getEntityStyle(type: string): string {
		const point = this.getEntityPoint(type);
		const left = (point.x / this.width) * 100;
		const top = (point.y / this.height) * 100;
		return `left: ${left}%; top: ${top}%; transform: translate(-50%, -50%);`;
	}
	render(): TemplateResult {
		let showClass = 'full';
		if (!this.hasSolar && !this.hasCustom1) {
			showClass = 'no-solar';
		} else if (!this.hasBattery && !this.hasCustom2) {
			showClass = 'no-battery';
		}
		return html`
			<div class="gtpc-layout gtpc-${showClass} gtpc-layout-circle gtpc-centre-${this.centreEntity}">
				${this.flowData.map(
					(flow) =>
						html`<givtcp-power-flow-card-entity
							data-type="${flow.type}"
							style="${this.getEntityStyle(flow.type)}"
							.entityLineWidth=${this.entityLineWidth}
							.data=${flow}
						></givtcp-power-flow-card-entity>`,
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
	private getCentredCoreRingPath(from: string, to: string): string | undefined {
		const startSlot = this.getCoreSlot(from);
		const endSlot = this.getCoreSlot(to);
		const totalSlots = this.getVisibleOuterCoreTypes().length;
		if (startSlot === undefined || endSlot === undefined || totalSlots < 2) {
			return undefined;
		}
		const occupied = this.getPresentOuterCoreSlots();
		const clockwiseIntermediate = this.getIntermediateSlots(startSlot, endSlot, true, totalSlots);
		const counterclockwiseIntermediate = this.getIntermediateSlots(startSlot, endSlot, false, totalSlots);
		const clockwiseBlocked = clockwiseIntermediate.filter((slot) => occupied.includes(slot)).length;
		const counterclockwiseBlocked = counterclockwiseIntermediate.filter((slot) => occupied.includes(slot)).length;
		const clockwisePreferred =
			clockwiseBlocked < counterclockwiseBlocked ||
			(clockwiseBlocked === counterclockwiseBlocked &&
				clockwiseIntermediate.length <= counterclockwiseIntermediate.length);

		return this.getArcPath(startSlot, endSlot, clockwisePreferred, totalSlots);
	}

	private getPathForFlow(flow: string): string {
		const [from, to] = flow.split('-to-');
		if (
			this.hasCentredCore &&
			this.isCoreType(from) &&
			this.isCoreType(to) &&
			(this.isCentred(from) || this.isCentred(to))
		) {
			return this.getTrimmedStraightPath(from, to);
		}
		if (this.hasCentredCore && this.isCoreType(from) && this.isCoreType(to)) {
			const centredPath = this.getCentredCoreRingPath(from, to);
			if (centredPath) {
				return centredPath;
			}
		}
		if (this.isCentred(from) || this.isCentred(to)) {
			return this.getTrimmedStraightPath(from, to);
		}

		const halfEntity = this.entityWidth / 2;
		const circumference = Math.ceil(2 * Math.PI * this.circleSize);
		const offset = Math.ceil(((this.entityWidth - 0) / circumference) * 100);
		const segment = 25 - offset;
		switch (flow) {
			case 'solar-to-house':
				return SVGUtils.getCirclePath(segment, offset / 2, this.circleSize, { x: this.midX, y: this.circleMidY });
			case 'battery-to-house':
				return SVGUtils.getCirclePath(segment, 25 + offset / 2, this.circleSize, { x: this.midX, y: this.circleMidY });
			case 'battery-to-grid':
				return SVGUtils.getCirclePath(segment, 50 + offset / 2, this.circleSize, { x: this.midX, y: this.circleMidY });
			case 'grid-to-battery':
				return SVGUtils.getCirclePath(segment, 50 + offset / 2, this.circleSize, { x: this.midX, y: this.circleMidY });
			case 'solar-to-grid':
				return SVGUtils.getCirclePath(segment, 75 + offset / 2, this.circleSize, { x: this.midX, y: this.circleMidY });
			case 'solar-to-battery':
				return SVGUtils.getCurvePath(this.midX, this.entityWidth, this.midX, this.height - this.entityWidth, 0);
			case 'grid-to-house':
				return SVGUtils.getCurvePath(this.entityWidth, this.midY, this.width - this.entityWidth, this.midY, 0);
			case 'house-to-custom1':
				return SVGUtils.getStraightPath(
					this.width - halfEntity,
					this.entityWidth,
					this.width - halfEntity,
					this.midY - halfEntity,
				);
			case 'house-to-custom2':
				return SVGUtils.getStraightPath(
					this.width - halfEntity,
					this.height - this.entityWidth,
					this.width - halfEntity,
					this.midY + halfEntity,
				);
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
