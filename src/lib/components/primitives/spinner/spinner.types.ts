import { DmCssSize, DmSize } from '../../../core/types/common.types';

/**
 * Spinner size: a named size (`sm` 1rem, `md` 1.5rem, `lg` 2rem),
 * a number in pixels, or any CSS length (`'1em'`, `'clamp(...)'`).
 */
export type DmSpinnerSize = DmSize | DmCssSize;
