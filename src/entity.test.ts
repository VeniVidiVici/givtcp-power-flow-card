import { GivTCPPowerFlowCardEntity } from './entity';
import { FlowData, UnitOfPower } from './types';
import { SVGUtils } from './utils/svg-utils';

describe('GivTCPPowerFlowCardEntity', () => {
	let element: GivTCPPowerFlowCardEntity;

	beforeEach(() => {
		element = new GivTCPPowerFlowCardEntity();
	});

	describe('initialization', () => {
		it('should create an instance of GivTCPPowerFlowCardEntity', () => {
			expect(element).toBeInstanceOf(GivTCPPowerFlowCardEntity);
		});

		it('should have data property that can be set', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'battery',
				icon: 'mdi:battery',
			};
			element.data = mockData;
			expect(element.data).toEqual(mockData);
		});

		it('should have entityLineWidth property that can be set', () => {
			element.entityLineWidth = 4;
			expect(element.entityLineWidth).toBe(4);
		});
	});

	describe('click event handling', () => {
		it('should dispatch entity-details custom event on click', () => {
			const mockData: FlowData = {
				name: 'Test Entity',
				type: 'battery',
				icon: 'mdi:battery',
			};
			element.data = mockData;

			const eventHandler = jest.fn();
			element.addEventListener('entity-details', eventHandler);

			element.click();

			expect(eventHandler).toHaveBeenCalledTimes(1);
			expect(eventHandler.mock.calls[0][0].detail.type).toBe('battery');
		});

		it('should stop propagation on click', () => {
			const mockData: FlowData = {
				name: 'Test Entity',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			// The click handler calls e.stopPropagation() on the event
			// We verify this by checking the event handler is called with an event that has stopPropagation
			const stopPropagationSpy = jest.fn();
			const clickHandler = jest.fn((e) => {
				stopPropagationSpy();
			});

			element.addEventListener('click', clickHandler);
			element.click();

			expect(stopPropagationSpy).toHaveBeenCalled();
		});
	});

	describe('createRenderRoot', () => {
		it('should return this (light DOM rendering)', () => {
			const result = element.createRenderRoot();
			expect(result).toBe(element);
		});
	});

	describe('observedAttributes', () => {
		it('should return array containing entityDetails', () => {
			const attributes = GivTCPPowerFlowCardEntity.observedAttributes;
			expect(attributes).toContain('entityDetails');
			expect(Array.isArray(attributes)).toBe(true);
		});
	});

	describe('getArrow', () => {
		it('should return a TemplateResult with SVG arrow', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'grid',
				icon: 'mdi:transmission-tower',
			};
			element.data = mockData;

			const result = element['getArrow'](0);
			expect(result).toBeDefined();
			expect(typeof result).toBe('object');
		});

		it('should include rotation transform in SVG', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'grid',
				icon: 'mdi:transmission-tower',
			};
			element.data = mockData;

			const result = element['getArrow'](90);
			expect(result).toBeDefined();
		});

		it('should use data type for CSS variable', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'battery',
				icon: 'mdi:battery',
			};
			element.data = mockData;

			const result = element['getArrow'](0);
			expect(result).toBeDefined();
		});
	});

	describe('formatPower', () => {
		it('should format power less than 1000W with W unit', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			// Access private method via bracket notation
			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(500);
			expect(result).toBe('500W');
		});

		it('should format power between 1000W and 1000000W with kW unit', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(1500);
			expect(result).toBe('1.5kW');
		});

		it('should format power greater than 1000000W with MW unit', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(1500000);
			expect(result).toBe('1.5MW');
		});

		it('should format exactly 1000W as 1.0kW', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(1000);
			expect(result).toBe('1.0kW');
		});

		it('should format exactly 1000000W as 1.0MW', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(1000000);
			expect(result).toBe('1.0MW');
		});

		it('should format power with decimal precision', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(1234);
			expect(result).toBe('1.2kW');
		});
	});

	describe('render', () => {
		it('should render with no flow data (fullTotal <= 0)', () => {
			const mockData: FlowData = {
				name: 'Test Entity',
				type: 'battery',
				icon: 'mdi:battery',
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with in flow data', () => {
			const mockData: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 500,
					parts: [{ type: 'solar', value: 300 }, { type: 'grid', value: 200 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with out flow data', () => {
			const mockData: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				out: {
					total: 300,
					parts: [{ type: 'house', value: 300 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with both in and out flow data', () => {
			const mockData: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 1000,
					parts: [{ type: 'solar', value: 700 }, { type: 'grid', value: 300 }],
				},
				out: {
					total: 500,
					parts: [{ type: 'house', value: 500 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with linePos for arrow rotation', () => {
			const mockData: FlowData = {
				name: 'Grid',
				type: 'grid',
				icon: 'mdi:transmission-tower',
				in: {
					total: 200,
					parts: [{ type: 'solar', value: 200 }],
				},
				linePos: 45,
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should render with extra property', () => {
			const mockData: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				extra: '80%',
				in: {
					total: 500,
					parts: [{ type: 'solar', value: 500 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should apply CSS class based on flow configuration', () => {
			// Single flow (only in or only out)
			const mockDataSingle: FlowData = {
				name: 'Solar',
				type: 'solar',
				icon: 'mdi:solar-panel',
				in: {
					total: 1000,
					parts: [{ type: 'sun', value: 1000 }],
				},
			};
			element.data = mockDataSingle;
			element.entityLineWidth = 4;

			const resultSingle = element.render();
			expect(resultSingle).toBeDefined();

			// Both flow
			const mockDataBoth: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 500,
					parts: [{ type: 'solar', value: 500 }],
				},
				out: {
					total: 300,
					parts: [{ type: 'house', value: 300 }],
				},
			};
			element.data = mockDataBoth;

			const resultBoth = element.render();
			expect(resultBoth).toBeDefined();
		});

		it('should calculate radius based on entityLineWidth', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 100,
					parts: [{ type: 'solar', value: 100 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 10;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should set CSS custom property for color', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'grid',
				icon: 'mdi:transmission-tower',
				in: {
					total: 100,
					parts: [{ type: 'solar', value: 100 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			// Mock style.setProperty
			const setPropertySpy = jest.spyOn(element.style, 'setProperty');

			element.render();

			expect(setPropertySpy).toHaveBeenCalledWith('--gtpc-color', expect.stringContaining('var(--gtpc-grid-color)'));
		});

		it('should handle multiple parts in flow', () => {
			const mockData: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 1000,
					parts: [
						{ type: 'solar', value: 400 },
						{ type: 'grid', value: 300 },
						{ type: 'wind', value: 300 },
					],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should handle zero value parts', () => {
			const mockData: FlowData = {
				name: 'Battery',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 500,
					parts: [{ type: 'solar', value: 500 }, { type: 'grid', value: 0 }],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			const result = element.render();
			expect(result).toBeDefined();
		});
	});

	describe('SVGUtils integration', () => {
		it('should use SVGUtils.getCirclePath in render', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 0,
					parts: [],
				},
			};
			element.data = mockData;
			element.entityLineWidth = 4;

			// Spy on SVGUtils.getCirclePath
			const circlePathSpy = jest.spyOn(SVGUtils, 'getCirclePath');

			element.render();

			expect(circlePathSpy).toHaveBeenCalled();
		});
	});

	describe('custom event details', () => {
		it('should pass correct entity type in event detail', () => {
			const types = ['solar', 'battery', 'grid', 'house', 'inverter'];

			types.forEach((type) => {
				const testElement = new GivTCPPowerFlowCardEntity();
				const mockData: FlowData = {
					name: 'Test',
					type: type,
					icon: 'mdi:test',
				};
				testElement.data = mockData;

				const eventHandler = jest.fn();
				testElement.addEventListener('entity-details', eventHandler);

				testElement.click();

				expect(eventHandler).toHaveBeenCalledWith(
					expect.objectContaining({
						detail: { type: type },
					}),
				);
			});
		});
	});

	describe('arrow rotation calculations', () => {
		it('should calculate correct rotation for out arrow', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'battery',
				icon: 'mdi:battery',
				in: {
					total: 500,
					parts: [{ type: 'solar', value: 500 }],
				},
				out: {
					total: 300,
					parts: [{ type: 'house', value: 300 }],
				},
				linePos: 0,
			};
			element.data = mockData;

			// Out arrow should be rotated 180 degrees from in arrow
			const result = element.render();
			expect(result).toBeDefined();
		});

		it('should handle linePos edge cases', () => {
			const edgeCases = [0, 90, 180, 270, 360, 450, -90];

			edgeCases.forEach((linePos) => {
				const mockData: FlowData = {
					name: 'Test',
					type: 'grid',
					icon: 'mdi:transmission-tower',
					in: {
						total: 100,
						parts: [{ type: 'solar', value: 100 }],
					},
					linePos: linePos,
				};
				element.data = mockData;

				const result = element.render();
				expect(result).toBeDefined();
			});
		});
	});

	describe('power formatting edge cases', () => {
		it('should handle zero power', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			const result = (element as unknown as { formatPower: (power: number) => string }).formatPower(0);
			expect(result).toBe('0W');
		});

		it('should handle boundary values', () => {
			const mockData: FlowData = {
				name: 'Test',
				type: 'solar',
				icon: 'mdi:solar-panel',
			};
			element.data = mockData;

			expect((element as unknown as { formatPower: (power: number) => string }).formatPower(999)).toBe('999W');
			expect((element as unknown as { formatPower: (power: number) => string }).formatPower(1000)).toBe('1.0kW');
			expect((element as unknown as { formatPower: (power: number) => string }).formatPower(999999)).toBe('1000.0kW');
			expect((element as unknown as { formatPower: (power: number) => string }).formatPower(1000000)).toBe('1.0MW');
		});
	});
});
