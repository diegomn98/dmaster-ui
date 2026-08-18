/**
 * Semantic color (HeroUI-style, shared with the rest of the field family).
 * Drives the trigger focus ring and the panel's selected-swatch accent.
 */
export type DmColorPickerColor =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant of the trigger surface (matches `dm-select`). */
export type DmColorPickerVariant = 'flat' | 'bordered' | 'faded' | 'underlined';

/** Corner rounding of the trigger. `full` is pill-shaped. */
export type DmColorPickerRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
