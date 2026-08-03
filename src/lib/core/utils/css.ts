import { DmCssSize } from '../types/common.types';

/**
 * Normalizes a component size input into a CSS value:
 * numbers become pixels, strings pass through verbatim,
 * `null`/`undefined`/`''` become `null` (property not set).
 */
export function toCssSize(value: DmCssSize | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return typeof value === 'number' ? `${value}px` : value;
}
