import { DmCssSize } from '../types/common.types';

// A bare numeric string ("14", "-1.5") has no CSS unit and is invalid as a
// style value — the browser silently drops it, which reads as a component
// rendering at some unrelated intrinsic size with no error anywhere. Treat it
// like a number (px) instead of passing it through broken.
const NUMERIC_STRING = /^-?\d+(\.\d+)?$/;

/**
 * Normalizes a component size input into a CSS value: numbers (and bare
 * numeric strings) become pixels, strings carrying a unit or function pass
 * through verbatim, `null`/`undefined`/`''` become `null` (property not set).
 */
export function toCssSize(value: DmCssSize | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number' || NUMERIC_STRING.test(value)) {
    return `${value}px`;
  }
  return value;
}
