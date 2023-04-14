import { customElement, property } from 'lit/decorators.js';
import { GivTCPPowerFlowCardLayout } from './layout';
import { TemplateResult, html, svg } from 'lit';
import { FlowDirection, FlowPower } from '../types';
import { SVGUtils } from '../utils/svg-utils';

@customElement('givtcp-power-flow-card-layout-list')
export class GivTCPPowerFlowCardLayoutList extends GivTCPPowerFlowCardLayout {
	@property() flowPowers!: FlowPower[];

	private get halfEntity(): number {
		return this.entityWidth / 2;
	}
	private iconFor(type: string): string {
		return this.flowData.find((f) => f.type === type)?.icon ?? 'mdi:power-plug';
	}
	private directionFor(from: string, to: string): FlowDirection {
		return this.flows.find((f) => f.from === from && f.to === to)?.direction ?? FlowDirection.In;
	}
	private extraFor(type: string): string | undefined {
		return this.flowData.find((f) => f.type === type)?.extra;
	}
	render() {
		return html`
			<div class="gtpc-layout gtpc-layout-list">
				${this.flowPowers
					.sort((a, b) => b.value - a.value)
					.map(
						(flow) => html`<div class="gtpc-list-row" data-power='${flow.value}'>
							<svg viewBox="0 0 100 ${this.halfEntity}" xmlns="http://www.w3.org/2000/svg">
								${this.getGroupForFlow(flow.from, flow.to)}
							</svg>
							<div class="gtpc-list-entity gtpc-from-entity" data-type="${flow.from}">
								<ha-icon .icon="${this.iconFor(flow.from)}"></ha-icon>
								${this.extraFor(flow.from) ? html`<div>${this.extraFor(flow.from)}</div>` : html``}
							</div>
							<div class="gtpc-list-flow-value">
								<span>${this.formatPower(flow.value)}</span>
							</div>
							<div class="gtpc-list-entity gtpc-to-entity" data-type="${flow.to}">
								<ha-icon .icon="${this.iconFor(flow.to)}"></ha-icon>
								${this.extraFor(flow.to) ? html`<div>${this.extraFor(flow.to)}</div>` : html``}
							</div>
							</div>
						</div>`
					)}
			</div>
		`;
	}
	private getGroupForFlow(from: string, to: string): TemplateResult {
		const direction = this.directionFor(from, to);
		const startX = direction === FlowDirection.In ? this.halfEntity : this.width - this.halfEntity;
		const endX = direction === FlowDirection.In ? this.width - this.halfEntity : this.halfEntity;
		const y = this.halfEntity / 2;

		return svg`<g data-pos="0" class="gtpc-flow gtpc-${from}-to-${to}-flow" style="stroke: var(--gtpc-${from}-color)">
			<path d="${SVGUtils.getStraightPath(startX, y, endX, y)}" />
			<circle cx="0" cy="0" r="0.5" style="fill: var(--gtpc-${from}-color)"/>
		</g>`;
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'givtcp-power-flow-card-layout-list': GivTCPPowerFlowCardLayoutList;
	}
}
