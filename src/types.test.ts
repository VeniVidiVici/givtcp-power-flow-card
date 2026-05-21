import {
	FlowData,
	entityName,
	LineStyle,
	FlowTotal,
	FlowDirection,
	EntityLayout,
	CentreEntity,
	UnitOfPower,
	FlowPower,
	DotEasing,
} from './types';

describe('types', () => {
	describe('LineStyle enum', () => {
		it('should have correct values', () => {
			expect(LineStyle.Straight).toBe('straight');
			expect(LineStyle.Curved).toBe('curved');
			expect(LineStyle.Angled).toBe('angled');
		});
	});

	describe('FlowDirection enum', () => {
		it('should have correct numeric values', () => {
			expect(FlowDirection.In).toBe(0);
			expect(FlowDirection.Out).toBe(1);
		});
	});

	describe('EntityLayout enum', () => {
		it('should have correct values', () => {
			expect(EntityLayout.Cross).toBe('cross');
			expect(EntityLayout.Square).toBe('square');
			expect(EntityLayout.Circle).toBe('circle');
			expect(EntityLayout.List).toBe('list');
		});
	});

	describe('CentreEntity enum', () => {
		it('should have correct values', () => {
			expect(CentreEntity.None).toBe('none');
			expect(CentreEntity.House).toBe('house');
			expect(CentreEntity.Inverter).toBe('inverter');
			expect(CentreEntity.Solar).toBe('solar');
			expect(CentreEntity.Battery).toBe('battery');
		});
	});

	describe('UnitOfPower enum', () => {
		it('should have correct values', () => {
			expect(UnitOfPower.WATT).toBe('W');
			expect(UnitOfPower.KILO_WATT).toBe('kW');
			expect(UnitOfPower.MEGA_WATT).toBe('MW');
		});
	});

	describe('DotEasing enum', () => {
		it('should have correct values', () => {
			expect(DotEasing.Linear).toBe('linear');
			expect(DotEasing.EaseIn).toBe('easeIn');
			expect(DotEasing.EaseOut).toBe('easeOut');
			expect(DotEasing.EaseInOut).toBe('easeInOut');
		});
	});

	describe('FlowData interface', () => {
		it('should accept valid FlowData object', () => {
			const flowData: FlowData = {
				name: 'test',
				type: 'type',
				icon: 'icon',
			};
			expect(flowData.name).toBe('test');
			expect(flowData.type).toBe('type');
			expect(flowData.icon).toBe('icon');
		});

		it('should accept FlowData with optional extra property', () => {
			const flowData: FlowData = {
				name: 'test',
				type: 'type',
				icon: 'icon',
				extra: 'extra info',
			};
			expect(flowData.extra).toBe('extra info');
		});

		it('should accept FlowData with in property', () => {
			const flowData: FlowData = {
				name: 'test',
				type: 'type',
				icon: 'icon',
				in: { total: 100, parts: [{ type: 'a', value: 50 }] },
			};
			expect(flowData.in?.total).toBe(100);
		});

		it('should accept FlowData with out property', () => {
			const flowData: FlowData = {
				name: 'test',
				type: 'type',
				icon: 'icon',
				out: { total: 200, parts: [{ type: 'b', value: 100, to: 'dest' }] },
			};
			expect(flowData.out?.total).toBe(200);
		});

		it('should accept FlowData with linePos property', () => {
			const flowData: FlowData = {
				name: 'test',
				type: 'type',
				icon: 'icon',
				linePos: 5,
			};
			expect(flowData.linePos).toBe(5);
		});
	});

	describe('entityName interface', () => {
		it('should accept valid entityName object', () => {
			const name: entityName = {
				prefix: 'pre',
				suffix: 'suf',
			};
			expect(name.prefix).toBe('pre');
			expect(name.suffix).toBe('suf');
		});
	});

	describe('FlowTotal interface', () => {
		it('should accept valid FlowTotal object', () => {
			const flowTotal: FlowTotal = {
				total: 500,
				parts: [
					{ type: 'type1', value: 200 },
					{ type: 'type2', value: 300, to: 'target' },
				],
			};
			expect(flowTotal.total).toBe(500);
			expect(flowTotal.parts.length).toBe(2);
			expect(flowTotal.parts[0].value).toBe(200);
			expect(flowTotal.parts[1].to).toBe('target');
		});
	});

	describe('FlowPower interface', () => {
		it('should accept valid FlowPower object', () => {
			const flowPower: FlowPower = {
				from: 'source',
				to: 'destination',
				value: 750,
			};
			expect(flowPower.from).toBe('source');
			expect(flowPower.to).toBe('destination');
			expect(flowPower.value).toBe(750);
		});
	});
});
