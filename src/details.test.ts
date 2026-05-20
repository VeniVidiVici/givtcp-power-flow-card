import { GivTCPPowerFlowCardDetails } from './details';
import { HassEntity } from 'home-assistant-js-websocket';

describe('GivTCPPowerFlowCardDetails', () => {
	let element: GivTCPPowerFlowCardDetails;

	beforeEach(() => {
		element = new GivTCPPowerFlowCardDetails();
	});

	describe('formatEntityName', () => {
		it('should remove givtcp prefix with pattern and kwh suffix', () => {
			const result = (element as any).formatEntityName('givtcp AB1234C567 Battery kWh');
			expect(result).toBe('Battery');
		});

		it('should remove givtcp prefix with different pattern', () => {
			const result = (element as any).formatEntityName('givtcp XY9999Z123 Solar kWh');
			expect(result).toBe('Solar');
		});

		it('should return the same name if no givtcp prefix', () => {
			const result = (element as any).formatEntityName('Grid Power');
			expect(result).toBe('Grid Power');
		});

		it('should handle undefined input', () => {
			const result = (element as any).formatEntityName(undefined);
			expect(result).toBe('');
		});

		it('should remove kwh suffix case insensitively', () => {
			const result = (element as any).formatEntityName('givtcp AB1234C567 Test KWH');
			expect(result).toBe('Test');
		});

		it('should handle name without kwh suffix after prefix removal', () => {
			const result = (element as any).formatEntityName('givtcp AB1234C567 Home');
			expect(result).toBe('Home');
		});
	});

	describe('entities property', () => {
		it('should accept entities array', () => {
			const mockEntities: HassEntity[] = [
				{
					entity_id: 'sensor.battery',
					state: '100',
					attributes: {
						friendly_name: 'Battery',
						unit_of_measurement: 'kWh',
					},
				} as unknown as HassEntity,
			];
			element.entities = mockEntities;
			expect(element.entities).toEqual(mockEntities);
		});
	});
});
