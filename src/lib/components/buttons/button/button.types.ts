/** Semantic color of the button. */
export type DmButtonColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant. */
export type DmButtonVariant =
  'solid' | 'flat' | 'faded' | 'bordered' | 'light' | 'ghost' | 'shadow';

/** Corner rounding. `full` is pill-shaped. */
export type DmButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/** Current state. `loading` disables the button; `success`/`error` flash an icon. */
export type DmButtonState = 'idle' | 'loading' | 'success' | 'error';

/** Native button type. */
export type DmButtonType = 'button' | 'submit' | 'reset';
