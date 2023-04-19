import { LovelaceCardConfig } from 'custom-card-helpers';
import {
	HIDE_INACTIVE_FLOWS_DEFAULT,
	COLOUR_ICONS_AND_TEXT_DEFAULT,
	LINE_GAP_DEFAULT,
	LINE_WIDTH_DEFAULT,
	DOT_SIZE_DEFAULT,
	POWER_MARGIN_DEFAULT,
	DOT_SPEED_DEFAULT,
	ENTITY_SIZE_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	COLOUR_TYPE_DEFAULT,
	GRID_COLOUR_UI_DEFAULT,
	GRID_COLOUR_RGB_DEFAULT,
	SOLAR_COLOUR_UI_DEFAULT,
	SOLAR_COLOUR_RGB_DEFAULT,
	BATTERY_COLOUR_UI_DEFAULT,
	BATTERY_COLOUR_RGB_DEFAULT,
	HOUSE_COLOUR_UI_DEFAULT,
	HOUSE_COLOUR_RGB_DEFAULT,
	BATTERY_ENABLED_DEFAULT,
	SOLAR_ENABLED_DEFAULT,
	CORNER_RADIUS_DEFAULT,
	LINE_STYLE_DEFAULT,
	EPS_ENABLED_DEFAULT,
	CUSTOM1_COLOUR_RGB_DEFAULT,
	CUSTOM1_COLOUR_UI_DEFAULT,
	CUSTOM2_COLOUR_RGB_DEFAULT,
	CUSTOM2_COLOUR_UI_DEFAULT,
	EPS_COLOUR_RGB_DEFAULT,
	EPS_COLOUR_UI_DEFAULT,
	SINGLE_INVERTOR_DEFAULT,
	SINGLE_BATTERY_DEFAULT,
	DETAILS_ENABLED_DEFAULT,
	NUM_DETAIL_COLUMNS_DEFAULT,
	SOLAR_DOT_EASING_DEFAULT,
	GRID_DOT_EASING_DEFAULT,
	BATTERY_DOT_EASING_DEFAULT,
	HOUSE_DOT_EASING_DEFAULT,
	EPS_DOT_EASING_DEFAULT,
} from '../const';
import { EntityLayout } from '../types';

export class ConfigUtils {
	public static getDefaults(config: LovelaceCardConfig): LovelaceCardConfig {
		const defaults: LovelaceCardConfig = {
			type: 'custom:givtcp-power-flow-card',
			battery_colour_type: COLOUR_TYPE_DEFAULT,
			battery_colour: config.battery_colour_type === 'rgb' ? BATTERY_COLOUR_RGB_DEFAULT : BATTERY_COLOUR_UI_DEFAULT,
			battery_dot_easing: BATTERY_DOT_EASING_DEFAULT,
			battery_enabled: BATTERY_ENABLED_DEFAULT,
			circle_size: CIRCLE_SIZE_DEFAULT,
			colour_icons_and_text: COLOUR_ICONS_AND_TEXT_DEFAULT,
			corner_radius: CORNER_RADIUS_DEFAULT,
			custom1_colour_type: COLOUR_TYPE_DEFAULT,
			custom1_colour: config.custom1_colour_type === 'rgb' ? CUSTOM1_COLOUR_RGB_DEFAULT : CUSTOM1_COLOUR_UI_DEFAULT,
			custom1_dot_easing: SOLAR_DOT_EASING_DEFAULT,
			custom2_colour_type: COLOUR_TYPE_DEFAULT,
			custom2_colour: config.custom2_colour_type === 'rgb' ? CUSTOM2_COLOUR_RGB_DEFAULT : CUSTOM2_COLOUR_UI_DEFAULT,
			custom2_dot_easing: SOLAR_DOT_EASING_DEFAULT,
			details_enabled: DETAILS_ENABLED_DEFAULT,
			dot_size: DOT_SIZE_DEFAULT,
			dot_speed: DOT_SPEED_DEFAULT,
			entity_layout: EntityLayout.Cross,
			entity_size: ENTITY_SIZE_DEFAULT,
			eps_colour_type: COLOUR_TYPE_DEFAULT,
			eps_colour: config.eps_colour_type === 'rgb' ? EPS_COLOUR_RGB_DEFAULT : EPS_COLOUR_UI_DEFAULT,
			eps_dot_easing: EPS_DOT_EASING_DEFAULT,
			eps_enabled: EPS_ENABLED_DEFAULT,
			grid_colour_type: COLOUR_TYPE_DEFAULT,
			grid_colour: config.grid_colour_type === 'rgb' ? GRID_COLOUR_RGB_DEFAULT : GRID_COLOUR_UI_DEFAULT,
			grid_dot_easing: GRID_DOT_EASING_DEFAULT,
			hide_inactive_flows: HIDE_INACTIVE_FLOWS_DEFAULT,
			house_colour_type: COLOUR_TYPE_DEFAULT,
			house_colour: config.house_colour_type === 'rgb' ? HOUSE_COLOUR_RGB_DEFAULT : HOUSE_COLOUR_UI_DEFAULT,
			house_dot_easing: HOUSE_DOT_EASING_DEFAULT,
			line_gap: LINE_GAP_DEFAULT,
			line_style: LINE_STYLE_DEFAULT,
			line_width: LINE_WIDTH_DEFAULT,
			num_detail_columns: NUM_DETAIL_COLUMNS_DEFAULT,
			power_margin: POWER_MARGIN_DEFAULT,
			single_battery: SINGLE_BATTERY_DEFAULT,
			single_invertor: SINGLE_INVERTOR_DEFAULT,
			solar_colour_type: COLOUR_TYPE_DEFAULT,
			solar_colour: config.solar_colour_type === 'rgb' ? SOLAR_COLOUR_RGB_DEFAULT : SOLAR_COLOUR_UI_DEFAULT,
			solar_dot_easing: SOLAR_DOT_EASING_DEFAULT,
			solar_enabled: SOLAR_ENABLED_DEFAULT,
		};
		return defaults;
	}
	static migrateConfig(config: LovelaceCardConfig, makeCopy: boolean): LovelaceCardConfig {
		const newConfig = makeCopy ? { ...config } : config;
		const mappings = {
			icon_solar: 'solar_icon',
			icon_battery: 'battery_icon',
			icon_grid: 'grid_icon',
			icon_house: 'house_icon',
		};
		for (const [oldKey, newKey] of Object.entries(mappings)) {
			if (newConfig[oldKey]) {
				newConfig[newKey] = newConfig[oldKey];
				delete newConfig[oldKey];
			}
		}
		return newConfig;
	}
}
