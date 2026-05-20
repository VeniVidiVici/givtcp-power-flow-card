import { ReactiveElement } from './reactive-element';

describe('ReactiveElement', () => {
  describe('addInitializer', () => {
    it('should accept an initializer function without throwing', () => {
      const initializer = jest.fn();
      expect(() => ReactiveElement.addInitializer(initializer)).not.toThrow();
    });

    it('should not call the initializer immediately', () => {
      const initializer = jest.fn();
      ReactiveElement.addInitializer(initializer);
      expect(initializer).not.toHaveBeenCalled();
    });
  });

  describe('createProperty', () => {
    it('should accept a property name without throwing', () => {
      expect(() => ReactiveElement.createProperty('test')).not.toThrow();
    });

    it('should accept a property name with options without throwing', () => {
      expect(() => ReactiveElement.createProperty('test', { type: String })).not.toThrow();
    });
  });

  describe('finalize', () => {
    it('should execute without throwing', () => {
      expect(() => ReactiveElement.finalize()).not.toThrow();
    });
  });

  describe('instance methods', () => {
    let element: ReactiveElement;

    beforeEach(() => {
      element = new ReactiveElement();
    });

    describe('connectedCallback', () => {
      it('should execute without throwing', () => {
        expect(() => element.connectedCallback()).not.toThrow();
      });
    });

    describe('disconnectedCallback', () => {
      it('should execute without throwing', () => {
        expect(() => element.disconnectedCallback()).not.toThrow();
      });
    });

    describe('requestUpdate', () => {
      it('should execute without arguments without throwing', () => {
        expect(() => element.requestUpdate()).not.toThrow();
      });

      it('should execute with name argument without throwing', () => {
        expect(() => element.requestUpdate('test')).not.toThrow();
      });

      it('should execute with name and oldValue arguments without throwing', () => {
        expect(() => element.requestUpdate('test', 'oldValue')).not.toThrow();
      });
    });

    describe('updateComplete', () => {
      it('should return a promise', () => {
        const result = element.updateComplete();
        expect(result).toBeInstanceOf(Promise);
      });

      it('should resolve to true', async () => {
        const result = await element.updateComplete();
        expect(result).toBe(true);
      });
    });
  });
});
