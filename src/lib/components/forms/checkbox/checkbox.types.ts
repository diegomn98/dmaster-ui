/** Semantic color of the checked / indeterminate fill. */
export type DmCheckboxColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

/** Size scale of the checkbox box and label. */
export type DmCheckboxSize = 'sm' | 'md';

/** Internal checked state used for indeterminate support. */
export type DmCheckboxState = 'unchecked' | 'checked' | 'indeterminate';
