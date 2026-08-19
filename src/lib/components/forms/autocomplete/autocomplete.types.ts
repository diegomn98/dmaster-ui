/** Single suggestion in the autocomplete's option list. */
export interface DmAutocompleteOption {
  /** Underlying value/id carried by the option (surfaced on `optionSelected`). */
  value: string;
  /** Text shown in the option row and written into the field when picked. */
  label: string;
  /** Optional secondary line below the label. */
  description?: string;
  /** Individually disabled options are skipped by keyboard and not clickable. */
  disabled?: boolean;
}

/** Semantic color, shared with the field family palette. */
export type DmAutocompleteColor =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant of the field surface. */
export type DmAutocompleteVariant = 'flat' | 'bordered' | 'faded' | 'underlined';

/** Corner rounding. `full` is pill-shaped. */
export type DmAutocompleteRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
