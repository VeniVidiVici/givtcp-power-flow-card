export function html(strings: TemplateStringsArray, ...values: any[]) {
  return { strings, values };
}

export function svg(strings: TemplateStringsArray, ...values: any[]) {
  return { strings, values, type: 'svg' };
}

export function render(template: any, container: any) {
  // Mock render function
}

export const nothing = undefined;

export const noChange = Symbol('noChange');

export interface DirectiveResult {
  _$litDirective$: any;
}

export class Directive {
  constructor(_partInfo: any) {}
}

export const directive = <T extends Directive>(f: new (...args: any[]) => T) => {
  return () => ({ _$litDirective$: f });
};
