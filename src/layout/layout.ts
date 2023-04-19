import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { FlowData, FlowDirection, UnitOfPower } from '../types';

export abstract class GivTCPPowerFlowCardLayout extends LitElement {
	@property() flowData!: FlowData[];
	@property() flows!: { from: string; to: string; direction: FlowDirection }[];
	@property() entitySize!: number;
	@property() entityLineWidth!: number;
	protected width = 100;
	protected midX = this.width / 2;
	protected get midY(): number {
		if ((this.hasCustom1 && this.hasCustom2) || (this.hasSolar && this.hasCustom2)) {
			return Math.round(this.height / 2);
		} else if (this.hasBattery && !this.hasSolar) {
			return Math.round(this.height / this.entitySize);
		} else if (this.hasSolar && !this.hasBattery) {
			return this.height - Math.round(this.entityWidth / 2);
		} else {
			return Math.round(this.height / 2);
		}
	}
	protected get height(): number {
		if ((this.hasCustom1 && this.hasCustom2) || (this.hasSolar && this.hasCustom2)) {
			return this.entityWidth * this.entitySize;
		} else if (!this.hasSolar && !this.hasBattery) {
			return this.entityWidth;
		} else if (!this.hasSolar || !this.hasBattery) {
			return (this.entityWidth * Math.round(this.entitySize)) / 2;
		} else {
			return this.entityWidth * this.entitySize;
		}
	}
	protected get entityWidth(): number {
		return Math.round(this.width / this.entitySize);
	}
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
	protected formatPower(power: number): string {
		if (power < 1000) return `${power}${UnitOfPower.WATT}`;
		if (power < 1000000) return `${(power / 1000).toFixed(1)}${UnitOfPower.KILO_WATT}`;
		return `${(power / 1000000).toFixed(1)}${UnitOfPower.MEGA_WATT}`;
	}
}
