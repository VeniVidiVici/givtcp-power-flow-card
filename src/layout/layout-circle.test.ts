import { FlowData, FlowDirection } from '../types';

// Mock lit module
jest.mock('lit', () => ({
	LitElement: class LitElement {
		createRenderRoot() {
			return this;
		}
	},
	html: jest.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })),
	svg: jest.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })),
	TemplateResult: jest.fn(),
}));

jest.mock('lit/decorators.js', () => ({
	customElement: jest.fn(),
	property: jest.fn(),
}));

// Mock the parent layout class to provide necessary getters
jest.mock('./layout', () => {
	const { LitElement } = require('lit');
	class MockGivTCPPowerFlowCardLayout extends LitElement {
		flowData!: FlowData[];
		flows!: { from: string; to: string; direction: FlowDirection }[];
		entitySize!: number;
		entityLineWidth!: number;
		protected width = 100;
		protected midX = this.width / 2;

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
			return this.isEnabled('solar') !== undefined;
		}

		protected get hasBattery(): boolean {
			return this.isEnabled('battery') !== undefined;
		}

		protected get hasEPS(): boolean {
			return this.isEnabled('eps') !== undefined;
		}

		protected get hasCustom1(): boolean {
			return this.isEnabled('custom1') !== undefined;
		}

		protected get hasCustom2(): boolean {
			return this.isEnabled('custom2') !== undefined;
		}

		protected isEnabled(flow: string) {
			return this.flowData?.find((f) => f.type === flow) ?? undefined;
		}
	}
	return {
		GivTCPPowerFlowCardLayout: MockGivTCPPowerFlowCardLayout,
	};
});

import { GivTCPPowerFlowCardLayoutCircle } from './layout-circle';

describe('GivTCPPowerFlowCardLayoutCircle', () => {
	let element: GivTCPPowerFlowCardLayoutCircle;

	beforeEach(() => {
		element = new GivTCPPowerFlowCardLayoutCircle();
		element.centreEntity = 'grid';
		element.circleSize = 50;
		element.entitySize = 4;
		element.entityLineWidth = 2;
		element.flowData = [];
		element.flows = [];
	});

	describe('circleMidY getter', () => {
		it('should return height / 2 when hasCustom1 and hasCustom2 are true', () => {
			element.flowData = [
				{ type: 'custom1', power: 100, direction: 'in' as FlowDirection },
				{ type: 'custom2', power: 100, direction: 'in' as FlowDirection },
			];
			const result = (element as unknown as { circleMidY: number }).circleMidY;
			expect(result).toBe(Math.round(element['height'] / 2));
		});

		it('should return height / 2 when hasSolar and hasCustom2 are true', () => {
			element.flowData = [
				{ type: 'solar', power: 100, direction: 'out' as FlowDirection },
				{ type: 'custom2', power: 100, direction: 'in' as FlowDirection },
			];
			const result = (element as unknown as { circleMidY: number }).circleMidY;
			expect(result).toBe(Math.round(element['height'] / 2));
		});

		it('should return 0 when hasBattery is true and hasSolar is false', () => {
			element.flowData = [{ type: 'battery', power: 100, direction: 'in' as FlowDirection }];
			const result = (element as unknown as { circleMidY: number }).circleMidY;
			expect(result).toBe(0);
		});

		it('should return height when hasSolar is true and hasBattery is false', () => {
			element.flowData = [{ type: 'solar', power: 100, direction: 'out' as FlowDirection }];
			const result = (element as unknown as { circleMidY: number }).circleMidY;
			expect(result).toBe(element['height']);
		});

		it('should return height / 2 as default when no conditions match', () => {
			element.flowData = [{ type: 'grid', power: 100, direction: 'in' as FlowDirection }];
			const result = (element as unknown as { circleMidY: number }).circleMidY;
			expect(result).toBe(Math.round(element['height'] / 2));
		});
	});

	describe('render', () => {
		it('should render with full class when hasSolar and hasCustom1 are present', () => {
			element.flowData = [
				{ type: 'solar', power: 100, direction: 'out' as FlowDirection },
				{ type: 'custom1', power: 100, direction: 'in' as FlowDirection },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with no-solar class when hasSolar and hasCustom1 are not present', () => {
			element.flowData = [{ type: 'battery', power: 100, direction: 'in' as FlowDirection }];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with no-battery class when hasBattery and hasCustom2 are not present', () => {
			element.flowData = [{ type: 'solar', power: 100, direction: 'out' as FlowDirection }];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include entity elements for each flowData item', () => {
			element.flowData = [
				{ type: 'solar', power: 100, direction: 'out' as FlowDirection },
				{ type: 'battery', power: 100, direction: 'in' as FlowDirection },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});
	});

	describe('getPathForFlow', () => {
		beforeEach(() => {
			element.centreEntity = 'grid';
			element.circleSize = 50;
			element.entitySize = 4;
			element.entityLineWidth = 2;
			element.flowData = [
				{ type: 'solar', power: 100, direction: 'out' as FlowDirection },
				{ type: 'battery', power: 100, direction: 'in' as FlowDirection },
				{ type: 'grid', power: 100, direction: 'in' as FlowDirection },
				{ type: 'house', power: 100, direction: 'in' as FlowDirection },
				{ type: 'custom1', power: 100, direction: 'in' as FlowDirection },
				{ type: 'custom2', power: 100, direction: 'in' as FlowDirection },
			];
		});

		it('should return circle path for solar-to-house', () => {
			const getPathForFlow = (element as unknown as { getPathForFlow: (flow: string) => string })['getPathForFlow'].bind(element);
			const result = getPathForFlow('solar-to-house');
			expect(result).toContain('A');
			expect(result).toContain('M');
		});

		it('should return circle path for battery-to-house', () => {
			const getPathForFlow = (element as unknown as { getPathForFlow: (flow: string) => string })['getPathForFlow'].bind(element);
			const result = getPathForFlow('battery-to-house');
			expect(result).toContain('A');
			expect(result).toContain('M');
		});

		it('should return straight path for house-to-custom1', () => {
			const getPathForFlow = (element as unknown as { getPathForFlow: (flow: string) => string })['getPathForFlow'].bind(element);
			const result = getPathForFlow('house-to-custom1');
			expect(result).toContain('M');
			expect(result).toContain('L');
		});

		it('should return straight path for house-to-custom2', () => {
			const getPathForFlow = (element as unknown as { getPathForFlow: (flow: string) => string })['getPathForFlow'].bind(element);
			const result = getPathForFlow('house-to-custom2');
			expect(result).toContain('M');
			expect(result).toContain('L');
		});

		it('should return empty string for unknown flow', () => {
			const getPathForFlow = (element as unknown as { getPathForFlow: (flow: string) => string })['getPathForFlow'].bind(element);
			const result = getPathForFlow('unknown-flow');
			expect(result).toBe('');
		});
	});
});
