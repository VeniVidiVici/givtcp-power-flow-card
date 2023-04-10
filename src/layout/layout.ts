import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { FlowData, FlowDirection } from '../types';

export abstract class GivTCPPowerFlowCardLayout extends LitElement {
	@property() flowData!: FlowData[];
	@property() flows!: { from: string; to: string; direction: FlowDirection }[];
	@property() entitySize!: number;
	@property() lineWidth!: number;

	protected get hasSolar(): boolean {
		return this.isEnabled('solar') !== undefined;
	}
	protected get hasBattery(): boolean {
		return this.isEnabled('battery') !== undefined;
	}
	protected get hasEPS(): boolean {
		return this.isEnabled('eps') !== undefined;
	}
	protected get hasCustom1(): boolean {
		return this.isEnabled('custom1') !== undefined;
	}
	protected get hasCustom2(): boolean {
		return this.isEnabled('custom2') !== undefined;
	}
	protected createRenderRoot() {
		return this;
	}
	protected isEnabled(flow: string) {
		return this.flowData.find((f) => f.type === flow) ?? undefined;
	}
}
