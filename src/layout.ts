import { LitElement, TemplateResult, svg } from "lit";
import { property } from "lit/decorators.js";
import { FlowData, FlowDirection } from "./types";

export abstract class GivTCPPowerFlowCardLayout extends LitElement {
	@property() flowData!: FlowData[];
	@property() flows!: { from: string, to: string, direction: FlowDirection }[];
	@property() hasBattery!: boolean;
	@property() hasSolar!: boolean;

}