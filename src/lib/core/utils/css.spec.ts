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

  it('treats bare numeric strings as pixels (they are not valid CSS otherwise)', () => {
    // A plain HTML attribute like `size="14"` (no Angular binding) carries a
    // string, not a number — without this, it silently produces invalid CSS.
    expect(toCssSize('14')).toBe('14px');
    expect(toCssSize('0')).toBe('0px');
    expect(toCssSize('-1.5')).toBe('-1.5px');
  });

  it('normalizes empty values to null so the style is not set', () => {
    expect(toCssSize('')).toBeNull();
    expect(toCssSize(null)).toBeNull();
    expect(toCssSize(undefined)).toBeNull();
  });
});
