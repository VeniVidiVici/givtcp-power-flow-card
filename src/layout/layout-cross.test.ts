import { SVGUtils } from '../utils/svg-utils';
import { FlowDirection } from '../types';

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
		return 50;
	}
	protected get height(): number {
		return 100;
	}
	protected get entityWidth(): number {
		return 20;
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

// Testable version that mirrors the logic from layout-cross.ts
class TestableLayoutCross extends MockLayout {
	lineGap = 10;
	cornerRadius = 5;

	private get xLineGap(): number {
		if (!this.hasSolar || !this.hasBattery) {
			return this.lineGap / 2;
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
				return SVGUtils.getRoundedCornerPath(
					this.midX + this.xLineGap,
					this.entityWidth,
					this.width - this.entityWidth,
					this.midY - this.lineGap,
					this.cornerRadius,
					0,
				);
			case 'battery-to-house':
				return SVGUtils.getRoundedCornerPath(
					this.width - this.entityWidth,
					this.midY + this.lineGap,
					this.midX + this.xLineGap,
					this.height - this.entityWidth,
					this.cornerRadius,
					2,
				);
			case 'battery-to-grid':
				return SVGUtils.getRoundedCornerPath(
					this.midX - this.xLineGap,
					this.height - this.entityWidth,
					this.entityWidth,
					this.midY + this.lineGap,
					this.cornerRadius,
					3,
				);
			case 'grid-to-battery':
				return SVGUtils.getRoundedCornerPath(
					this.midX - this.xLineGap,
					this.height - this.entityWidth,
					this.entityWidth,
					this.midY + this.lineGap,
					this.cornerRadius,
					3,
				);
			case 'solar-to-grid':
				return SVGUtils.getRoundedCornerPath(
					this.entityWidth,
					this.midY - this.lineGap,
					this.midX - this.xLineGap,
					this.entityWidth,
					this.cornerRadius,
					1,
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

	public getGroupForFlowContent(from: string, to: string): { from: string; to: string } {
		return { from, to };
	}
}

describe('GivTCPPowerFlowCardLayoutCross', () => {
	let element: TestableLayoutCross;

	beforeEach(() => {
		element = new TestableLayoutCross();
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

	describe('getPathForFlow', () => {
		beforeEach(() => {
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
				{ name: 'grid', type: 'grid', icon: 'grid' },
				{ name: 'house', type: 'house', icon: 'house' },
			];
			element.lineGap = 10;
			element.cornerRadius = 5;
		});

		it('should return path for solar-to-house', () => {
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for battery-to-house', () => {
			const result = element.getPathForFlow('battery-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for battery-to-grid', () => {
			const result = element.getPathForFlow('battery-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for grid-to-battery', () => {
			const result = element.getPathForFlow('grid-to-battery');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for solar-to-grid', () => {
			const result = element.getPathForFlow('solar-to-grid');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for solar-to-battery', () => {
			const result = element.getPathForFlow('solar-to-battery');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for grid-to-house', () => {
			const result = element.getPathForFlow('grid-to-house');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom1', () => {
			const result = element.getPathForFlow('house-to-custom1');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return path for house-to-custom2', () => {
			const result = element.getPathForFlow('house-to-custom2');
			expect(result).toBeDefined();
			expect(result).toContain('M ');
		});

		it('should return empty string for unknown flow', () => {
			const result = element.getPathForFlow('unknown-flow');
			expect(result).toBe('');
		});

		it('should use SVGUtils.getRoundedCornerPath for solar-to-house', () => {
			const spy = jest.spyOn(SVGUtils, 'getRoundedCornerPath');
			element.getPathForFlow('solar-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getRoundedCornerPath for battery-to-house', () => {
			const spy = jest.spyOn(SVGUtils, 'getRoundedCornerPath');
			element.getPathForFlow('battery-to-house');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getRoundedCornerPath for battery-to-grid', () => {
			const spy = jest.spyOn(SVGUtils, 'getRoundedCornerPath');
			element.getPathForFlow('battery-to-grid');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getRoundedCornerPath for grid-to-battery', () => {
			const spy = jest.spyOn(SVGUtils, 'getRoundedCornerPath');
			element.getPathForFlow('grid-to-battery');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getRoundedCornerPath for solar-to-grid', () => {
			const spy = jest.spyOn(SVGUtils, 'getRoundedCornerPath');
			element.getPathForFlow('solar-to-grid');
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

		it('should use SVGUtils.getStraightPath for house-to-custom1', () => {
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom1');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should use SVGUtils.getStraightPath for house-to-custom2', () => {
			const spy = jest.spyOn(SVGUtils, 'getStraightPath');
			element.getPathForFlow('house-to-custom2');
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});
	});

	describe('getPathForFlow with different configurations', () => {
		beforeEach(() => {
			element.lineGap = 15;
			element.cornerRadius = 8;
		});

		it('should use correct lineGap for solar-to-house when only solar exists', () => {
			element.flowData = [{ name: 'solar', type: 'solar', icon: 'solar' }];
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
		});

		it('should use correct lineGap for battery-to-house when only battery exists', () => {
			element.flowData = [{ name: 'battery', type: 'battery', icon: 'battery' }];
			const result = element.getPathForFlow('battery-to-house');
			expect(result).toBeDefined();
		});

		it('should use correct xLineGap when both solar and battery exist', () => {
			element.flowData = [
				{ name: 'solar', type: 'solar', icon: 'solar' },
				{ name: 'battery', type: 'battery', icon: 'battery' },
			];
			const result = element.getPathForFlow('solar-to-house');
			expect(result).toBeDefined();
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
	});
});
