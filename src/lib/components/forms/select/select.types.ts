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

/**
 * A labelled group of options. Rendered with a non-selectable header above its
 * items. A disabled group disables all of its options.
 */
export interface DmSelectGroup<T = unknown> {
  /** Header text shown above the group's options. */
  label: string;
  /** Options belonging to this group. */
  items: DmSelectItem<T>[];
  /** Disables every option in the group. */
  disabled?: boolean;
}

/**
 * An entry in the `items` input: either a flat option or a group of options.
 * A plain `DmSelectItem[]` is still valid — grouping is purely additive.
 */
export type DmSelectOptionOrGroup<T = unknown> = DmSelectItem<T> | DmSelectGroup<T>;

/** Narrows a `DmSelectOptionOrGroup` to a group. */
export function isDmSelectGroup<T>(entry: DmSelectOptionOrGroup<T>): entry is DmSelectGroup<T> {
  return Array.isArray((entry as DmSelectGroup<T>).items);
}

/** Semantic color, shared with the button/badge palette. */
export type DmSelectColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant of the trigger surface. */
export type DmSelectVariant = 'flat' | 'bordered' | 'faded' | 'underlined';

/** Corner rounding. `full` is pill-shaped. */
export type DmSelectRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
