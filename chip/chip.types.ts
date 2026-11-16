/** Semantic color of the chip. */
export type DmChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant. */
export type DmChipVariant = 'solid' | 'flat' | 'bordered' | 'light' | 'shadow';

/** Size scale. */
export type DmChipSize = 'sm' | 'md' | 'lg';

/** Corner rounding. `full` is pill-shaped. */
export type DmChipRadius = 'sm' | 'md' | 'lg' | 'full';

/**
 * How a `<dm-chip-set>` coordinates the selection of its selectable chips.
 * - `none` — the set is only a layout + keyboard container; each chip owns its
 *   `[(selected)]`.
 * - `single` — one chip selected at a time (choice chips), `[(value)]`.
 * - `multiple` — any number selected (filter chips), `[(values)]`.
 */
export type DmChipSetSelection = 'none' | 'single' | 'multiple';
