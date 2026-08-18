import { DmCssSize, DmSize } from '../../../core/types/common.types';

/**
 * Icon size: a named size (`sm` 1rem, `md` 1.5rem, `lg` 2rem),
 * a number in pixels, or any CSS length (`'1em'`, `'2.5rem'`, `'clamp(...)'`).
 */
export type DmIconSize = DmSize | DmCssSize;

/**
 * Icon color: a semantic token name (resolved to `var(--dm-…)`) or any raw CSS
 * color. Empty inherits `currentColor` from the surrounding text.
 */
export type DmIconColor =
  'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | (string & {});

/**
 * Material Symbols family for font-mode icons (`<dm-icon>home</dm-icon>`).
 * Each is a separate font the consumer loads; `outlined` is the default.
 */
export type DmIconFamily = 'outlined' | 'rounded' | 'sharp';

/**
 * A named set of icons — a map of icon name → SVG markup string. Register one
 * (or many) with {@link provideDmasterIcons} so `<dm-icon name="…">` can draw them.
 */
export type DmIconSet = Record<string, string>;
