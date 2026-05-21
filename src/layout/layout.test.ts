import { GivTCPPowerFlowCardLayout } from './layout';
import { FlowData, FlowDirection, UnitOfPower } from '../types';

class TestLayout extends GivTCPPowerFlowCardLayout {
	render() {
		return null;
	}

	// Expose protected methods/properties for testing
	public getMidY() {
		return this.midY;
	}

	public getHeight() {
		return this.height;
	}

	public getEntityWidth() {
		return this.entityWidth;
	}

	public getHasSolar() {
		return this.hasSolar;
	}

	public getHasBattery() {
		return this.hasBattery;
	}

	public getHasEPS() {
		return this.hasEPS;
	}

	public getHasCustom1() {
		return this.hasCustom1;
	}

	public getHasCustom2() {
		return this.hasCustom2;
	}

	public callIsEnabled(flow: string) {
		return this.isEnabled(flow);
	}

	public callFormatPower(power: number): string {
		return this.formatPower(power);
	}
}

function createTestLayout(
	flowData: FlowData[] = [],
	entitySize = 4,
	entityLineWidth = 2
): TestLayout {
	const layout = new TestLayout();
	layout.flowData = flowData;
	layout.flows = [];
	layout.entitySize = entitySize;
	layout.entityLineWidth = entityLineWidth;
	return layout;
}

describe('GivTCPPowerFlowCardLayout', () => {
	describe('entityWidth', () => {
		it('should calculate entityWidth correctly', () => {
			const layout = createTestLayout([], 4);
			expect(layout.getEntityWidth()).toBe(25);
		});

		it('should calculate entityWidth with different entitySize', () => {
			const layout = createTestLayout([], 2);
			expect(layout.getEntityWidth()).toBe(50);
		});
	});

	describe('isEnabled', () => {
		it('should return the flow data when flow type exists', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.callIsEnabled('solar')).toEqual({
				name: 'Solar',
				type: 'solar',
				icon: 'sun',
			});
		});

		it('should return undefined when flow type does not exist', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.callIsEnabled('battery')).toBeUndefined();
		});

		it('should return undefined for empty flowData', () => {
			const layout = createTestLayout([]);
			expect(layout.callIsEnabled('solar')).toBeUndefined();
		});
	});

	describe('hasSolar', () => {
		it('should return true when solar flow exists', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.getHasSolar()).toBe(true);
		});

		it('should return false when solar flow does not exist', () => {
			const layout = createTestLayout([]);
			expect(layout.getHasSolar()).toBe(false);
		});
	});

	describe('hasBattery', () => {
		it('should return true when battery flow exists', () => {
			const flowData: FlowData[] = [
				{ name: 'Battery', type: 'battery', icon: 'battery' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.getHasBattery()).toBe(true);
		});

		it('should return false when battery flow does not exist', () => {
			const layout = createTestLayout([]);
			expect(layout.getHasBattery()).toBe(false);
		});
	});

	describe('hasEPS', () => {
		it('should return true when eps flow exists', () => {
			const flowData: FlowData[] = [
				{ name: 'EPS', type: 'eps', icon: 'plug' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.getHasEPS()).toBe(true);
		});

		it('should return false when eps flow does not exist', () => {
			const layout = createTestLayout([]);
			expect(layout.getHasEPS()).toBe(false);
		});
	});

	describe('hasCustom1', () => {
		it('should return true when custom1 flow exists', () => {
			const flowData: FlowData[] = [
				{ name: 'Custom1', type: 'custom1', icon: 'custom' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.getHasCustom1()).toBe(true);
		});

		it('should return false when custom1 flow does not exist', () => {
			const layout = createTestLayout([]);
			expect(layout.getHasCustom1()).toBe(false);
		});
	});

	describe('hasCustom2', () => {
		it('should return true when custom2 flow exists', () => {
			const flowData: FlowData[] = [
				{ name: 'Custom2', type: 'custom2', icon: 'custom' },
			];
			const layout = createTestLayout(flowData);
			expect(layout.getHasCustom2()).toBe(true);
		});

		it('should return false when custom2 flow does not exist', () => {
			const layout = createTestLayout([]);
			expect(layout.getHasCustom2()).toBe(false);
		});
	});

	describe('height', () => {
		it('should return entityWidth * entitySize when hasCustom1 and hasCustom2', () => {
			const flowData: FlowData[] = [
				{ name: 'Custom1', type: 'custom1', icon: 'custom' },
				{ name: 'Custom2', type: 'custom2', icon: 'custom' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getHeight()).toBe(100);
		});

		it('should return entityWidth * entitySize when hasSolar and hasCustom2', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
				{ name: 'Custom2', type: 'custom2', icon: 'custom' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getHeight()).toBe(100);
		});

		it('should return entityWidth when no solar and no battery', () => {
			const layout = createTestLayout([], 4);
			expect(layout.getHeight()).toBe(25);
		});

		it('should return (entityWidth * entitySize) / 2 when only battery', () => {
			const flowData: FlowData[] = [
				{ name: 'Battery', type: 'battery', icon: 'battery' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getHeight()).toBe(50);
		});

		it('should return (entityWidth * entitySize) / 2 when only solar', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getHeight()).toBe(50);
		});

		it('should return entityWidth * entitySize when hasSolar and hasBattery', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
				{ name: 'Battery', type: 'battery', icon: 'battery' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getHeight()).toBe(100);
		});
	});

	describe('midY', () => {
		it('should return height / 2 when hasCustom1 and hasCustom2', () => {
			const flowData: FlowData[] = [
				{ name: 'Custom1', type: 'custom1', icon: 'custom' },
				{ name: 'Custom2', type: 'custom2', icon: 'custom' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getMidY()).toBe(50);
		});

		it('should return height / 2 when hasSolar and hasCustom2', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
				{ name: 'Custom2', type: 'custom2', icon: 'custom' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getMidY()).toBe(50);
		});

		it('should return height / entitySize when hasBattery and not hasSolar', () => {
			const flowData: FlowData[] = [
				{ name: 'Battery', type: 'battery', icon: 'battery' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getMidY()).toBe(13);
		});

		it('should return height - entityWidth / 2 when hasSolar and not hasBattery', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getMidY()).toBe(37);
		});

		it('should return height / 2 for default case (solar and battery)', () => {
			const flowData: FlowData[] = [
				{ name: 'Solar', type: 'solar', icon: 'sun' },
				{ name: 'Battery', type: 'battery', icon: 'battery' },
			];
			const layout = createTestLayout(flowData, 4);
			expect(layout.getMidY()).toBe(50);
		});
	});

	describe('formatPower', () => {
		it('should format power in watts when less than 1000', () => {
			const layout = createTestLayout([]);
			expect(layout.callFormatPower(500)).toBe('500W');
		});

		it('should format power in kilowatts when between 1000 and 999999', () => {
			const layout = createTestLayout([]);
			expect(layout.callFormatPower(1500)).toBe('1.5kW');
		});

		it('should format power in kilowatts with decimal', () => {
			const layout = createTestLayout([]);
			expect(layout.callFormatPower(1234)).toBe('1.2kW');
		});

		it('should format power in megawatts when 1000000 or greater', () => {
			const layout = createTestLayout([]);
			expect(layout.callFormatPower(1500000)).toBe('1.5MW');
		});

		it('should format power at exactly 1000 watts', () => {
			const layout = createTestLayout([]);
			expect(layout.callFormatPower(1000)).toBe('1.0kW');
		});

		it('should format power at exactly 1000000 watts', () => {
			const layout = createTestLayout([]);
			expect(layout.callFormatPower(1000000)).toBe('1.0MW');
		});
	});

	describe('createRenderRoot', () => {
		it('should return this', () => {
			const layout = createTestLayout([]);
			expect(layout.createRenderRoot()).toBe(layout);
		});
	});

	describe('property decorators', () => {
		it('should have flowData property', () => {
			const layout = createTestLayout();
			expect(layout.flowData).toEqual([]);
		});

		it('should have flows property', () => {
			const layout = createTestLayout();
			expect(layout.flows).toEqual([]);
		});

		it('should have entitySize property', () => {
			const layout = createTestLayout();
			expect(layout.entitySize).toBe(4);
		});

		it('should have entityLineWidth property', () => {
			const layout = createTestLayout();
			expect(layout.entityLineWidth).toBe(2);
		});
	});
});
