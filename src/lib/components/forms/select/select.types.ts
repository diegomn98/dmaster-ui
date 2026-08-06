/** Single item in the select's option list. */
export interface DmSelectItem<T = unknown> {
  /** Underlying value stored in the model. Any identity-comparable type. */
  value: T;
  /** Text shown in the option row and in the trigger when this item is selected. */
  label: string;
  /** Optional secondary line below the label. */
  description?: string;
  /** Individually disabled items are skipped by keyboard navigation. */
  disabled?: boolean;
}

/** Semantic color (HeroUI-style, shared with the button/badge palette). */
export type DmSelectColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant of the trigger surface. */
export type DmSelectVariant = 'flat' | 'bordered' | 'faded' | 'underlined';

/** Corner rounding. `full` is pill-shaped. */
export type DmSelectRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
