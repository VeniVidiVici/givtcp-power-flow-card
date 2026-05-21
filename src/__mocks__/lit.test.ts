import { css, LitElement, html, svg } from './lit';

describe('lit mocks', () => {
  describe('css', () => {
    it('should return the input strings when called', () => {
      const strings = ['color: red', 'background: blue'];
      const result = css(strings);
      expect(result).toBe(strings);
    });

    it('should be a jest mock function', () => {
      expect(css).toBeDefined();
      expect(typeof css).toBe('function');
    });
  });

  describe('LitElement', () => {
    let element: LitElement;

    beforeEach(() => {
      element = new LitElement();
    });

    describe('style', () => {
      it('should have setProperty mock function', () => {
        expect(element.style.setProperty).toBeDefined();
        element.style.setProperty('color', 'red');
        expect(element.style.setProperty).toHaveBeenCalledWith('color', 'red');
      });

      it('should have removeProperty mock function', () => {
        expect(element.style.removeProperty).toBeDefined();
        element.style.removeProperty('color');
        expect(element.style.removeProperty).toHaveBeenCalledWith('color');
      });

      it('should have getPropertyValue mock function', () => {
        expect(element.style.getPropertyValue).toBeDefined();
        element.style.getPropertyValue('color');
        expect(element.style.getPropertyValue).toHaveBeenCalledWith('color');
      });
    });

    describe('shadowRoot', () => {
      it('should be null by default', () => {
        expect(element.shadowRoot).toBeNull();
      });
    });

    describe('addEventListener', () => {
      it('should add an event listener', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        expect(element['_eventListeners'].has('click')).toBe(true);
        expect(element['_eventListeners'].get('click')).toContain(callback);
      });

      it('should add multiple listeners for the same event', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        element.addEventListener('click', callback1);
        element.addEventListener('click', callback2);
        expect(element['_eventListeners'].get('click')).toHaveLength(2);
      });

      it('should add listeners for different events', () => {
        const clickCallback = jest.fn();
        const mouseOverCallback = jest.fn();
        element.addEventListener('click', clickCallback);
        element.addEventListener('mouseover', mouseOverCallback);
        expect(element['_eventListeners'].has('click')).toBe(true);
        expect(element['_eventListeners'].has('mouseover')).toBe(true);
      });
    });

    describe('removeEventListener', () => {
      it('should remove an existing event listener', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        expect(element['_eventListeners'].get('click')).toContain(callback);
        element.removeEventListener('click', callback);
        expect(element['_eventListeners'].get('click')).not.toContain(callback);
      });

      it('should not throw when removing non-existent listener', () => {
        const callback = jest.fn();
        expect(() => element.removeEventListener('click', callback)).not.toThrow();
      });

      it('should remove only the specified listener', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        element.addEventListener('click', callback1);
        element.addEventListener('click', callback2);
        element.removeEventListener('click', callback1);
        expect(element['_eventListeners'].get('click')).toContain(callback2);
        expect(element['_eventListeners'].get('click')).not.toContain(callback1);
      });
    });

    describe('dispatchEvent', () => {
      it('should call listeners for the event type', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        const event = { type: 'click' } as Event;
        element.dispatchEvent(event);
        expect(callback).toHaveBeenCalledWith(event);
      });

      it('should call multiple listeners for the same event', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        element.addEventListener('click', callback1);
        element.addEventListener('click', callback2);
        const event = { type: 'click' } as Event;
        element.dispatchEvent(event);
        expect(callback1).toHaveBeenCalledWith(event);
        expect(callback2).toHaveBeenCalledWith(event);
      });

      it('should not call listeners for different event types', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        const event = { type: 'mouseover' } as Event;
        element.dispatchEvent(event);
        expect(callback).not.toHaveBeenCalled();
      });

      it('should return true', () => {
        const event = { type: 'click' } as Event;
        const result = element.dispatchEvent(event);
        expect(result).toBe(true);
      });
    });

    describe('click', () => {
      it('should dispatch a click event', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        element.click();
        expect(callback).toHaveBeenCalled();
      });

      it('should dispatch event with type "click"', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        element.click();
        const event = callback.mock.calls[0][0];
        expect(event.type).toBe('click');
      });

      it('should dispatch event with stopPropagation method', () => {
        const callback = jest.fn();
        element.addEventListener('click', callback);
        element.click();
        const event = callback.mock.calls[0][0];
        expect(event.stopPropagation).toBeDefined();
        expect(typeof event.stopPropagation).toBe('function');
      });
    });

    describe('createRenderRoot', () => {
      it('should return itself', () => {
        const result = element.createRenderRoot();
        expect(result).toBe(element);
      });
    });

    describe('connectedCallback', () => {
      it('should not throw', () => {
        expect(() => element.connectedCallback()).not.toThrow();
      });
    });

    describe('disconnectedCallback', () => {
      it('should not throw', () => {
        expect(() => element.disconnectedCallback()).not.toThrow();
      });
    });

    describe('requestUpdate', () => {
      it('should not throw', () => {
        expect(() => element.requestUpdate()).not.toThrow();
      });
    });
  });

  describe('html', () => {
    it('should be imported from lit-html', () => {
      expect(html).toBeDefined();
      expect(typeof html).toBe('function');
    });
  });

  describe('svg', () => {
    it('should be imported from lit-html', () => {
      expect(svg).toBeDefined();
      expect(typeof svg).toBe('function');
    });
  });
});
