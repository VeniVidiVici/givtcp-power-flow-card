import {
	CENTRE_ENTITY_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	ENTITY_LAYOUT_DEFAULT,
	BATTERY_ICON_DEFAULT,
	GRID_ICON_DEFAULT,
	HOUSE_ICON_DEFAULT,
	SOLAR_ICON_DEFAULT,
	LINE_GAP_DEFAULT,
} from './const';
import { CentreEntity, EntityLayout } from './types';
import { any, assign, boolean, integer, object, optional, refine, string, array, union, tuple } from 'superstruct';
const isEntityId = (value: string): boolean => value.includes('.');
const entityId = () => refine(string(), 'entity ID (domain.entity)', isEntityId);

const baseLovelaceCardConfig = object({
	type: string(),
	view_layout: any(),
});

export const cardConfigStruct = assign(
	baseLovelaceCardConfig,
	object({
		name: optional(string()),
		demo_mode: optional(boolean()),
		hide_inactive_flows: optional(boolean()),
		colour_icons_and_text: optional(boolean()),
		entity_layout: optional(string()),
		line_gap: optional(integer()),
		line_width: optional(integer()),
		dot_size: optional(integer()),
		power_margin: optional(integer()),
		dot_speed: optional(integer()),
		invertor: union([entityId(), array(entityId())]),
		battery: union([entityId(), array(entityId())]),
		battery_enabled: optional(boolean()),
		solar_enabled: optional(boolean()),
		circle_size: optional(integer()),
		entity_size: optional(integer()),
		centre_entity: optional(string()),
		grid_icon: optional(string()),
		house_icon: optional(string()),
		battery_icon: optional(string()),
		solar_icon: optional(string()),
		grid_colour_type: optional(string()),
		grid_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		house_colour_type: optional(string()),
		house_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		battery_colour_type: optional(string()),
		battery_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		solar_colour_type: optional(string()),
		solar_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		grid_tap_action: optional(any()),
		grid_hold_action: optional(any()),
		house_tap_action: optional(any()),
		house_hold_action: optional(any()),
		battery_tap_action: optional(any()),
		battery_hold_action: optional(any()),
		solar_tap_action: optional(any()),
		solar_hold_action: optional(any()),
	})
);

export const ENTITY_SCHEMA = (invertors: string[], batteries: string[]) => [
	{
		type: 'grid',
		name: '',
		schema: [
			{ title: 'Invertor', name: 'invertor', selector: { entity: { include_entities: invertors } } },
			{ title: 'Battery', name: 'battery', selector: { entity: { include_entities: batteries } } },
		],
	},
];

const ICON_SCHEMA = (name: string, label: string, placeholder: string) => ({
	name,
	label,
	selector: { icon: { placeholder } },
});
// const ENTITY_ACTION_SCHEMA = (name: string, label: string) => [
// 	{
// 		type: 'grid',
// 		name: '',
// 		schema: [
// 			{ name: `${name}_tap_action`, label: `${label} Tap Action`, selector: { 'ui-action': {} } },
// 			{ name: `${name}_hold_action`, label: `${label} Hold Action`, selector: { 'ui-action': {} } },
// 		],
// 	},
// ];

const ENTITY_COLOUR_SCHEMA = (type: string, name: string, label: string) => [
	{
		name,
		label,
		selector: type == 'ui' ? { 'ui-color': {} } : { color_rgb: {} },
	},
];

const ENTITY_COLOUR_TYPE_SCHEMA = (name: string, label: string) => [
	{
		name: `${name}_type`,
		label,
		selector: { select: { mode: 'dropdown', options: ['ui', 'rgb'] } },
	},
];
export const GRID_SCHEMA = (type: string) => [
	ICON_SCHEMA('grid_icon', 'Grid Icon', GRID_ICON_DEFAULT),
	{
		type: 'grid',
		name: '',
		schema: [
			...ENTITY_COLOUR_TYPE_SCHEMA('grid_colour', 'Colour Type'),
			...ENTITY_COLOUR_SCHEMA(type, 'grid_colour', 'Grid Colour'),
		],
	},
	//	...ENTITY_ACTION_SCHEMA('grid', 'Grid')
];
export const HOUSE_SCHEMA = (type: string) => [
	ICON_SCHEMA('house_icon', 'House Icon', HOUSE_ICON_DEFAULT),
	{
		type: 'grid',
		name: '',
		schema: [
			...ENTITY_COLOUR_TYPE_SCHEMA('house_colour', 'Colour Type'),
			...ENTITY_COLOUR_SCHEMA(type, 'house_colour', 'House Colour'),
		],
	},
	//	...ENTITY_ACTION_SCHEMA('house', 'House')
];
export const BATTERY_SCHEMA = (type: string) => [
	{ name: 'battery_enabled', label: 'Battery enabled', selector: { boolean: {} } },
	ICON_SCHEMA('battery_icon', 'Battery Icon', BATTERY_ICON_DEFAULT),
	{
		type: 'grid',
		name: '',
		schema: [
			...ENTITY_COLOUR_TYPE_SCHEMA('battery_colour', 'Colour Type'),
			...ENTITY_COLOUR_SCHEMA(type, 'battery_colour', 'Battery Colour'),
		],
	},
	//	...ENTITY_ACTION_SCHEMA('battery', 'Battery')
];
export const SOLAR_SCHEMA = (type: string) => [
	{ name: 'solar_enabled', label: 'Solar enabled', selector: { boolean: {} } },
	ICON_SCHEMA('solar_icon', 'Solar Icon', SOLAR_ICON_DEFAULT),
	{
		type: 'grid',
		name: '',
		schema: [
			...ENTITY_COLOUR_TYPE_SCHEMA('solar_colour', 'Colour Type'),
			...ENTITY_COLOUR_SCHEMA(type, 'solar_colour', 'Solar Colour'),
		],
	},
	//	...ENTITY_ACTION_SCHEMA('solar', 'Solar')
];
export const LAYOUT_SCHEMA = [
	{
		name: 'entity_layout',
		default: ENTITY_LAYOUT_DEFAULT,
		selector: {
			select: {
				mode: 'dropdown',
				options: [
					{ value: EntityLayout.Cross, label: 'Cross' },
					{ value: EntityLayout.Circle, label: 'Circle' },
					{ value: EntityLayout.Square, label: 'Square' },
					{ value: EntityLayout.List, label: 'List' },
				],
			},
		},
	},
];
const LINE_GAP_SCHEMA = [
	{
		name: 'line_gap',
		label: 'Line Gap',
		default: LINE_GAP_DEFAULT,
		selector: { number: { mode: 'slider', min: 0, max: 5, unit_of_measurement: '%' } },
	},
];
export const LAYOUT_TYPE_SCHEMA = (layout: string): object[] => {
	if (layout === 'cross') {
		return [...LINE_GAP_SCHEMA];
	}
	if (layout === 'square') {
		return [...LINE_GAP_SCHEMA];
	}
	if (layout === 'circle') {
		return [
			{
				name: 'circle_size',
				default: CIRCLE_SIZE_DEFAULT,
				selector: { number: { mode: 'slider', min: 25, max: 50 } },
			},
			{
				name: 'centre_entity',
				default: CENTRE_ENTITY_DEFAULT,
				selector: {
					select: {
						mode: 'dropdown',
						options: [
							{ value: CentreEntity.None, label: 'None' },
							{ value: CentreEntity.House, label: 'House' },
							{ value: CentreEntity.Inverter, label: 'Inverter' },
							{ value: CentreEntity.Solar, label: 'Solar' },
							{ value: CentreEntity.Battery, label: 'Battery' },
						],
					},
				},
			},
		];
	}
	return [];
};
