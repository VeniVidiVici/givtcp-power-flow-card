export interface EntityData {
	name: string;
	type: string;
	icon: string;
	in?: FlowTotal;
	out?: FlowTotal;
}
export interface FlowTotal {
	total: number;
	parts: { type: string; value: number }[];
}
export enum FlowDirection {
	In = 0,
	Out = 1,
}
export enum EntityLayout {
	Cross = 'cross',
	Square = 'square',
	Circle = 'circle',
	List = 'list',
}
export enum CentreEntity {
	None = 'none',
	House = 'house',
	Inverter = 'inverter',
	Solar = 'solar',
	Battery = 'battery',
}