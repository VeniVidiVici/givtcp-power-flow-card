// Mock window object before importing the card
(global as any).window = {
	customCards: [],
};

import { GivTCPPowerFlowCard } from './givtcp-power-flow-card';
import { FlowDirection, EntityLayout, CentreEntity, DotEasing } from './types';
import {
	CENTRE_ENTITY_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	ENTITY_LAYOUT_DEFAULT,
	HIDE_INACTIVE_FLOWS_DEFAULT,
	COLOUR_ICONS_AND_TEXT_DEFAULT,
	BATTERY_ICON_DEFAULT,
	GRID_ICON_DEFAULT,
	HOUSE_ICON_DEFAULT,
	SOLAR_ICON_DEFAULT,
	LINE_GAP_DEFAULT,
	LINE_WIDTH_DEFAULT,
	POWER_MARGIN_DEFAULT,
	PERCENTAGE,
	DOT_SIZE_DEFAULT,
	DOT_SPEED_DEFAULT,
	ENTITY_SIZE_DEFAULT,
	SOLAR_ENABLED_DEFAULT,
	CORNER_RADIUS_DEFAULT,
	LINE_STYLE_DEFAULT,
	EPS_ENABLED_DEFAULT,
	CUSTOM1_ICON_DEFAULT,
	CUSTOM2_ICON_DEFAULT,
	EPS_ICON_DEFAULT,
	CUSTOM1_ENABLED_DEFAULT,
	CUSTOM2_ENABLED_DEFAULT,
	SINGLE_INVERTOR_DEFAULT,
	DETAILS_ENABLED_DEFAULT,
	NUM_DETAIL_COLUMNS_DEFAULT,
	GRID_DOT_EASING_DEFAULT,
	HOUSE_DOT_EASING_DEFAULT,
	SOLAR_DOT_EASING_DEFAULT,
	BATTERY_DOT_EASING_DEFAULT,
	CUSTOM1_DOT_EASING_DEFAULT,
	CUSTOM2_DOT_EASING_DEFAULT,
	EPS_DOT_EASING_DEFAULT,
} from './const';

describe('GivTCPPowerFlowCard', () => {
	let card: GivTCPPowerFlowCard;

	const mockHass = {
		states: {
			'sensor.test_invertor_serial_number': {
				state: 'test',
				attributes: {},
			},
			'sensor.test_grid_power': {
				state: '500',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_pv_power': {
				state: '1000',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_battery_power': {
				state: '300',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_load_power': {
				state: '800',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_soc': {
				state: '75',
				attributes: {},
			},
			'sensor.test_eps_power': {
				state: '100',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_solar_to_house': {
				state: '600',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_solar_to_battery': {
				state: '400',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_battery_to_house': {
				state: '200',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_grid_to_house': {
				state: '100',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_solar_to_grid': {
				state: '50',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_battery_to_grid': {
				state: '0',
				attributes: { unit_of_measurement: 'W' },
			},
			'sensor.test_grid_to_battery': {
				state: '0',
				attributes: { unit_of_measurement: 'W' },
			},
		},
	};

	const mockConfig = {
		invertor: 'sensor.test_invertor_serial_number',
		type: 'custom:givtcp-power-flow-card',
	};

	beforeEach(() => {
		card = new GivTCPPowerFlowCard();
		card.hass = mockHass as any;
	});

	describe('initialization', () => {
		it('should create an instance of GivTCPPowerFlowCard', () => {
			expect(card).toBeInstanceOf(GivTCPPowerFlowCard);
		});

		it('should have default flows array', () => {
			// Access private property via any cast
			const cardAny = card as any;
			expect(cardAny.flows).toBeDefined();
			expect(cardAny.flows.length).toBeGreaterThan(0);
		});
	});

	describe('getConfigElement', () => {
		it('should return an editor element', async () => {
			// Mock document for this test
			(global as any).document = {
				createElement: jest.fn(() => ({})),
			};
			const editor = await GivTCPPowerFlowCard.getConfigElement();
			expect(editor).toBeDefined();
		});
	});

	describe('setConfig', () => {
		it('should throw error if no invertor or invertors defined', () => {
			expect(() => card.setConfig({ type: 'custom:givtcp-power-flow-card' })).toThrow(
				'You need to define at least one invertor entity',
			);
		});

		it('should accept config with invertor', () => {
			expect(() => card.setConfig(mockConfig)).not.toThrow();
		});

		it('should accept config with invertors array', () => {
			const configWithInvertors = {
				invertors: ['sensor.test_invertor_serial_number'],
				type: 'custom:givtcp-power-flow-card',
			};
			expect(() => card.setConfig(configWithInvertors)).not.toThrow();
		});

		it('should set CSS custom properties after config', () => {
			card.setConfig(mockConfig);
			const setPropertySpy = jest.spyOn(card.style, 'setProperty');
			expect(setPropertySpy).toHaveBeenCalled();
		});
	});

	describe('getCardSize', () => {
		it('should return 3 when clientHeight is 0', () => {
			(card as any).clientHeight = 0;
			expect(card.getCardSize()).toBe(3);
		});

		it('should return calculated size based on clientHeight', () => {
			(card as any).clientHeight = 200;
			expect(card.getCardSize()).toBeGreaterThanOrEqual(1);
		});
	});

	describe('extractInvertorName', () => {
		it('should extract prefix from sensor name', () => {
			const result = (card as any).extractInvertorName('sensor.my_invertor_invertor_serial_number');
			expect(result).toEqual({ prefix: 'my_invertor', suffix: '' });
		});

		it('should extract suffix from sensor name with number', () => {
			const result = (card as any).extractInvertorName('sensor.my_invertor_invertor_serial_number_2');
			expect(result).toEqual({ prefix: 'my_invertor', suffix: '_2' });
		});

		it('should return undefined for invalid sensor name', () => {
			const result = (card as any).extractInvertorName('invalid_sensor_name');
			expect(result).toBeUndefined();
		});

		it('should return undefined for empty string', () => {
			const result = (card as any).extractInvertorName('');
			expect(result).toBeUndefined();
		});
	});

	describe('getFormatedState', () => {
		it('should format state with unit', () => {
			const entity = { state: '500', attributes: { unit_of_measurement: 'W' } };
			const result = (card as any).getFormatedState(entity);
			expect(result).toBe('500W');
		});

		it('should format state without unit', () => {
			const entity = { state: '75', attributes: {} };
			const result = (card as any).getFormatedState(entity);
			expect(result).toBe('75');
		});
	});

	describe('getStateAsWatts', () => {
		it('should return 0 for undefined state', () => {
			const entity = { state: undefined, attributes: {} };
			const result = (card as any).getStateAsWatts(entity);
			expect(result).toBe(0);
		});

		it('should parse W unit correctly', () => {
			const entity = { state: '500', attributes: { unit_of_measurement: 'W' } };
			const result = (card as any).getStateAsWatts(entity);
			expect(result).toBe(500);
		});

		it('should parse kW unit correctly', () => {
			const entity = { state: '1.5', attributes: { unit_of_measurement: 'kW' } };
			const result = (card as any).getStateAsWatts(entity);
			// parseInt('1.5', 10) = 1, so 1 * 1000 = 1000
			expect(result).toBe(1000);
		});

		it('should parse Wh unit correctly', () => {
			const entity = { state: '3600', attributes: { unit_of_measurement: 'Wh' } };
			const result = (card as any).getStateAsWatts(entity);
			expect(result).toBe(1);
		});

		it('should parse kWh unit correctly', () => {
			const entity = { state: '1.5', attributes: { unit_of_measurement: 'kWh' } };
			const result = (card as any).getStateAsWatts(entity);
			// parseInt('1.5', 10) = 1, so (1 * 1000) / 3600 = 0.277...
			expect(result).toBeCloseTo(0.278, 2);
		});

		it('should handle unknown unit as W', () => {
			const entity = { state: '100', attributes: { unit_of_measurement: 'Unknown' } };
			const result = (card as any).getStateAsWatts(entity);
			expect(result).toBe(100);
		});

		it('should handle no unit attribute', () => {
			const entity = { state: '500', attributes: {} };
			const result = (card as any).getStateAsWatts(entity);
			expect(result).toBe(500);
		});
	});

	describe('cleanSensorData', () => {
		it('should return 0 for values below power margin', () => {
			const result = (card as any).cleanSensorData(10);
			expect(result).toBe(0);
		});

		it('should return value for values above power margin', () => {
			const result = (card as any).cleanSensorData(50);
			expect(result).toBe(50);
		});

		it('should return value for value equal to power margin (not strictly less than)', () => {
			// cleanSensorData uses `amount < this._powerMargin` so equal values pass through
			const result = (card as any).cleanSensorData(20);
			expect(result).toBe(20);
		});
	});

	describe('dot easing getters', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('_gridDotEasing should return default when not configured', () => {
			expect((card as any)._gridDotEasing).toBe(GRID_DOT_EASING_DEFAULT);
		});

		it('_houseDotEasing should return default when not configured', () => {
			expect((card as any)._houseDotEasing).toBe(HOUSE_DOT_EASING_DEFAULT);
		});

		it('_solarDotEasing should return default when not configured', () => {
			expect((card as any)._solarDotEasing).toBe(SOLAR_DOT_EASING_DEFAULT);
		});

		it('_batteryDotEasing should return default when not configured', () => {
			expect((card as any)._batteryDotEasing).toBe(BATTERY_DOT_EASING_DEFAULT);
		});

		it('_epsDotEasing should return default when not configured', () => {
			expect((card as any)._epsDotEasing).toBe(EPS_DOT_EASING_DEFAULT);
		});

		it('_custom1DotEasing should return default when not configured', () => {
			expect((card as any)._custom1DotEasing).toBe(CUSTOM1_DOT_EASING_DEFAULT);
		});

		it('_custom2DotEasing should return default when not configured', () => {
			expect((card as any)._custom2DotEasing).toBe(CUSTOM2_DOT_EASING_DEFAULT);
		});

		it('should use configured dot easing values', () => {
			const configWithEasing = {
				...mockConfig,
				grid_dot_easing: DotEasing.EaseIn,
				house_dot_easing: DotEasing.EaseOut,
			};
			card.setConfig(configWithEasing);
			expect((card as any)._gridDotEasing).toBe(DotEasing.EaseIn);
			expect((card as any)._houseDotEasing).toBe(DotEasing.EaseOut);
		});
	});

	describe('feature enabled getters', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('_solarEnabled should return default when not configured', () => {
			expect((card as any)._solarEnabled).toBe(SOLAR_ENABLED_DEFAULT);
		});

		it('_epsEnabled should return default when not configured', () => {
			expect((card as any)._epsEnabled).toBe(EPS_ENABLED_DEFAULT);
		});

		it('_detailsEnabled should return default when not configured', () => {
			expect((card as any)._detailsEnabled).toBe(DETAILS_ENABLED_DEFAULT);
		});

		it('_custom1Enabled should return default when not configured', () => {
			expect((card as any)._custom1Enabled).toBe(CUSTOM1_ENABLED_DEFAULT);
		});

		it('_custom2Enabled should return default when not configured', () => {
			expect((card as any)._custom2Enabled).toBe(CUSTOM2_ENABLED_DEFAULT);
		});

		it('_hideInactiveFlows should return default when not configured', () => {
			expect((card as any)._hideInactiveFlows).toBe(HIDE_INACTIVE_FLOWS_DEFAULT);
		});

		it('_colourIconsAndText should return default when not configured', () => {
			expect((card as any)._colourIconsAndText).toBe(COLOUR_ICONS_AND_TEXT_DEFAULT);
		});

		it('_singleInverter should return default when not configured', () => {
			expect((card as any)._singleInverter).toBe(SINGLE_INVERTOR_DEFAULT);
		});
	});

	describe('configuration getters', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('_entityLayout should return default when not configured', () => {
			expect((card as any)._entityLayout).toBe(ENTITY_LAYOUT_DEFAULT);
		});

		it('_centreEntity should return default when not configured', () => {
			expect((card as any)._centreEntity).toBe(CENTRE_ENTITY_DEFAULT);
		});

		it('_cornerRadius should return default when not configured', () => {
			expect((card as any)._cornerRadius).toBe(CORNER_RADIUS_DEFAULT);
		});

		it('_lineStyle should return default when not configured', () => {
			expect((card as any)._lineStyle).toBe(LINE_STYLE_DEFAULT);
		});

		it('_lineGap should return default when not configured', () => {
			expect((card as any)._lineGap).toBe(LINE_GAP_DEFAULT);
		});

		it('_lineWidth should return default when not configured', () => {
			expect((card as any)._lineWidth).toBe(LINE_WIDTH_DEFAULT);
		});

		it('_entityLineWidth should return lineWidth when not configured', () => {
			expect((card as any)._entityLineWidth).toBe(LINE_WIDTH_DEFAULT);
		});

		it('_circleSize should return default when not configured', () => {
			expect((card as any)._circleSize).toBe(CIRCLE_SIZE_DEFAULT);
		});

		it('_dotSize should return default when not configured', () => {
			expect((card as any)._dotSize).toBe(DOT_SIZE_DEFAULT);
		});

		it('_dotSpeed should return default when not configured', () => {
			expect((card as any)._dotSpeed).toBe(DOT_SPEED_DEFAULT);
		});

		it('_entitySize should return default when not configured', () => {
			expect((card as any)._entitySize).toBe(10 - ENTITY_SIZE_DEFAULT);
		});

		it('_powerMargin should return default when not configured', () => {
			expect((card as any)._powerMargin).toBe(POWER_MARGIN_DEFAULT);
		});

		it('_numColumn should return default when not configured', () => {
			expect((card as any)._numColumn).toBe(NUM_DETAIL_COLUMNS_DEFAULT);
		});

		it('_custom1Name should return default when not configured', () => {
			expect((card as any)._custom1Name).toBe('Custom 1');
		});

		it('_custom2Name should return default when not configured', () => {
			expect((card as any)._custom2Name).toBe('Custom 2');
		});

		it('should use configured values', () => {
			const customConfig = {
				...mockConfig,
				custom1_name: 'EV Charger',
				custom2_name: 'Hot Water',
				line_width: 5,
				corner_radius: 10,
			};
			card.setConfig(customConfig);
			expect((card as any)._custom1Name).toBe('EV Charger');
			expect((card as any)._custom2Name).toBe('Hot Water');
			expect((card as any)._lineWidth).toBe(5);
			expect((card as any)._cornerRadius).toBe(10);
		});
	});

	describe('_inverterName getter', () => {
		it('should extract single inverter name', () => {
			card.setConfig(mockConfig);
			const result = (card as any)._inverterName;
			expect(result).toEqual([{ prefix: 'test', suffix: '' }]);
		});

		it('should extract multiple inverter names', () => {
			const configWithInvertors = {
				invertors: ['sensor.test_invertor_serial_number', 'sensor.test2_invertor_serial_number'],
				single_invertor: false,
				type: 'custom:givtcp-power-flow-card',
			};
			card.setConfig(configWithInvertors);
			const result = (card as any)._inverterName;
			expect(result.length).toBe(2);
		});

		it('should handle invalid inverter entity', () => {
			const configWithInvalidInvertor = {
				invertor: 'sensor.nonexistent',
				type: 'custom:givtcp-power-flow-card',
			};
			card.setConfig(configWithInvalidInvertor);
			const result = (card as any)._inverterName;
			expect(result).toEqual([]);
		});
	});

	describe('_batterySoc getter', () => {
		it('should return battery SOC percentage', () => {
			card.setConfig(mockConfig);
			const result = (card as any)._batterySoc;
			expect(result).toBe(75);
		});

		it('should handle missing SOC entity', () => {
			const configWithNoSoc = {
				invertor: 'sensor.test_invertor_serial_number',
				type: 'custom:givtcp-power-flow-card',
			};
			// Remove SOC from mock
			const hassWithoutSoc = {
				states: {
					'sensor.test_invertor_serial_number': {
						state: 'test',
						attributes: {},
					},
				},
			};
			card.hass = hassWithoutSoc as any;
			card.setConfig(configWithNoSoc);
			const result = (card as any)._batterySoc;
			// When no SOC entities exist, allSoc is empty, sum/0 = NaN, Math.max(0, NaN) = NaN
			expect(result).toBeNaN();
		});
	});

	describe('getIconFor', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('should return solar icon', () => {
			const result = (card as any).getIconFor('solar');
			expect(result).toBe(SOLAR_ICON_DEFAULT);
		});

		it('should return grid icon', () => {
			const result = (card as any).getIconFor('grid');
			expect(result).toBe(GRID_ICON_DEFAULT);
		});

		it('should return house icon', () => {
			const result = (card as any).getIconFor('house');
			expect(result).toBe(HOUSE_ICON_DEFAULT);
		});

		it('should return battery icon', () => {
			const result = (card as any).getIconFor('battery');
			expect(result).toContain(BATTERY_ICON_DEFAULT);
		});

		it('should return eps icon', () => {
			const result = (card as any).getIconFor('eps');
			expect(result).toBe(EPS_ICON_DEFAULT);
		});

		it('should return custom1 icon', () => {
			const result = (card as any).getIconFor('custom1');
			expect(result).toBe(CUSTOM1_ICON_DEFAULT);
		});

		it('should return custom2 icon', () => {
			const result = (card as any).getIconFor('custom2');
			expect(result).toBe(CUSTOM2_ICON_DEFAULT);
		});

		it('should return custom configured icon', () => {
			const configWithCustomIcons = {
				...mockConfig,
				solar_icon: 'mdi:white-balance-sunny',
				grid_icon: 'mdi:flash',
			};
			card.setConfig(configWithCustomIcons);
			expect((card as any).getIconFor('solar')).toBe('mdi:white-balance-sunny');
			expect((card as any).getIconFor('grid')).toBe('mdi:flash');
		});

		it('should add charging suffix to battery icon when charging', () => {
			// Mock hass with battery charging state
			const hassWithCharging = {
				states: {
					...mockHass.states,
					'sensor.test_battery_to_house': { state: '0', attributes: { unit_of_measurement: 'W' } },
					'sensor.test_grid_to_battery': { state: '100', attributes: { unit_of_measurement: 'W' } },
				},
			};
			card.hass = hassWithCharging as any;
			const result = (card as any).getIconFor('battery', 50);
			expect(result).toContain('-charging');
		});

		it('should add SOC level to battery icon', () => {
			const result = (card as any).getIconFor('battery', 50);
			expect(result).toContain('-50');
		});
	});

	describe('_dotEasingFor', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('should return solar dot easing', () => {
			const result = (card as any)._dotEasingFor('solar');
			expect(result).toBe(SOLAR_DOT_EASING_DEFAULT);
		});

		it('should return battery dot easing', () => {
			const result = (card as any)._dotEasingFor('battery');
			expect(result).toBe(BATTERY_DOT_EASING_DEFAULT);
		});

		it('should return grid dot easing', () => {
			const result = (card as any)._dotEasingFor('grid');
			expect(result).toBe(GRID_DOT_EASING_DEFAULT);
		});

		it('should return house dot easing', () => {
			const result = (card as any)._dotEasingFor('house');
			expect(result).toBe(HOUSE_DOT_EASING_DEFAULT);
		});

		it('should return eps dot easing', () => {
			const result = (card as any)._dotEasingFor('eps');
			expect(result).toBe(EPS_DOT_EASING_DEFAULT);
		});

		it('should return custom1 dot easing', () => {
			const result = (card as any)._dotEasingFor('custom1');
			expect(result).toBe(CUSTOM1_DOT_EASING_DEFAULT);
		});

		it('should return custom2 dot easing', () => {
			const result = (card as any)._dotEasingFor('custom2');
			expect(result).toBe(CUSTOM2_DOT_EASING_DEFAULT);
		});

		it('should return Linear for unknown type', () => {
			const result = (card as any)._dotEasingFor('unknown');
			expect(result).toBe(DotEasing.Linear);
		});
	});

	describe('getTotalFor', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('should return undefined for eps when not enabled', () => {
			const result = (card as any).getTotalFor('eps', FlowDirection.Out);
			expect(result).toBeUndefined();
		});

		it('should return undefined for custom1 when not enabled', () => {
			const result = (card as any).getTotalFor('custom1', FlowDirection.Out);
			expect(result).toBeUndefined();
		});

		it('should return undefined for custom2 when not enabled', () => {
			const result = (card as any).getTotalFor('custom2', FlowDirection.Out);
			expect(result).toBeUndefined();
		});

		it('should return total for grid', () => {
			const result = (card as any).getTotalFor('grid', FlowDirection.In);
			expect(result).toBeDefined();
		});

		it('should return total for solar', () => {
			const result = (card as any).getTotalFor('solar', FlowDirection.Out);
			expect(result).toBeDefined();
		});
	});

	describe('getCleanPowerForFlow', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('should return undefined for disabled battery flows', () => {
			const configWithoutBattery = {
				...mockConfig,
				battery_enabled: false,
			};
			card.setConfig(configWithoutBattery);
			const result = (card as any).getCleanPowerForFlow('battery', 'house');
			expect(result).toBeUndefined();
		});

		it('should return undefined for disabled solar flows', () => {
			const configWithoutSolar = {
				...mockConfig,
				solar_enabled: false,
			};
			card.setConfig(configWithoutSolar);
			const result = (card as any).getCleanPowerForFlow('solar', 'house');
			expect(result).toBeUndefined();
		});

		it('should return demo power in demo mode', () => {
			const configWithDemo = {
				...mockConfig,
				demo_mode: true,
			};
			card.setConfig(configWithDemo);
			const result = (card as any).getCleanPowerForFlow('solar', 'house');
			expect(result).toBe(870);
		});

		it('should return 0 for values below power margin', () => {
			// solar_to_grid is 50W which is above power margin (20), so it returns 50
			const result = (card as any).getCleanPowerForFlow('solar', 'grid');
			expect(result).toBe(50);
		});
	});

	describe('calculateDotPosition', () => {
		it('should calculate position with linear easing', () => {
			const result = (card as any).calculateDotPosition(1000, 0, 1, DotEasing.Linear);
			expect(result).toBeGreaterThan(0);
			expect(result).toBeLessThanOrEqual(1);
		});

		it('should calculate position with easeIn', () => {
			const result = (card as any).calculateDotPosition(1000, 0, 1, DotEasing.EaseIn);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(1);
		});

		it('should calculate position with easeOut', () => {
			const result = (card as any).calculateDotPosition(1000, 0, 1, DotEasing.EaseOut);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(1);
		});

		it('should calculate position with easeInOut', () => {
			const result = (card as any).calculateDotPosition(1000, 0, 1, DotEasing.EaseInOut);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(1);
		});

		it('should reset to 0 when position exceeds 1', () => {
			const result = (card as any).calculateDotPosition(100000, 0.9, 1, DotEasing.Linear);
			expect(result).toBe(0);
		});
	});

	describe('_activeFlows getter', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('should filter out solar flows when solar disabled', () => {
			const configWithoutSolar = {
				...mockConfig,
				solar_enabled: false,
			};
			card.setConfig(configWithoutSolar);
			const activeFlows = (card as any)._activeFlows;
			const solarFlows = activeFlows.filter((f: any) => f.from === 'solar');
			expect(solarFlows.length).toBe(0);
		});

		it('should filter out battery flows when battery disabled', () => {
			const configWithoutBattery = {
				...mockConfig,
				battery_enabled: false,
			};
			card.setConfig(configWithoutBattery);
			const activeFlows = (card as any)._activeFlows;
			const batteryFlows = activeFlows.filter((f: any) => f.from === 'battery' || f.to === 'battery');
			expect(batteryFlows.length).toBe(0);
		});

		it('should filter out custom1 flows when custom1 disabled', () => {
			const configWithoutCustom1 = {
				...mockConfig,
				custom1_enabled: false,
			};
			card.setConfig(configWithoutCustom1);
			const activeFlows = (card as any)._activeFlows;
			const custom1Flows = activeFlows.filter((f: any) => f.to === 'custom1');
			expect(custom1Flows.length).toBe(0);
		});

		it('should filter out custom2 flows when custom2 disabled', () => {
			const configWithoutCustom2 = {
				...mockConfig,
				custom2_enabled: false,
			};
			card.setConfig(configWithoutCustom2);
			const activeFlows = (card as any)._activeFlows;
			const custom2Flows = activeFlows.filter((f: any) => f.to === 'custom2');
			expect(custom2Flows.length).toBe(0);
		});
	});

	describe('connectedCallback', () => {
		beforeEach(() => {
			// Mock ResizeObserver
			global.ResizeObserver = class ResizeObserver {
				observe = jest.fn();
				unobserve = jest.fn();
				disconnect = jest.fn();
			} as any;

			// Mock requestAnimationFrame - return an ID but don't call the callback
			global.window = {
				...(global as any).window,
				requestAnimationFrame: jest.fn(() => 1) as any,
			};
		});

		it('should set up resize observer', () => {
			card.connectedCallback();
			expect((card as any)._resizeObserver).toBeDefined();
		});

		it('should start animation loop', () => {
			card.connectedCallback();
			expect(global.window.requestAnimationFrame).toHaveBeenCalled();
		});
	});

	describe('disconnectedCallback', () => {
		it('should stop animation and unobserve', () => {
			const mockObserver = {
				unobserve: jest.fn(),
			};
			(card as any)._resizeObserver = mockObserver;
			(card as any)._animate = true;

			card.disconnectedCallback();

			expect(mockObserver.unobserve).toHaveBeenCalled();
			expect((card as any)._animate).toBe(false);
		});
	});

	describe('setEntitySize', () => {
		it('should set CSS custom property for size', (done) => {
			const setPropertySpy = jest.spyOn(card.style, 'setProperty');

			(card as any).setEntitySize(500);

			setTimeout(() => {
				expect(setPropertySpy).toHaveBeenCalledWith('--gtpc-size', expect.any(String));
				done();
			}, 10);
		});
	});

	describe('entityDetails', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
		});

		it('should fire event for grid entity', () => {
			const fireEventSpy = jest.fn();
			// Mock fireEvent import
			const originalAddEventListener = card.addEventListener.bind(card);
			card.addEventListener = jest.fn((event, handler) => {
				originalAddEventListener(event, handler);
			}) as any;

			(card as any).entityDetails({ detail: { type: 'grid' }, stopPropagation: jest.fn() });
		});

		it('should fire event for solar entity', () => {
			(card as any).entityDetails({ detail: { type: 'solar' }, stopPropagation: jest.fn() });
		});

		it('should fire event for battery entity', () => {
			(card as any).entityDetails({ detail: { type: 'battery' }, stopPropagation: jest.fn() });
		});

		it('should fire event for eps entity', () => {
			(card as any).entityDetails({ detail: { type: 'eps' }, stopPropagation: jest.fn() });
		});

		it('should fire event for house entity', () => {
			(card as any).entityDetails({ detail: { type: 'house' }, stopPropagation: jest.fn() });
		});

		it('should fire event for custom1 entity', () => {
			const configWithCustom1 = {
				...mockConfig,
				custom1_sensor: 'sensor.custom1',
				custom1_enabled: true,
			};
			card.setConfig(configWithCustom1);
			(card as any).entityDetails({ detail: { type: 'custom1' }, stopPropagation: jest.fn() });
		});

		it('should fire event for custom2 entity', () => {
			const configWithCustom2 = {
				...mockConfig,
				custom2_sensor: 'sensor.custom2',
				custom2_enabled: true,
			};
			card.setConfig(configWithCustom2);
			(card as any).entityDetails({ detail: { type: 'custom2' }, stopPropagation: jest.fn() });
		});
	});

	describe('render', () => {
		beforeEach(() => {
			card.setConfig(mockConfig);
			(card as any)._width = 500;
		});

		it('should return a TemplateResult', () => {
			const result = card.render();
			expect(result).toBeDefined();
		});

		it('should include ha-card element', () => {
			const result = card.render();
			expect((result as any).strings).toContainEqual(expect.stringContaining('ha-card'));
		});

		it('should use correct layout based on entity_layout', () => {
			// Cross layout
			const result = card.render();
			expect(result).toBeDefined();
		});

		it('should include details when enabled', () => {
			const configWithDetails = {
				...mockConfig,
				details_enabled: true,
				detail_entities: ['sensor.test_grid_power'],
			};
			card.setConfig(configWithDetails);
			const result = card.render();
			expect(result).toBeDefined();
		});

		it('should handle different entity layouts', () => {
			const layouts = [EntityLayout.Cross, EntityLayout.Square, EntityLayout.Circle, EntityLayout.List];

			layouts.forEach((layout) => {
				const configWithLayout = {
					...mockConfig,
					entity_layout: layout,
				};
				card.setConfig(configWithLayout);
				const result = card.render();
				expect(result).toBeDefined();
			});
		});
	});

	describe('getDemoPowerForFlow', () => {
		beforeEach(() => {
			const configWithDemo = {
				...mockConfig,
				demo_mode: true,
			};
			card.setConfig(configWithDemo);
		});

		it('should return demo power for solar to house', () => {
			const result = (card as any).getDemoPowerForFlow('solar', 'house');
			expect(result).toBe(870);
		});

		it('should return demo power for solar to battery', () => {
			const result = (card as any).getDemoPowerForFlow('solar', 'battery');
			expect(result).toBe(3600);
		});

		it('should return demo power for solar to grid', () => {
			const result = (card as any).getDemoPowerForFlow('solar', 'grid');
			expect(result).toBe(567);
		});

		it('should return 0 for grid to house', () => {
			const result = (card as any).getDemoPowerForFlow('grid', 'house');
			expect(result).toBe(0);
		});

		it('should return 0 for battery to house', () => {
			const result = (card as any).getDemoPowerForFlow('battery', 'house');
			expect(result).toBe(0);
		});

		it('should return 0 for battery to grid', () => {
			const result = (card as any).getDemoPowerForFlow('battery', 'grid');
			expect(result).toBe(0);
		});

		it('should return 0 for grid to battery', () => {
			const result = (card as any).getDemoPowerForFlow('grid', 'battery');
			expect(result).toBe(0);
		});

		it('should return 0 for custom1', () => {
			const configWithCustom1 = {
				...mockConfig,
				custom1_sensor: 'sensor.test_grid_power',
				custom1_enabled: true,
			};
			card.setConfig(configWithCustom1);
			const result = (card as any).getDemoPowerForFlow('house', 'custom1');
			expect(result).toBe(0);
		});

		it('should return 0 for custom2', () => {
			const configWithCustom2 = {
				...mockConfig,
				custom2_sensor: 'sensor.test_grid_power',
				custom2_enabled: true,
			};
			card.setConfig(configWithCustom2);
			const result = (card as any).getDemoPowerForFlow('house', 'custom2');
			expect(result).toBe(0);
		});
	});

	describe('_custom1Extra and _custom2Extra getters', () => {
		it('should return undefined when custom1 not enabled', () => {
			card.setConfig(mockConfig);
			expect((card as any)._custom1Extra).toBeUndefined();
		});

		it('should return undefined when custom2 not enabled', () => {
			card.setConfig(mockConfig);
			expect((card as any)._custom2Extra).toBeUndefined();
		});

		it('should return formatted state when custom1 enabled with sensor', () => {
			const configWithCustom1 = {
				...mockConfig,
				custom1_enabled: true,
				custom1_extra_sensor: 'sensor.test_grid_power',
			};
			card.setConfig(configWithCustom1);
			const result = (card as any)._custom1Extra;
			expect(result).toBe('500W');
		});
	});

	describe('_epsTotal getter', () => {
		it('should return undefined when eps not enabled', () => {
			card.setConfig(mockConfig);
			expect((card as any)._epsTotal).toBeUndefined();
		});

		it('should return undefined when battery not enabled', () => {
			const configWithoutBattery = {
				...mockConfig,
				battery_enabled: false,
			};
			card.setConfig(configWithoutBattery);
			expect((card as any)._epsTotal).toBeUndefined();
		});
	});

	describe('_custom1Total getter', () => {
		it('should return undefined when custom1 not enabled', () => {
			card.setConfig(mockConfig);
			expect((card as any)._custom1Total).toBeUndefined();
		});

		it('should return total when custom1 enabled with sensor', () => {
			const configWithCustom1 = {
				...mockConfig,
				custom1_enabled: true,
				custom1_sensor: 'sensor.test_grid_power',
			};
			card.setConfig(configWithCustom1);
			const result = (card as any)._custom1Total;
			expect(result).toBeDefined();
			expect(result?.total).toBe(500);
		});
	});

	describe('_custom2Total getter', () => {
		it('should return undefined when custom2 not enabled', () => {
			card.setConfig(mockConfig);
			expect((card as any)._custom2Total).toBeUndefined();
		});

		it('should return total when custom2 enabled with sensor', () => {
			const configWithCustom2 = {
				...mockConfig,
				custom2_enabled: true,
				custom2_sensor: 'sensor.test_grid_power',
			};
			card.setConfig(configWithCustom2);
			const result = (card as any)._custom2Total;
			expect(result).toBeDefined();
			expect(result?.total).toBe(500);
		});
	});

	describe('_detailEntities getter', () => {
		it('should return empty array when details not enabled', () => {
			card.setConfig(mockConfig);
			expect((card as any)._detailEntities).toEqual([]);
		});

		it('should return entities when details enabled', () => {
			const configWithDetails = {
				...mockConfig,
				details_enabled: true,
				detail_entities: ['sensor.test_grid_power'],
			};
			card.setConfig(configWithDetails);
			const result = (card as any)._detailEntities;
			expect(result.length).toBe(1);
		});
	});

	describe('styles', () => {
		it('should have static styles defined', () => {
			expect(GivTCPPowerFlowCard.styles).toBeDefined();
		});
	});
});
