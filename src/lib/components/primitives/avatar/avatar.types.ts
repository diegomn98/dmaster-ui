import { DmCssSize, DmSize } from '../../../core/types/common.types';

/** Avatar shape. */
export type DmAvatarShape = 'circle' | 'square';

/**
 * Avatar size: a named size (`sm` 2rem, `md` 2.5rem, `lg` 3rem),
 * a number in pixels, or any CSS length.
 */
export type DmAvatarSize = DmSize | DmCssSize;
