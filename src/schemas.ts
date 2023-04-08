import {
	CENTRE_ENTITY_DEFAULT,
	CIRCLE_SIZE_DEFAULT,
	ENTITY_LAYOUT_DEFAULT,
	ICON_BATTERY_DEFAULT,
	ICON_GRID_DEFAULT,
	ICON_HOUSE_DEFAULT,
	ICON_SOLAR_DEFAULT,
	LINE_GAP_DEFAULT,
} from './const';
import { CentreEntity, EntityLayout } from './types';

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
export const ICON_SCHEMA = [
	{
		type: 'grid',
		name: '',
		schema: [
			{ name: 'icon_house', label: 'House Icon', selector: { icon: { placeholder: ICON_HOUSE_DEFAULT } } },
			{ name: 'icon_grid', label: 'Grid Icon', selector: { icon: { placeholder: ICON_GRID_DEFAULT } } },
			{ name: 'icon_battery', label: 'Battery Icon', selector: { icon: { placeholder: ICON_BATTERY_DEFAULT } } },
			{ name: 'icon_solar', label: 'Solar Icon', selector: { icon: { placeholder: ICON_SOLAR_DEFAULT } } },
		],
	},
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
		default: LINE_GAP_DEFAULT,
		selector: { number: { mode: 'slider', min: 0, max: 5, unit_of_measurement: '%' } },
	},
];
export const LAYOUT_TYPE_SCHEMA = (layout: string): object[] => {
	if (layout === 'cross') {
		return [
			...LINE_GAP_SCHEMA,
		];
	}
	if (layout === 'square') {
		return [
			...LINE_GAP_SCHEMA,
		];
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
