import { html, svg, render, nothing, noChange, Directive, directive } from './lit-html';

describe('lit-html mock', () => {
  describe('html', () => {
    it('should return an object with strings and values', () => {
      const result = html`<div>Hello</div>`;
      expect(result).toEqual({ strings: ['<div>Hello</div>'], values: [] });
    });

    it('should handle interpolated values', () => {
      const name = 'World';
      const result = html`<div>Hello ${name}</div>`;
      expect(result).toEqual({ strings: ['<div>Hello ', '</div>'], values: ['World'] });
    });

    it('should handle multiple interpolated values', () => {
      const firstName = 'John';
      const lastName = 'Doe';
      const result = html`<div>${firstName} ${lastName}</div>`;
      expect(result).toEqual({ strings: ['<div>', ' ', '</div>'], values: ['John', 'Doe'] });
    });
  });

  describe('svg', () => {
    it('should return an object with strings, values, and type svg', () => {
      const result = svg`<circle r="5" />`;
      expect(result).toEqual({ strings: ['<circle r="5" />'], values: [], type: 'svg' });
    });

    it('should handle interpolated values', () => {
      const radius = 10;
      const result = svg`<circle r="${radius}" />`;
      expect(result).toEqual({ strings: ['<circle r="', '" />'], values: [10], type: 'svg' });
    });
  });

  describe('render', () => {
    it('should be a function that does not throw', () => {
      const container = {} as any;
      const template = html`<div>Test</div>`;
      expect(() => render(template, container)).not.toThrow();
    });

    it('should return undefined', () => {
      const container = {} as any;
      const template = html`<div>Test</div>`;
      const result = render(template, container);
      expect(result).toBeUndefined();
    });
  });

  describe('nothing', () => {
    it('should be undefined', () => {
      expect(nothing).toBeUndefined();
    });
  });

  describe('noChange', () => {
    it('should be a Symbol', () => {
      expect(typeof noChange).toBe('symbol');
    });

    it('should have description noChange', () => {
      expect(noChange.description).toBe('noChange');
    });
  });

  describe('Directive', () => {
    it('should be a class that can be instantiated', () => {
      const partInfo = { type: 'test' };
      const instance = new Directive(partInfo);
      expect(instance).toBeInstanceOf(Directive);
    });
  });

  describe('directive', () => {
    it('should return a function', () => {
      const result = directive(Directive);
      expect(typeof result).toBe('function');
    });

    it('should return an object with _$litDirective$ when called', () => {
      const directiveFn = directive(Directive);
      const result = directiveFn();
      expect(result).toHaveProperty('_$litDirective$', Directive);
    });
  });
});
