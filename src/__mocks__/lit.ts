import { html, svg } from 'lit-html';

export { html, svg } from 'lit-html';

export const css = jest.fn((strings: any) => strings);

export class LitElement {
  private _eventListeners: Map<string, Function[]> = new Map();
  public style: CSSStyleDeclaration = {
    setProperty: jest.fn(),
    removeProperty: jest.fn(),
    getPropertyValue: jest.fn(),
  } as any;
  public shadowRoot: any = null;

  addEventListener(event: string, callback: Function) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this._eventListeners.has(event)) {
      const listeners = this._eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event) {
    const listeners = this._eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
    return true;
  }

  click() {
    const event = { type: 'click', stopPropagation: () => {} };
    this.dispatchEvent(event as any);
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // Lifecycle method - no-op in mock
  }

  disconnectedCallback() {
    // Lifecycle method - no-op in mock
  }

  requestUpdate() {
    // No-op in mock
  }
}

export interface PropertyDeclaration {
  type?: any;
  attribute?: string | boolean;
  reflect?: boolean;
  converter?: any;
  hasChanged?: (value: any, old: any) => boolean;
}

export interface PropertyDeclarations {
  [key: string]: PropertyDeclaration;
}
