export class ReactiveElement {
  static addInitializer(_initializer: (element: ReactiveElement) => void) {}
  
  static createProperty(_name: PropertyKey, _options?: any) {}
  
  static finalize() {}
  
  connectedCallback() {}
  
  disconnectedCallback() {}
  
  requestUpdate(_name?: PropertyKey, _oldValue?: any) {}
  
  updateComplete(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
