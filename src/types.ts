export interface FlowData {
	name: string;
	type: string;
	icon: string;
	extra?: string;
	in?: FlowTotal;
	out?: FlowTotal;
}
export enum LineStyle {
	Straight = 'straight',
	Curved = 'curved',
	Angled = 'angled',
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
export enum UnitOfPower {
	WATT = 'W',
	KILO_WATT = 'kW',
	MEGA_WATT = 'MW',
}
