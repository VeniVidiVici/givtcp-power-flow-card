import {
  property,
  state,
  query,
  queryAll,
  queryAssignedNodes,
  queryAsync,
  eventOptions,
  customElement,
} from './lit-decorators';

describe('lit-decorators mocks', () => {
  describe('property', () => {
    it('should return a function that accepts target and propertyKey', () => {
      const decorator = property({ type: String });
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'testProp';
      expect(() => decorator(mockTarget as any, mockPropertyKey)).not.toThrow();
    });

    it('should work without options', () => {
      const decorator = property();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('state', () => {
    it('should return a function that accepts target and propertyKey', () => {
      const decorator = state();
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'testState';
      expect(() => decorator(mockTarget as any, mockPropertyKey)).not.toThrow();
    });
  });

  describe('query', () => {
    it('should return a function that accepts target and propertyKey', () => {
      const decorator = query('#myElement');
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'myElement';
      expect(() => decorator(mockTarget as any, mockPropertyKey)).not.toThrow();
    });
  });

  describe('queryAll', () => {
    it('should return a function that accepts target and propertyKey', () => {
      const decorator = queryAll('.myClass');
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'myElements';
      expect(() => decorator(mockTarget as any, mockPropertyKey)).not.toThrow();
    });
  });

  describe('queryAssignedNodes', () => {
    it('should return a function that accepts target and propertyKey with no arguments', () => {
      const decorator = queryAssignedNodes();
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'assignedNodes';
      expect(() => decorator(mockTarget as any, mockPropertyKey)).not.toThrow();
    });

    it('should accept slotName, flatten, and selector arguments', () => {
      const decorator = queryAssignedNodes('header', true, '.slot-content');
      expect(typeof decorator).toBe('function');
    });
  });

  describe('queryAsync', () => {
    it('should return a function that accepts target and propertyKey', () => {
      const decorator = queryAsync('#asyncElement');
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'asyncElement';
      expect(() => decorator(mockTarget as any, mockPropertyKey)).not.toThrow();
    });
  });

  describe('eventOptions', () => {
    it('should return a function that accepts target, propertyKey, and descriptor', () => {
      const decorator = eventOptions({ bubbles: true, composed: true });
      expect(typeof decorator).toBe('function');

      const mockTarget = {};
      const mockPropertyKey = 'myEvent';
      const mockDescriptor: PropertyDescriptor = { value: () => {} };
      expect(() => decorator(mockTarget as any, mockPropertyKey, mockDescriptor)).not.toThrow();
    });
  });

  describe('customElement', () => {
    it('should return a function that accepts a constructor', () => {
      const decorator = customElement('my-element');
      expect(typeof decorator).toBe('function');

      class MockClass {}
      const result = decorator(MockClass);
      expect(result).toBe(MockClass);
    });

    it('should return the same constructor passed in', () => {
      const decorator = customElement('another-element');

      class TestClass {
        constructor(public value: string) {}
      }

      const decoratedClass = decorator(TestClass);
      const instance = new decoratedClass('test');
      expect(instance.value).toBe('test');
    });
  });
});
