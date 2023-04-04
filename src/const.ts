import { CentreEntity, EntityLayout } from "./types";

export const ICON_SOLAR_DEFAULT = 'mdi:solar-panel-large';
export const ICON_BATTERY_DEFAULT = 'mdi:battery';
export const ICON_GRID_DEFAULT = 'mdi:transmission-tower';
export const ICON_HOUSE_DEFAULT = 'mdi:home';
export const ENTITY_LAYOUT_DEFAULT = EntityLayout.Cross;
export const CENTRE_ENTITY_DEFAULT = CentreEntity.None;
export const POWER_MARGIN_DEFAULT = 20;
export const LINE_GAP_DEFAULT = 0;
export const CIRCLE_SIZE_DEFAULT = 35;
export const LINE_WIDTH_DEFAULT = 2;
export const HIDE_INACTIVE_FLOWS_DEFAULT = false;
export const HIDE_INACTIVE_TOTALS_DEFAULT = false;

export enum UnitOfPower {
	WATT = "W",
	KILO_WATT = "kW",
	MEGA_WATT = "MW",
  }