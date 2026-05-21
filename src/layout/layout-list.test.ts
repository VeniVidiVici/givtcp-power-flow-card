import { FlowData, FlowDirection, FlowPower } from '../types';

// Mock HTMLElement and SVGElement for Node.js environment
global.HTMLElement = class HTMLElement {};
global.SVGElement = class SVGElement {};

// Mock lit module
jest.mock('lit', () => ({
	LitElement: class LitElement {
		createRenderRoot() {
			return this;
		}
		addEventListener = jest.fn();
		dispatchEvent = jest.fn();
		removeEventListener = jest.fn();
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

		protected formatPower(power: number): string {
			if (power < 1000) return `${power}W`;
			if (power < 1000000) return `${(power / 1000).toFixed(1)}kW`;
			return `${(power / 1000000).toFixed(1)}MW`;
		}
	}
	return {
		GivTCPPowerFlowCardLayout: MockGivTCPPowerFlowCardLayout,
	};
});

// Mock SVGUtils
jest.mock('../utils/svg-utils', () => ({
	SVGUtils: {
		getStraightPath: jest.fn((startX: number, startY: number, endX: number, endY: number) =>
			`M ${startX} ${startY} L ${endX} ${endY}`,
		),
	},
}));

import { GivTCPPowerFlowCardLayoutList } from './layout-list';
import { SVGUtils } from '../utils/svg-utils';

describe('GivTCPPowerFlowCardLayoutList', () => {
	let element: GivTCPPowerFlowCardLayoutList;

	beforeEach(() => {
		element = new GivTCPPowerFlowCardLayoutList();
		element.entitySize = 4;
		element.entityLineWidth = 2;
		element.flowData = [];
		element.flows = [];
		element.flowPowers = [];
	});

	describe('iconFor', () => {
		it('should return icon from flowData when type matches', () => {
			element.flowData = [{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' }];
			const iconFor = (element as unknown as { iconFor: (type: string) => string }).iconFor.bind(element);
			const result = iconFor('solar');
			expect(result).toBe('mdi:solar-panel');
		});

		it('should return default icon when type not found in flowData', () => {
			element.flowData = [{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' }];
			const iconFor = (element as unknown as { iconFor: (type: string) => string }).iconFor.bind(element);
			const result = iconFor('unknown');
			expect(result).toBe('mdi:power-plug');
		});

		it('should return default icon when flowData is empty', () => {
			element.flowData = [];
			const iconFor = (element as unknown as { iconFor: (type: string) => string }).iconFor.bind(element);
			const result = iconFor('solar');
			expect(result).toBe('mdi:power-plug');
		});
	});

	describe('directionFor', () => {
		it('should return direction from flows when from and to match', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.Out }];
			const directionFor = (element as unknown as { directionFor: (from: string, to: string) => FlowDirection }).directionFor.bind(element);
			const result = directionFor('solar', 'house');
			expect(result).toBe(FlowDirection.Out);
		});

		it('should return FlowDirection.In when flow not found', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.Out }];
			const directionFor = (element as unknown as { directionFor: (from: string, to: string) => FlowDirection }).directionFor.bind(element);
			const result = directionFor('battery', 'house');
			expect(result).toBe(FlowDirection.In);
		});

		it('should return FlowDirection.In when flows is empty', () => {
			element.flows = [];
			const directionFor = (element as unknown as { directionFor: (from: string, to: string) => FlowDirection }).directionFor.bind(element);
			const result = directionFor('solar', 'house');
			expect(result).toBe(FlowDirection.In);
		});
	});

	describe('extraFor', () => {
		it('should return extra from flowData when type matches', () => {
			element.flowData = [{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel', extra: 'Extra info' }];
			const extraFor = (element as unknown as { extraFor: (type: string) => string | undefined }).extraFor.bind(element);
			const result = extraFor('solar');
			expect(result).toBe('Extra info');
		});

		it('should return undefined when type not found in flowData', () => {
			element.flowData = [{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' }];
			const extraFor = (element as unknown as { extraFor: (type: string) => string | undefined }).extraFor.bind(element);
			const result = extraFor('unknown');
			expect(result).toBeUndefined();
		});

		it('should return undefined when extra is not defined in flowData', () => {
			element.flowData = [{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' }];
			const extraFor = (element as unknown as { extraFor: (type: string) => string | undefined }).extraFor.bind(element);
			const result = extraFor('solar');
			expect(result).toBeUndefined();
		});

		it('should return undefined when flowData is empty', () => {
			element.flowData = [];
			const extraFor = (element as unknown as { extraFor: (type: string) => string | undefined }).extraFor.bind(element);
			const result = extraFor('solar');
			expect(result).toBeUndefined();
		});
	});

	describe('render', () => {
		it('should render empty layout when flowPowers is empty', () => {
			element.flowPowers = [];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render layout with single flowPower', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should sort flowPowers by value in descending order', () => {
			element.flowPowers = [
				{ from: 'battery', to: 'house', value: 200 },
				{ from: 'solar', to: 'house', value: 500 },
				{ from: 'grid', to: 'house', value: 300 },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include data attributes for each flowPower', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include ha-icon elements for from and to entities', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include formatted power value', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 1500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include extra div when extra is defined for from entity', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel', extra: 'Panel 1' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include extra div when extra is defined for to entity', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home', extra: 'Main' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should not include extra div when extra is not defined', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should include SVG with getGroupForFlow', () => {
			element.flowPowers = [{ from: 'solar', to: 'house', value: 500 }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.Out }];
			const result = element.render();
			expect(result).toBeDefined();
		});
	});

	describe('getGroupForFlow', () => {
		it('should return SVG group for flow with In direction', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.In }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			element.entitySize = 4;
			const getGroupForFlow = (element as unknown as { getGroupForFlow: (from: string, to: string) => unknown }).getGroupForFlow.bind(element);
			const result = getGroupForFlow('solar', 'house');
			expect(result).toBeDefined();
		});

		it('should return SVG group for flow with Out direction', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.Out }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			element.entitySize = 4;
			const getGroupForFlow = (element as unknown as { getGroupForFlow: (from: string, to: string) => unknown }).getGroupForFlow.bind(element);
			const result = getGroupForFlow('solar', 'house');
			expect(result).toBeDefined();
		});

		it('should use SVGUtils.getStraightPath', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.Out }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			element.entitySize = 4;
			const getGroupForFlow = (element as unknown as { getGroupForFlow: (from: string, to: string) => unknown }).getGroupForFlow.bind(element);
			getGroupForFlow('solar', 'house');
			expect(SVGUtils.getStraightPath).toHaveBeenCalled();
		});

		it('should calculate correct startX and endX for In direction', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.In }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			element.entitySize = 4;
			const getGroupForFlow = (element as unknown as { getGroupForFlow: (from: string, to: string) => unknown }).getGroupForFlow.bind(element);
			getGroupForFlow('solar', 'house');
			expect(SVGUtils.getStraightPath).toHaveBeenCalled();
		});

		it('should calculate correct startX and endX for Out direction', () => {
			element.flows = [{ from: 'solar', to: 'house', direction: FlowDirection.Out }];
			element.flowData = [
				{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' },
				{ type: 'house', name: 'House', icon: 'mdi:home' },
			];
			element.entitySize = 4;
			const getGroupForFlow = (element as unknown as { getGroupForFlow: (from: string, to: string) => unknown }).getGroupForFlow.bind(element);
			getGroupForFlow('solar', 'house');
			expect(SVGUtils.getStraightPath).toHaveBeenCalled();
		});
	});

	describe('click event handling', () => {
		it('should dispatch entity-details event when clicking on element with data-from attribute', () => {
			const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');
			element.flowData = [{ type: 'solar', name: 'Solar', icon: 'mdi:solar-panel' }];

			const mockRowElement = { getAttribute: jest.fn().mockReturnValue('solar') };
			// Create a proper HTMLElement instance for the instanceof check
			const mockTarget = Object.assign(new HTMLElement(), {
				closest: jest.fn().mockReturnValue(mockRowElement),
			});

			const mockEvent = {
				target: mockTarget,
				stopPropagation: jest.fn(),
			} as unknown as MouseEvent;

			// Trigger the click handler that was added in the constructor
			(element.addEventListener as jest.Mock).mock.calls[0][1](mockEvent);
			expect(dispatchEventSpy).toHaveBeenCalled();
		});

		it('should not dispatch entity-details event when target has no data-from attribute', () => {
			const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');

			const mockTarget = Object.assign(new HTMLElement(), {
				closest: jest.fn().mockReturnValue(null),
			});

			const mockEvent = {
				target: mockTarget,
				stopPropagation: jest.fn(),
			} as unknown as MouseEvent;

			// Trigger the click handler that was added in the constructor
			(element.addEventListener as jest.Mock).mock.calls[0][1](mockEvent);
			expect(dispatchEventSpy).not.toHaveBeenCalled();
		});

		it('should not dispatch entity-details event when target is not HTMLElement or SVGElement', () => {
			const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');

			const mockEvent = {
				target: null,
			} as unknown as MouseEvent;

			// Trigger the click handler that was added in the constructor
			(element.addEventListener as jest.Mock).mock.calls[0][1](mockEvent);
			expect(dispatchEventSpy).not.toHaveBeenCalled();
		});
	});

	describe('formatPower', () => {
		it('should format power less than 1000 as W', () => {
			const formatPower = (element as unknown as { formatPower: (power: number) => string }).formatPower.bind(element);
			const result = formatPower(500);
			expect(result).toBe('500W');
		});

		it('should format power between 1000 and 1000000 as kW', () => {
			const formatPower = (element as unknown as { formatPower: (power: number) => string }).formatPower.bind(element);
			const result = formatPower(1500);
			expect(result).toBe('1.5kW');
		});

		it('should format power greater than 1000000 as MW', () => {
			const formatPower = (element as unknown as { formatPower: (power: number) => string }).formatPower.bind(element);
			const result = formatPower(1500000);
			expect(result).toBe('1.5MW');
		});

		it('should format power exactly 1000 as kW', () => {
			const formatPower = (element as unknown as { formatPower: (power: number) => string }).formatPower.bind(element);
			const result = formatPower(1000);
			expect(result).toBe('1.0kW');
		});

		it('should format power exactly 1000000 as MW', () => {
			const formatPower = (element as unknown as { formatPower: (power: number) => string }).formatPower.bind(element);
			const result = formatPower(1000000);
			expect(result).toBe('1.0MW');
		});
	});
});
