import { UnitOfPower } from '../types';

export const formatPower = (power: number): string => {
	if (power < 1000) return `${power}${UnitOfPower.WATT}`;
	if (power < 1000000) return `${(power / 1000).toFixed(1)}${UnitOfPower.KILO_WATT}`;
	return `${(power / 1000000).toFixed(1)}${UnitOfPower.MEGA_WATT}`;
};
