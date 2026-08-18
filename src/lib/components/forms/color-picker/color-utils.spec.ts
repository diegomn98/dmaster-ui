import {
  HSVA,
  clampChannel,
  formatHex,
  formatRgb,
  hsvaToRgba,
  hueToRgb,
  parseColor,
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

    it('is tolerant of whitespace and case', () => {
      expect(formatHex(parseColor('  #FF0000  ')!, false)).toBe('#ff0000');
      expect(formatHex(parseColor('RGB( 255 , 0 , 0 )')!, false)).toBe('#ff0000');
    });

    it('returns null on garbage', () => {
      expect(parseColor('')).toBeNull();
      expect(parseColor('#12')).toBeNull();
      expect(parseColor('#zzzzzz')).toBeNull();
      expect(parseColor('hsl(0, 100%, 50%)')).toBeNull();
      expect(parseColor('rgb(1, 2)')).toBeNull();
      expect(parseColor('rgb(1, 2, 3, 4, 5)')).toBeNull();
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
