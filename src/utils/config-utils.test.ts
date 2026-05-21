import { ConfigUtils } from './config-utils';
import { EntityLayout } from '../types';
import {
	BATTERY_COLOUR_RGB_DEFAULT,
	BATTERY_COLOUR_UI_DEFAULT,
	BATTERY_DOT_EASING_DEFAULT,
	BATTERY_ENABLED_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	COLOUR_ICONS_AND_TEXT_DEFAULT,
	COLOUR_TYPE_DEFAULT,
	CORNER_RADIUS_DEFAULT,
	CUSTOM1_COLOUR_RGB_DEFAULT,
	CUSTOM1_COLOUR_UI_DEFAULT,
	CUSTOM1_DOT_EASING_DEFAULT,
	CUSTOM2_COLOUR_RGB_DEFAULT,
	CUSTOM2_COLOUR_UI_DEFAULT,
	CUSTOM2_DOT_EASING_DEFAULT,
	DETAILS_ENABLED_DEFAULT,
	DOT_SIZE_DEFAULT,
	DOT_SPEED_DEFAULT,
	ENTITY_SIZE_DEFAULT,
	EPS_COLOUR_RGB_DEFAULT,
	EPS_COLOUR_UI_DEFAULT,
	EPS_DOT_EASING_DEFAULT,
	EPS_ENABLED_DEFAULT,
	GRID_COLOUR_RGB_DEFAULT,
	GRID_COLOUR_UI_DEFAULT,
	GRID_DOT_EASING_DEFAULT,
	HIDE_INACTIVE_FLOWS_DEFAULT,
	HOUSE_COLOUR_RGB_DEFAULT,
	HOUSE_COLOUR_UI_DEFAULT,
	HOUSE_DOT_EASING_DEFAULT,
	LINE_GAP_DEFAULT,
	LINE_STYLE_DEFAULT,
	LINE_WIDTH_DEFAULT,
	NUM_DETAIL_COLUMNS_DEFAULT,
	POWER_MARGIN_DEFAULT,
	SINGLE_BATTERY_DEFAULT,
	SINGLE_INVERTOR_DEFAULT,
	SOLAR_COLOUR_RGB_DEFAULT,
	SOLAR_COLOUR_UI_DEFAULT,
	SOLAR_DOT_EASING_DEFAULT,
	SOLAR_ENABLED_DEFAULT,
} from '../const';

describe('ConfigUtils', () => {
	describe('getDefaults', () => {
		it('should return default config with ui colour type', () => {
			const config = { type: 'custom:givtcp-power-flow-card' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.type).toBe('custom:givtcp-power-flow-card');
			expect(defaults.battery_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.battery_colour).toBe(BATTERY_COLOUR_UI_DEFAULT);
			expect(defaults.battery_dot_easing).toBe(BATTERY_DOT_EASING_DEFAULT);
			expect(defaults.battery_enabled).toBe(BATTERY_ENABLED_DEFAULT);
			expect(defaults.circle_size).toBe(CIRCLE_SIZE_DEFAULT);
			expect(defaults.colour_icons_and_text).toBe(COLOUR_ICONS_AND_TEXT_DEFAULT);
			expect(defaults.corner_radius).toBe(CORNER_RADIUS_DEFAULT);
			expect(defaults.custom1_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.custom1_colour).toBe(CUSTOM1_COLOUR_UI_DEFAULT);
			expect(defaults.custom1_dot_easing).toBe(CUSTOM1_DOT_EASING_DEFAULT);
			expect(defaults.custom2_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.custom2_colour).toBe(CUSTOM2_COLOUR_UI_DEFAULT);
			expect(defaults.custom2_dot_easing).toBe(CUSTOM2_DOT_EASING_DEFAULT);
			expect(defaults.details_enabled).toBe(DETAILS_ENABLED_DEFAULT);
			expect(defaults.dot_size).toBe(DOT_SIZE_DEFAULT);
			expect(defaults.dot_speed).toBe(DOT_SPEED_DEFAULT);
			expect(defaults.entity_layout).toBe(EntityLayout.Cross);
			expect(defaults.entity_line_width).toBe(LINE_WIDTH_DEFAULT);
			expect(defaults.entity_size).toBe(ENTITY_SIZE_DEFAULT);
			expect(defaults.eps_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.eps_colour).toBe(EPS_COLOUR_UI_DEFAULT);
			expect(defaults.eps_dot_easing).toBe(EPS_DOT_EASING_DEFAULT);
			expect(defaults.eps_enabled).toBe(EPS_ENABLED_DEFAULT);
			expect(defaults.grid_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.grid_colour).toBe(GRID_COLOUR_UI_DEFAULT);
			expect(defaults.grid_dot_easing).toBe(GRID_DOT_EASING_DEFAULT);
			expect(defaults.hide_inactive_flows).toBe(HIDE_INACTIVE_FLOWS_DEFAULT);
			expect(defaults.house_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.house_colour).toBe(HOUSE_COLOUR_UI_DEFAULT);
			expect(defaults.house_dot_easing).toBe(HOUSE_DOT_EASING_DEFAULT);
			expect(defaults.line_gap).toBe(LINE_GAP_DEFAULT);
			expect(defaults.line_style).toBe(LINE_STYLE_DEFAULT);
			expect(defaults.line_width).toBe(LINE_WIDTH_DEFAULT);
			expect(defaults.num_detail_columns).toBe(NUM_DETAIL_COLUMNS_DEFAULT);
			expect(defaults.power_margin).toBe(POWER_MARGIN_DEFAULT);
			expect(defaults.single_battery).toBe(SINGLE_BATTERY_DEFAULT);
			expect(defaults.single_invertor).toBe(SINGLE_INVERTOR_DEFAULT);
			expect(defaults.solar_colour_type).toBe(COLOUR_TYPE_DEFAULT);
			expect(defaults.solar_colour).toBe(SOLAR_COLOUR_UI_DEFAULT);
			expect(defaults.solar_dot_easing).toBe(SOLAR_DOT_EASING_DEFAULT);
			expect(defaults.solar_enabled).toBe(SOLAR_ENABLED_DEFAULT);
		});

		it('should return rgb colours when battery_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', battery_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.battery_colour).toBe(BATTERY_COLOUR_RGB_DEFAULT);
		});

		it('should return rgb colours when custom1_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', custom1_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.custom1_colour).toBe(CUSTOM1_COLOUR_RGB_DEFAULT);
		});

		it('should return rgb colours when custom2_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', custom2_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.custom2_colour).toBe(CUSTOM2_COLOUR_RGB_DEFAULT);
		});

		it('should return rgb colours when eps_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', eps_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.eps_colour).toBe(EPS_COLOUR_RGB_DEFAULT);
		});

		it('should return rgb colours when grid_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', grid_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.grid_colour).toBe(GRID_COLOUR_RGB_DEFAULT);
		});

		it('should return rgb colours when house_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', house_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.house_colour).toBe(HOUSE_COLOUR_RGB_DEFAULT);
		});

		it('should return rgb colours when solar_colour_type is rgb', () => {
			const config = { type: 'custom:givtcp-power-flow-card', solar_colour_type: 'rgb' };
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.solar_colour).toBe(SOLAR_COLOUR_RGB_DEFAULT);
		});

		it('should return ui colours when colour_type is ui', () => {
			const config = {
				type: 'custom:givtcp-power-flow-card',
				battery_colour_type: 'ui',
				custom1_colour_type: 'ui',
				custom2_colour_type: 'ui',
				eps_colour_type: 'ui',
				grid_colour_type: 'ui',
				house_colour_type: 'ui',
				solar_colour_type: 'ui',
			};
			const defaults = ConfigUtils.getDefaults(config);

			expect(defaults.battery_colour).toBe(BATTERY_COLOUR_UI_DEFAULT);
			expect(defaults.custom1_colour).toBe(CUSTOM1_COLOUR_UI_DEFAULT);
			expect(defaults.custom2_colour).toBe(CUSTOM2_COLOUR_UI_DEFAULT);
			expect(defaults.eps_colour).toBe(EPS_COLOUR_UI_DEFAULT);
			expect(defaults.grid_colour).toBe(GRID_COLOUR_UI_DEFAULT);
			expect(defaults.house_colour).toBe(HOUSE_COLOUR_UI_DEFAULT);
			expect(defaults.solar_colour).toBe(SOLAR_COLOUR_UI_DEFAULT);
		});
	});

	describe('migrateConfig', () => {
		it('should migrate icon_solar to solar_icon', () => {
			const config = { icon_solar: 'mdi:solar' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.solar_icon).toBe('mdi:solar');
			expect(result.icon_solar).toBeUndefined();
		});

		it('should migrate icon_battery to battery_icon', () => {
			const config = { icon_battery: 'mdi:battery' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.battery_icon).toBe('mdi:battery');
			expect(result.icon_battery).toBeUndefined();
		});

		it('should migrate icon_grid to grid_icon', () => {
			const config = { icon_grid: 'mdi:grid' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.grid_icon).toBe('mdi:grid');
			expect(result.icon_grid).toBeUndefined();
		});

		it('should migrate icon_house to house_icon', () => {
			const config = { icon_house: 'mdi:house' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.house_icon).toBe('mdi:house');
			expect(result.icon_house).toBeUndefined();
		});

		it('should migrate all icon keys at once', () => {
			const config = {
				icon_solar: 'mdi:solar',
				icon_battery: 'mdi:battery',
				icon_grid: 'mdi:grid',
				icon_house: 'mdi:house',
			};
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.solar_icon).toBe('mdi:solar');
			expect(result.battery_icon).toBe('mdi:battery');
			expect(result.grid_icon).toBe('mdi:grid');
			expect(result.house_icon).toBe('mdi:house');
			expect(result.icon_solar).toBeUndefined();
			expect(result.icon_battery).toBeUndefined();
			expect(result.icon_grid).toBeUndefined();
			expect(result.icon_house).toBeUndefined();
		});

		it('should not modify config when no old keys exist', () => {
			const config = { solar_icon: 'mdi:solar', battery_icon: 'mdi:battery' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.solar_icon).toBe('mdi:solar');
			expect(result.battery_icon).toBe('mdi:battery');
			expect(result.icon_solar).toBeUndefined();
			expect(result.icon_battery).toBeUndefined();
		});

		it('should create a copy when makeCopy is true', () => {
			const config = { icon_solar: 'mdi:solar', other_prop: 'value' };
			const result = ConfigUtils.migrateConfig(config as any, true);

			expect(result).not.toBe(config);
			expect(result.other_prop).toBe('value');
			expect(result.solar_icon).toBe('mdi:solar');
			expect(result.icon_solar).toBeUndefined();
			expect(config.icon_solar).toBe('mdi:solar');
		});

		it('should not create a copy when makeCopy is false', () => {
			const config = { icon_solar: 'mdi:solar', other_prop: 'value' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result).toBe(config);
		});

		it('should handle empty config', () => {
			const config = {};
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result).toEqual({});
		});

		it('should only migrate keys that exist', () => {
			const config = { icon_solar: 'mdi:solar', icon_grid: 'mdi:grid' };
			const result = ConfigUtils.migrateConfig(config as any, false);

			expect(result.solar_icon).toBe('mdi:solar');
			expect(result.grid_icon).toBe('mdi:grid');
			expect(result.icon_solar).toBeUndefined();
			expect(result.icon_grid).toBeUndefined();
			expect(result.battery_icon).toBeUndefined();
			expect(result.house_icon).toBeUndefined();
		});
	});
});
