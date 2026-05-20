export function property(options?: any) {
  return function (_target: any, _propertyKey: string) {};
}

export function state() {
  return function (_target: any, _propertyKey: string) {};
}

export function query(selector: string) {
  return function (_target: any, _propertyKey: string) {};
}

export function queryAll(selector: string) {
  return function (_target: any, _propertyKey: string) {};
}

export function queryAssignedNodes(slotName?: string, flatten?: boolean, selector?: string) {
  return function (_target: any, _propertyKey: string) {};
}

export function queryAsync(selector: string) {
  return function (_target: any, _propertyKey: string) {};
}

export function eventOptions(options: any) {
  return function (_target: any, _propertyKey: string, _descriptor: PropertyDescriptor) {};
}

export function customElement(tagName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return constructor;
  };
}
