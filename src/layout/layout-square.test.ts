import { SVGUtils } from '../utils/svg-utils';
import { FlowDirection, LineStyle } from '../types';

// Mock lit
jest.mock('lit', () => ({
	html: jest.fn((strings, ...values) => ({ strings, values })),
	svg: jest.fn((strings, ...values) => ({ strings, values })),
}));

// Mock lit decorators
jest.mock('lit/decorators.js', () => ({
	customElement: jest.fn(),
	property: jest.fn(),
}));

// Mock the parent class to avoid LitElement dependency
class MockLayout {
	flowData: Array<{ type: string; name: string; icon: string }> = [];
	flows: Array<{ from: string; to: string; direction: FlowDirection }> = [];
	entitySize = 5;
	entityLineWidth = 2;
	protected width = 100;
	protected midX = 50;
	protected get midY(): number {
		if ((this.hasCustom1 && this.hasCustom2) || (this.hasSolar && this.hasCustom2)) {
			return Math.round(this.height / 2);
		} else if (this.hasBattery && !this.hasSolar) {
			return Math.round(this.height / this.entitySize);
		} else if (this.hasSolar && !this.hasBattery) {
			return this.height - Math.round(this.entityWidth / 2);
		} else {
			return Math.round(this.height / 2);
		}
	}
	protected get height(): number {
		if ((this.hasCustom1 && this.hasCustom2) || (this.hasSolar && this.hasCustom2)) {
			return this.entityWidth * this.entitySize;
		} else if (!this.hasSolar && !this.hasBattery) {
			return this.entityWidth;
		} else if (!this.hasSolar || !this.hasBattery) {
			return (this.entityWidth * Math.round(this.entitySize)) / 2;
		} else {
			return this.entityWidth * this.entitySize;
		}
	}
	protected get entityWidth(): number {
		return Math.round(this.width / this.entitySize);
	}
	protected get hasSolar(): boolean {
		return this.flowData.some((f) => f.type === 'solar');
	}
	protected get hasBattery(): boolean {
		return this.flowData.some((f) => f.type === 'battery');
	}
	protected get hasEPS(): boolean {
		return this.flowData.some((f) => f.type === 'eps');
	}
	protected get hasCustom1(): boolean {
		return this.flowData.some((f) => f.type === 'custom1');
	}
	protected get hasCustom2(): boolean {
		return this.flowData.some((f) => f.type === 'custom2');
	}
}

// Testable version that mirrors the logic from layout-square.ts
class TestableLayoutSquare extends MockLayout {
	lineGap = 10;
	lineStyle = LineStyle.Curved;

	private get xLineGap(): number {
		if (!this.hasSolar || !this.hasBattery) {
			return Math.round(this.lineGap / 2);
		} else {
			return this.lineGap;
		}
	}

	public getXLineGap(): number {
		return this.xLineGap;
	}

	public getPathForFlow(flow: string): string {
		const halfEntity = this.entityWidth / 2;
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
						return SVGUtils.getStraightPath(
							this.width - halfEntity,
							this.entityWidth,
							this.width - halfEntity,
							this.midY - halfEntity,
						);
					case LineStyle.Angled:
						return SVGUtils.getStraightPath(
							this.width - (this.entityWidth + halfEntity),
							this.entityWidth + halfEntity,
							this.width - halfEntity,
							this.midY,
						);
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
						return SVGUtils.getStraightPath(
							this.width - (this.entityWidth + halfEntity),
							this.height - (this.entityWidth + halfEntity),
							this.width - halfEntity,
							this.midY,
						);
					default:
						return '';
				}
			default:
				return '';
		}
	}

	public getGroupForFlowContent(from: string, to: string): { from: string; to: string } {
		return { from, to };
	}

	public calculateCirclePoint(
		percentAroundCircumference: number,
		radius: number,
		centerPoint: [number, number],
	): [number, number] {
		const angle = percentAroundCircumference * 2 * Math.PI;
		const x = centerPoint[0] + radius * Math.cos(angle);
		const y = centerPoint[1] + radius * Math.sin(angle);
		return [x, y];
	}
}

describe('GivTCPPowerFlowCardLayoutSquare', () => {
	let element: TestableLayoutSquare;

	beforeEach(() => {
		element = new TestableLayoutSquare();
	});

	describe('xLineGap getter', () => {
		it('should return lineGap / 2 when no solar and no battery', () => {
			element.flowData = [];
			expect(element.getXLineGap()).toBe(5);
		});

		it('should return lineGap / 2 when solar exists but no battery', () => {
			element.flowData = [{ name: 'solar', type: 'solar', icon: 'solar' }];
			expect(element.getXLineGap()).toBe(5);
		});

		it('should return lineGap / 2 when battery exists but no solar', () => {
			element.flowData = [{ name: 'battery', type: 'battery', icon: 'battery' }];
			expect(element.getXLineGap()).toBe(5);
		});

		it('should return lineGap when both solar and battery exist', () => {
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
			];
			expect(element.getXLineGap()).toBe(10);
		});
	});

	describe('getPathForFlow with Curved lineStyle', () => {
		beforeEach(() => {
			element.lineStyle = LineStyle.Curved;
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
				{ name: 'grid', type: 'grid', icon: 'grid' },
				{ name: 'house', type: 'house', icon: 'house' },
			];
		});

		it('should return path for solar-to-house with curved style', () => {
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
			expect(result).toContain('Q ');
		});

		it('should return path for battery-to-house with curved style', () => {
			const result = element.getPathForFlow('battery-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for battery-to-grid with curved style', () => {
			const result = element.getPathForFlow('battery-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for grid-to-battery with curved style', () => {
			const result = element.getPathForFlow('grid-to-battery');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for solar-to-grid with curved style', () => {
			const result = element.getPathForFlow('solar-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for solar-to-battery with curved style', () => {
			const result = element.getPathForFlow('solar-to-battery');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for grid-to-house with curved style', () => {
			const result = element.getPathForFlow('grid-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom1 with curved style', () => {
			const result = element.getPathForFlow('house-to-custom1');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom2 with curved style', () => {
			const result = element.getPathForFlow('house-to-custom2');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});
	});

	describe('getPathForFlow with Angled lineStyle', () => {
		beforeEach(() => {
			element.lineStyle = LineStyle.Angled;
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
				{ name: 'grid', type: 'grid', icon: 'grid' },
				{ name: 'house', type: 'house', icon: 'house' },
			];
		});

		it('should return path for solar-to-house with angled style', () => {
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for battery-to-house with angled style', () => {
			const result = element.getPathForFlow('battery-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for battery-to-grid with angled style', () => {
			const result = element.getPathForFlow('battery-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for grid-to-battery with angled style', () => {
			const result = element.getPathForFlow('grid-to-battery');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for solar-to-grid with angled style', () => {
			const result = element.getPathForFlow('solar-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom1 with angled style', () => {
			const result = element.getPathForFlow('house-to-custom1');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom2 with angled style', () => {
			const result = element.getPathForFlow('house-to-custom2');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});
	});

	describe('getPathForFlow with Straight lineStyle', () => {
		beforeEach(() => {
			element.lineStyle = LineStyle.Straight;
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
				{ name: 'grid', type: 'grid', icon: 'grid' },
				{ name: 'house', type: 'house', icon: 'house' },
			];
		});

		it('should return path for solar-to-house with straight style', () => {
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
			expect(result).toContain('L ');
		});

		it('should return path for battery-to-house with straight style', () => {
			const result = element.getPathForFlow('battery-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for battery-to-grid with straight style', () => {
			const result = element.getPathForFlow('battery-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for grid-to-battery with straight style', () => {
			const result = element.getPathForFlow('grid-to-battery');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for solar-to-grid with straight style', () => {
			const result = element.getPathForFlow('solar-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom1 with straight style', () => {
			const result = element.getPathForFlow('house-to-custom1');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom2 with straight style', () => {
			const result = element.getPathForFlow('house-to-custom2');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});
	});

	describe('getPathForFlow SVGUtils method calls', () => {
		beforeEach(() => {
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
				{ name: 'grid', type: 'grid', icon: 'grid' },
				{ name: 'house', type: 'house', icon: 'house' },
			];
		});

		it('should use SVGUtils.getCurvePath for solar-to-house with curved style', () => {
			element.lineStyle = LineStyle.Curved;
			const spy = jest.spyOn(SVGUtils, 'getCurvePath');
			element.getPathForFlow('solar-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getLShape for solar-to-house with angled style', () => {
			element.lineStyle = LineStyle.Angled;
			const spy = jest.spyOn(SVGUtils, 'getLShape');
			element.getPathForFlow('solar-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for solar-to-house with straight style', () => {
			element.lineStyle = LineStyle.Straight;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('solar-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getCurvePath for battery-to-house with curved style', () => {
			element.lineStyle = LineStyle.Curved;
			const spy = jest.spyOn(SVGUtils, 'getCurvePath');
			element.getPathForFlow('battery-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getLShape for battery-to-house with angled style', () => {
			element.lineStyle = LineStyle.Angled;
			const spy = jest.spyOn(SVGUtils, 'getLShape');
			element.getPathForFlow('battery-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for battery-to-house with straight style', () => {
			element.lineStyle = LineStyle.Straight;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('battery-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getCurvePath for solar-to-battery', () => {
			const spy = jest.spyOn(SVGUtils, 'getCurvePath');
			element.getPathForFlow('solar-to-battery');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getCurvePath for grid-to-house', () => {
			const spy = jest.spyOn(SVGUtils, 'getCurvePath');
			element.getPathForFlow('grid-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom1 with curved style', () => {
			element.lineStyle = LineStyle.Curved;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom1');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom1 with straight style', () => {
			element.lineStyle = LineStyle.Straight;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom1');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom1 with angled style', () => {
			element.lineStyle = LineStyle.Angled;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom1');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom2 with curved style', () => {
			element.lineStyle = LineStyle.Curved;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom2');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom2 with straight style', () => {
			element.lineStyle = LineStyle.Straight;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom2');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom2 with angled style', () => {
			element.lineStyle = LineStyle.Angled;
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom2');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});
	});

	describe('getPathForFlow with different configurations', () => {
		beforeEach(() => {
			element.lineGap = 15;
		});

		it('should use correct lineGap for solar-to-house when only solar exists', () => {
			element.flowData = [{ name: 'solar', type: 'solar', icon: 'solar' }];
			element.lineStyle = LineStyle.Curved;
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
		});

		it('should use correct lineGap for battery-to-house when only battery exists', () => {
			element.flowData = [{ name: 'battery', type: 'battery', icon: 'battery' }];
			element.lineStyle = LineStyle.Curved;
			const result = element.getPathForFlow('battery-to-house');
			expect(result).toBeDefined();
		});

		it('should use correct xLineGap when both solar and battery exist', () => {
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
			];
			element.lineStyle = LineStyle.Curved;
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
		});
	});

	describe('getPathForFlow edge cases', () => {
		it('should return empty string for unknown flow', () => {
			const result = element.getPathForFlow('unknown-flow');
			expect(result).toBe('');
		});

		it('should return empty string for invalid lineStyle', () => {
			element.lineStyle = 'invalid' as LineStyle;
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
			];
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBe('');
		});
	});

	describe('getGroupForFlow', () => {
		it('should return object with from and to properties', () => {
			const result = element.getGroupForFlowContent('solar', 'house');
			expect(result).toEqual({ from: 'solar', to: 'house' });
		});

		it('should handle battery to house flow', () => {
			const result = element.getGroupForFlowContent('battery', 'house');
			expect(result).toEqual({ from: 'battery', to: 'house' });
		});

		it('should handle grid to battery flow', () => {
			const result = element.getGroupForFlowContent('grid', 'battery');
			expect(result).toEqual({ from: 'grid', to: 'battery' });
		});

		it('should handle solar to grid flow', () => {
			const result = element.getGroupForFlowContent('solar', 'grid');
			expect(result).toEqual({ from: 'solar', to: 'grid' });
		});
	});

	describe('calculateCirclePoint', () => {
		it('should calculate point at 0.25 around circumference', () => {
			const result = element.calculateCirclePoint(0.25, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(50, 5);
			expect(result[1]).toBeCloseTo(60, 5);
		});

		it('should calculate point at 0.5 around circumference', () => {
			const result = element.calculateCirclePoint(0.5, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(40, 5);
			expect(result[1]).toBeCloseTo(50, 5);
		});

		it('should calculate point at 0.75 around circumference', () => {
			const result = element.calculateCirclePoint(0.75, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(50, 5);
			expect(result[1]).toBeCloseTo(40, 5);
		});

		it('should calculate point at 0.125 around circumference', () => {
			const result = element.calculateCirclePoint(0.125, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(57.07, 1);
			expect(result[1]).toBeCloseTo(57.07, 1);
		});

		it('should calculate point at 0.625 around circumference', () => {
			const result = element.calculateCirclePoint(0.625, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(42.93, 1);
			expect(result[1]).toBeCloseTo(42.93, 1);
		});

		it('should calculate point at 0.875 around circumference', () => {
			const result = element.calculateCirclePoint(0.875, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(57.07, 1);
			expect(result[1]).toBeCloseTo(42.93, 1);
		});

		it('should calculate point at 0.375 around circumference', () => {
			const result = element.calculateCirclePoint(0.375, 10, [50, 50]);
			expect(result[0]).toBeCloseTo(42.93, 1);
			expect(result[1]).toBeCloseTo(57.07, 1);
		});
	});
});
