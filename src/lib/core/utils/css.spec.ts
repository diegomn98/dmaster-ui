import { toCssSize } from './css';

describe('toCssSize', () => {
  it('converts numbers to pixel values', () => {
    expect(toCssSize(120)).toBe('120px');
    expect(toCssSize(0)).toBe('0px');
    expect(toCssSize(1.5)).toBe('1.5px');
  });

  it('passes string values through verbatim', () => {
    expect(toCssSize('2rem')).toBe('2rem');
    expect(toCssSize('50%')).toBe('50%');
    expect(toCssSize('clamp(2rem, 10vw, 4rem)')).toBe('clamp(2rem, 10vw, 4rem)');
  });

  it('normalizes empty values to null so the style is not set', () => {
    expect(toCssSize('')).toBeNull();
    expect(toCssSize(null)).toBeNull();
    expect(toCssSize(undefined)).toBeNull();
  });
});
