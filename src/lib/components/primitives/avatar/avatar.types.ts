import { DmCssSize, DmSize } from '../../../core/types/common.types';

/** Avatar shape. */
export type DmAvatarShape = 'circle' | 'square';

/** Semantic color of the initials tint (subtle fill + text). */
export type DmAvatarColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/**
 * Avatar size: a named size (`sm` 2rem, `md` 2.5rem, `lg` 3rem),
 * a number in pixels, or any CSS length.
 */
export type DmAvatarSize = DmSize | DmCssSize;
