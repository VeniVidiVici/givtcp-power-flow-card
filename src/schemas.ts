import { LovelaceCardConfig } from 'custom-card-helpers';
import {
	CENTRE_ENTITY_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	ENTITY_LAYOUT_DEFAULT,
	BATTERY_ICON_DEFAULT,
	GRID_ICON_DEFAULT,
	HOUSE_ICON_DEFAULT,
	SOLAR_ICON_DEFAULT,
	LINE_GAP_DEFAULT,
	CORNER_RADIUS_DEFAULT,
	EPS_ICON_DEFAULT,
	CUSTOM1_ICON_DEFAULT,
	CUSTOM2_ICON_DEFAULT,
	SINGLE_INVERTOR_DEFAULT,
	SINGLE_BATTERY_DEFAULT,
	NUM_DETAIL_COLUMNS_DEFAULT,
} from './const';
import { CentreEntity, DotEasing, EntityLayout, LineStyle } from './types';
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
		batteries: optional(array(entityId())),
		battery_colour_type: optional(string()),
		battery_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		battery_dot_easing: optional(string()),
		battery_enabled: optional(boolean()),
		battery_icon: optional(string()),
		battery: optional(entityId()),
		centre_entity: optional(string()),
		circle_size: optional(integer()),
		colour_icons_and_text: optional(boolean()),
		corner_radius: optional(integer()),
		custom1_colour_type: optional(string()),
		custom1_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		custom1_dot_easing: optional(string()),
		custom1_enabled: optional(boolean()),
		custom1_extra_sensor: optional(entityId()),
		custom1_icon: optional(string()),
		custom1_name: optional(string()),
		custom1_sensor: optional(entityId()),
		custom2_colour_type: optional(string()),
		custom2_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		custom2_dot_easing: optional(string()),
		custom2_enabled: optional(boolean()),
		custom2_extra_sensor: optional(entityId()),
		custom2_icon: optional(string()),
		custom2_name: optional(string()),
		custom2_sensor: optional(entityId()),
		detail_entities: optional(array(entityId())),
		details_enabled: optional(boolean()),
		dot_size: optional(integer()),
		dot_speed: optional(integer()),
		entity_layout: optional(string()),
		entity_line_width: optional(integer()),
		entity_size: optional(integer()),
		eps_colour_type: optional(string()),
		eps_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		eps_dot_easing: optional(string()),
		eps_enabled: optional(boolean()),
		eps_icon: optional(string()),
		grid_colour_type: optional(string()),
		grid_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		grid_dot_easing: optional(string()),
		grid_icon: optional(string()),
		hide_inactive_flows: optional(boolean()),
		house_colour_type: optional(string()),
		house_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		house_dot_easing: optional(string()),
		house_icon: optional(string()),
		invertor: optional(entityId()),
		invertors: optional(array(entityId())),
		line_gap: optional(integer()),
		line_style: optional(string()),
		line_width: optional(integer()),
		num_detail_columns: optional(integer()),
		power_margin: optional(integer()),
		single_battery: optional(boolean()),
		single_invertor: optional(boolean()),
		solar_colour_type: optional(string()),
		solar_colour: optional(union([string(), tuple([integer(), integer(), integer()])])),
		solar_dot_easing: optional(string()),
		solar_enabled: optional(boolean()),
		solar_icon: optional(string()),
	})
);

export const INVERTER_BATTERY_SCHEMA = (config: LovelaceCardConfig, invertors: string[], batteries: string[]) => {
	const singleInvertor = config.single_invertor !== undefined ? config.single_invertor : SINGLE_INVERTOR_DEFAULT;
	const singleBattery = config.single_battery !== undefined ? config.single_battery : SINGLE_BATTERY_DEFAULT;

	const invertorList = singleInvertor
		? invertors
		: invertors.filter((x) => (config.invertors?.length > 0 ? config.invertors?.indexOf(x) === -1 : true));
	const batteryList = singleBattery
		? batteries
		: batteries.filter((x) => (config.batteries?.length > 0 ? config.batteries?.indexOf(x) === -1 : true));
	return [
		{
			type: 'grid',
			name: '',
			schema: [
				{
					type: 'grid',
					name: '',
					schema: [
						{ name: 'single_invertor', label: 'Single Invertor', selector: { boolean: {} } },
						{
							label: singleInvertor ? 'Invertor' : 'Invertors',
							name: singleInvertor ? 'invertor' : 'invertors',
							selector: { entity: { multiple: !singleInvertor, include_entities: invertorList } },
						},
					],
				},
				{
					type: 'grid',
					name: '',
					schema: [
						{ name: 'single_battery', label: 'Single Battery', selector: { boolean: {} } },
						{
							label: singleBattery ? 'Battery' : 'Batteries',
							name: singleBattery ? 'battery' : 'batteries',
							selector: { entity: { multiple: !singleBattery, include_entities: batteryList } },
						},
					],
				},
			],
		},
	];
};

const ICON_SCHEMA = (name: string, label: string, placeholder: string) => [
	{
		name,
		label,
		selector: { icon: { placeholder } },
	},
];
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

const ENTITY_EASING_SCHEMA = (name: string, label: string) => [
	{
		name,
		default: DotEasing.Linear,
		label,
		selector: {
			select: {
				mode: 'dropdown',
				options: [
					{ value: DotEasing.Linear, label: 'Linear' },
					{ value: DotEasing.EaseInOut, label: 'Ease In & Out' },
					{ value: DotEasing.EaseIn, label: 'Ease In' },
					{ value: DotEasing.EaseOut, label: 'Ease Out' },
				],
			},
		},
	},
];
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
export const ENTITY_SCHEMA = (config: LovelaceCardConfig, type: string, label: string, defaultIcon: string) => [
	{
		type: 'grid',
		name: '',
		schema: [
			...ICON_SCHEMA(type + '_icon', 'Icon', defaultIcon),
			...ENTITY_EASING_SCHEMA(type + '_dot_easing', label + ' Dot Easing'),
			...ENTITY_COLOUR_TYPE_SCHEMA(type + '_colour', 'Colour Type'),
			...ENTITY_COLOUR_SCHEMA(config[`${type}_colour_type`], type + '_colour', label + ' Colour'),
		],
	},
	//	...ENTITY_ACTION_SCHEMA('grid', 'Grid')
];

export const GRID_SCHEMA = (config: LovelaceCardConfig) => [
	...ENTITY_SCHEMA(config, 'grid', 'Grid', GRID_ICON_DEFAULT),
];
export const HOUSE_SCHEMA = (config: LovelaceCardConfig) => [
	...ENTITY_SCHEMA(config, 'house', 'House', HOUSE_ICON_DEFAULT),
];
export const BATTERY_SCHEMA = (config: LovelaceCardConfig) => {
	let settings: object[] = [{ name: 'battery_enabled', label: 'Battery enabled', selector: { boolean: {} } }];
	if (config.battery_enabled) {
		settings = [
			...settings,
			...ENTITY_SCHEMA(config, 'battery', 'Battery', BATTERY_ICON_DEFAULT),
			{ name: 'eps_enabled', label: 'EPS enabled', selector: { boolean: {} } },
		];
		if (config.eps_enabled) {
			settings = [...settings, ...ENTITY_SCHEMA(config, 'eps', 'EPS', EPS_ICON_DEFAULT)];
		}
	}
	return settings;
};
export const SOLAR_SCHEMA = (config: LovelaceCardConfig) => {
	let settings: object[] = [{ name: 'solar_enabled', label: 'Solar enabled', selector: { boolean: {} } }];
	if (config.solar_enabled) {
		settings = [...settings, ...ENTITY_SCHEMA(config, 'solar', 'Solar', SOLAR_ICON_DEFAULT)];
	}
	return settings;
};
export const EXTRAS_SCHEMA = (config: LovelaceCardConfig) => {
	let settings: object[] = [{ name: 'custom1_enabled', label: 'Custom 1 enabled', selector: { boolean: {} } }];
	if (config.custom1_enabled) {
		settings = [
			...settings,
			{ name: 'custom1_name', label: 'Name', selector: { text: {} } },
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'custom1_sensor',
						label: 'Power Sensor',
						selector: { entity: { filter: { device_class: 'power' } } },
					},
					{ name: 'custom1_extra_sensor', label: 'Extra Data', selector: { entity: { domain: 'sensor' } } },
				],
			},
			...ENTITY_SCHEMA(config, 'custom1', 'Custom 1', CUSTOM1_ICON_DEFAULT),
		];
	}
	settings.push({ name: 'custom2_enabled', label: 'Custom 2 enabled', selector: { boolean: {} } });
	if (config.custom2_enabled) {
		settings = [
			...settings,
			{ name: 'custom2_name', label: 'Name', selector: { text: {} } },
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'custom2_sensor',
						label: 'Power Sensor',
						selector: { entity: { filter: { device_class: 'power' } } },
					},
					{ name: 'custom2_extra_sensor', label: 'Extra Data', selector: { entity: { domain: 'sensor' } } },
				],
			},
			...ENTITY_SCHEMA(config, 'custom2', 'Custom 2', CUSTOM2_ICON_DEFAULT),
		];
	}
	return settings;
};
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
		selector: { number: { mode: 'slider', min: 0, max: 5 } },
	},
];
export const LAYOUT_TYPE_SCHEMA = (config: LovelaceCardConfig): object[] => {
	if (config.entity_layout === 'cross') {
		return [
			{
				name: 'corner_radius',
				default: CORNER_RADIUS_DEFAULT,
				label: 'Corner Radius',
				selector: { number: { mode: 'slider', min: 1, max: 10 } },
			},
			...LINE_GAP_SCHEMA,
		];
	}
	if (config.entity_layout === 'square') {
		let squareSettings: object[] = [
			{
				name: 'line_style',
				default: CENTRE_ENTITY_DEFAULT,
				label: 'Line Style',
				selector: {
					select: {
						mode: 'dropdown',
						options: [
							{ value: LineStyle.Curved, label: 'Curved' },
							{ value: LineStyle.Angled, label: 'Angled' },
							{ value: LineStyle.Straight, label: 'Straight' },
						],
					},
				},
			},
		];
		if (config.line_style === LineStyle.Curved) {
			squareSettings = [...squareSettings, ...LINE_GAP_SCHEMA];
		}
		return squareSettings;
	}
	if (config.entity_layout === 'circle') {
		return [
			{
				name: 'circle_size',
				default: CIRCLE_SIZE_DEFAULT,
				label: 'Circle Size',
				selector: { number: { mode: 'slider', min: 35, max: 45 } },
			},
			{
				name: 'centre_entity',
				default: CENTRE_ENTITY_DEFAULT,
				label: 'Centre Entity',
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
export const DETAILS_SCHEMA = (config: LovelaceCardConfig, entities: string[]): object[] => {
	let settings: object[] = [{ name: 'details_enabled', label: 'Details enabled', selector: { boolean: {} } }];
	if (config.details_enabled) {
		settings = [
			...settings,
			{
				name: 'num_detail_columns',
				label: 'Number of columns',
				default: NUM_DETAIL_COLUMNS_DEFAULT,
				selector: { number: { mode: 'slider', min: 1, max: 5 } },
			},
			{
				label: 'Entities',
				name: 'detail_entities',
				selector: {
					entity: {
						multiple: true,
						include_entities: entities.filter((x) => config.detail_entities.indexOf(x) === -1),
					},
				},
			},
		];
	}
	return settings;
};
