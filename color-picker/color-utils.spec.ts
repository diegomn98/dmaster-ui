import {
  HSVA,
  clampChannel,
  formatColor,
  formatHex,
  formatHsl,
  formatRgb,
  formatRgbModern,
  hslaToRgba,
  hsvaToRgba,
  hueToRgb,
  parseColor,
  rgbaToHsla,
  rgbaToHsva,
} from './color-utils';

describe('color-utils', () => {
  describe('parseColor', () => {
    it('parses 6-digit hex', () => {
      const hsva = parseColor('#ff0000');
      expect(hsva).not.toBeNull();
      expect(hsva!.h).toBeCloseTo(0);
      expect(hsva!.s).toBeCloseTo(1);
      expect(hsva!.v).toBeCloseTo(1);
      expect(hsva!.a).toBeCloseTo(1);
    });

    it('parses 3-digit hex (expands nibbles)', () => {
      expect(formatHex(parseColor('#f00')!, false)).toBe('#ff0000');
      expect(formatHex(parseColor('#abc')!, false)).toBe('#aabbcc');
    });

    it('parses 8-digit hex with alpha', () => {
      const hsva = parseColor('#ff000080');
      expect(hsva!.a).toBeCloseTo(128 / 255, 3);
    });

    it('parses 4-digit hex with alpha', () => {
      const hsva = parseColor('#f00f');
      expect(hsva!.a).toBeCloseTo(1);
      expect(formatHex(hsva!, false)).toBe('#ff0000');
    });

    it('parses rgb()', () => {
      const hsva = parseColor('rgb(0, 128, 255)');
      expect(formatHex(hsva!, false)).toBe('#0080ff');
    });

    it('parses rgba() with alpha', () => {
      const hsva = parseColor('rgba(0, 128, 255, 0.5)');
      expect(hsva!.a).toBeCloseTo(0.5);
    });

    it('parses modern space-separated rgb()', () => {
      expect(formatHex(parseColor('rgb(0 128 255)')!, false)).toBe('#0080ff');
      const withAlpha = parseColor('rgb(255 0 0 / 0.5)');
      expect(formatHex(withAlpha!, false)).toBe('#ff0000');
      expect(withAlpha!.a).toBeCloseTo(0.5);
    });

    it('parses legacy hsl() / hsla()', () => {
      expect(formatHex(parseColor('hsl(0, 100%, 50%)')!, false)).toBe('#ff0000');
      expect(formatHex(parseColor('hsl(210, 100%, 50%)')!, false)).toBe('#0080ff');
      expect(parseColor('hsla(120, 100%, 50%, 0.5)')!.a).toBeCloseTo(0.5);
    });

    it('parses modern hsl() with slash alpha, deg hue and percent alpha', () => {
      const hsva = parseColor('hsl(120deg 100% 25% / 50%)');
      expect(formatHex(hsva!, false)).toBe('#008000');
      expect(hsva!.a).toBeCloseTo(0.5);
    });

    it('treats bare hsl saturation/lightness numbers as percentages', () => {
      expect(formatHex(parseColor('hsl(0 100 50)')!, false)).toBe('#ff0000');
    });

    it('is tolerant of whitespace and case', () => {
      expect(formatHex(parseColor('  #FF0000  ')!, false)).toBe('#ff0000');
      expect(formatHex(parseColor('RGB( 255 , 0 , 0 )')!, false)).toBe('#ff0000');
      expect(formatHex(parseColor('HSL(0, 100%, 50%)')!, false)).toBe('#ff0000');
    });

    it('returns null on garbage', () => {
      expect(parseColor('')).toBeNull();
      expect(parseColor('#12')).toBeNull();
      expect(parseColor('#zzzzzz')).toBeNull();
      expect(parseColor('hsl(0, 100%)')).toBeNull();
      expect(parseColor('hsl(a, b%, c%)')).toBeNull();
      expect(parseColor('rgb(1, 2)')).toBeNull();
      expect(parseColor('rgb(1, 2, 3, 4, 5)')).toBeNull();
      expect(parseColor('rgb(1 2 3 / )')).toBeNull();
      expect(parseColor('not a color')).toBeNull();
      expect(parseColor('rgb(a, b, c)')).toBeNull();
    });
  });

  describe('hsvaToRgba', () => {
    const cases: [HSVA, { r: number; g: number; b: number }][] = [
      [
        { h: 0, s: 1, v: 1, a: 1 },
        { r: 255, g: 0, b: 0 },
      ],
      [
        { h: 120, s: 1, v: 1, a: 1 },
        { r: 0, g: 255, b: 0 },
      ],
      [
        { h: 240, s: 1, v: 1, a: 1 },
        { r: 0, g: 0, b: 255 },
      ],
      [
        { h: 0, s: 0, v: 1, a: 1 },
        { r: 255, g: 255, b: 255 },
      ],
      [
        { h: 0, s: 0, v: 0, a: 1 },
        { r: 0, g: 0, b: 0 },
      ],
      [
        { h: 60, s: 1, v: 1, a: 1 },
        { r: 255, g: 255, b: 0 },
      ],
    ];

    it.each(cases)('converts %o correctly', (hsva, rgb) => {
      const out = hsvaToRgba(hsva);
      expect(out.r).toBe(rgb.r);
      expect(out.g).toBe(rgb.g);
      expect(out.b).toBe(rgb.b);
    });
  });

  describe('rgbaToHsva', () => {
    it('maps pure red to h0 s1 v1', () => {
      const hsva = rgbaToHsva({ r: 255, g: 0, b: 0, a: 1 });
      expect(hsva.h).toBeCloseTo(0);
      expect(hsva.s).toBeCloseTo(1);
      expect(hsva.v).toBeCloseTo(1);
    });

    it('maps black to v0', () => {
      const hsva = rgbaToHsva({ r: 0, g: 0, b: 0, a: 1 });
      expect(hsva.v).toBeCloseTo(0);
      expect(hsva.s).toBeCloseTo(0);
    });

    it('maps white to s0 v1', () => {
      const hsva = rgbaToHsva({ r: 255, g: 255, b: 255, a: 1 });
      expect(hsva.s).toBeCloseTo(0);
      expect(hsva.v).toBeCloseTo(1);
    });
  });

  describe('formatHex', () => {
    it('formats without alpha by default', () => {
      expect(formatHex({ h: 0, s: 1, v: 1, a: 0.5 }, false)).toBe('#ff0000');
    });

    it('appends the alpha byte when asked', () => {
      expect(formatHex({ h: 0, s: 1, v: 1, a: 1 }, true)).toBe('#ff0000ff');
      expect(formatHex({ h: 0, s: 1, v: 1, a: 0 }, true)).toBe('#ff000000');
    });

    it('always emits lowercase', () => {
      expect(formatHex(parseColor('#ABCDEF')!, false)).toBe('#abcdef');
    });
  });

  describe('formatRgb', () => {
    it('formats rgb() and rgba()', () => {
      const hsva = parseColor('#0080ff')!;
      expect(formatRgb(hsva, false)).toBe('rgb(0, 128, 255)');
      expect(formatRgb({ ...hsva, a: 0.5 }, true)).toBe('rgba(0, 128, 255, 0.5)');
    });
  });

  describe('rgbaToHsla', () => {
    it('maps pure red to h0 s1 l0.5', () => {
      const hsla = rgbaToHsla({ r: 255, g: 0, b: 0, a: 1 });
      expect(hsla.h).toBeCloseTo(0);
      expect(hsla.s).toBeCloseTo(1);
      expect(hsla.l).toBeCloseTo(0.5);
    });

    it('maps white to l1 and black to l0, both with s0', () => {
      expect(rgbaToHsla({ r: 255, g: 255, b: 255, a: 1 })).toMatchObject({ s: 0, l: 1 });
      expect(rgbaToHsla({ r: 0, g: 0, b: 0, a: 1 })).toMatchObject({ s: 0, l: 0 });
    });

    it('maps mid gray to s0 l~0.5', () => {
      const hsla = rgbaToHsla({ r: 128, g: 128, b: 128, a: 1 });
      expect(hsla.s).toBeCloseTo(0);
      expect(hsla.l).toBeCloseTo(0.5, 2);
    });
  });

  describe('hslaToRgba', () => {
    it('converts primary hues back to sRGB', () => {
      expect(hslaToRgba({ h: 0, s: 1, l: 0.5, a: 1 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(hslaToRgba({ h: 120, s: 1, l: 0.25, a: 1 })).toEqual({ r: 0, g: 128, b: 0, a: 1 });
      expect(hslaToRgba({ h: 210, s: 1, l: 0.5, a: 1 })).toEqual({ r: 0, g: 128, b: 255, a: 1 });
    });
  });

  describe('formatRgbModern', () => {
    it('formats space-separated rgb() with optional slash alpha', () => {
      const hsva = parseColor('#0080ff')!;
      expect(formatRgbModern(hsva, false)).toBe('rgb(0 128 255)');
      expect(formatRgbModern({ ...hsva, a: 0.5 }, true)).toBe('rgb(0 128 255 / 0.5)');
      expect(formatRgbModern(hsva, true)).toBe('rgb(0 128 255 / 1)');
    });
  });

  describe('formatHsl', () => {
    it('formats hsl() with rounded degrees/percents and optional slash alpha', () => {
      const red = parseColor('#ff0000')!;
      expect(formatHsl(red, false)).toBe('hsl(0 100% 50%)');
      expect(formatHsl({ ...red, a: 0.5 }, true)).toBe('hsl(0 100% 50% / 0.5)');
      expect(formatHsl(parseColor('#0080ff')!, false)).toBe('hsl(210 100% 50%)');
    });
  });

  describe('formatColor', () => {
    const hsva = parseColor('#ff000080')!;

    it('dispatches on the format', () => {
      expect(formatColor(hsva, 'hex', false)).toBe('#ff0000');
      expect(formatColor(hsva, 'rgb', false)).toBe('rgb(255 0 0)');
      expect(formatColor(hsva, 'hsl', false)).toBe('hsl(0 100% 50%)');
    });

    it('carries alpha through every format', () => {
      expect(formatColor(hsva, 'hex', true)).toBe('#ff000080');
      expect(formatColor(hsva, 'rgb', true)).toBe('rgb(255 0 0 / 0.5)');
      expect(formatColor(hsva, 'hsl', true)).toBe('hsl(0 100% 50% / 0.5)');
    });

    it('emits values parseColor understands (round-trip)', () => {
      for (const format of ['hex', 'rgb', 'hsl'] as const) {
        const out = formatColor(hsva, format, true);
        expect(formatHex(parseColor(out)!, false)).toBe('#ff0000');
      }
    });
  });

  describe('clampChannel', () => {
    it('rounds and clamps into 0..255', () => {
      expect(clampChannel(-5)).toBe(0);
      expect(clampChannel(300)).toBe(255);
      expect(clampChannel(127.6)).toBe(128);
      expect(clampChannel(NaN)).toBe(0);
    });
  });

  describe('hueToRgb', () => {
    it('returns the pure spectrum color for an angle', () => {
      expect(hueToRgb(0)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hueToRgb(240)).toEqual({ r: 0, g: 0, b: 255 });
    });
  });

  describe('round-trips', () => {
    const samples = ['#ff0000', '#00ff00', '#0000ff', '#123456', '#abcdef', '#808080', '#ffffff'];

    it.each(samples)('hex→hsva→hex is stable for %s', (hex) => {
      expect(formatHex(parseColor(hex)!, false)).toBe(hex);
    });

    it('preserves alpha through an 8-digit round-trip', () => {
      const hex = '#12345680';
      expect(formatHex(parseColor(hex)!, true)).toBe(hex);
    });
  });
});
