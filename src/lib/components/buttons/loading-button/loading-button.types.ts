/** Visual style of the button. */
export type DmLoadingButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/** Current state. `loading` disables the button; `success`/`error` flash an icon. */
export type DmLoadingButtonState = 'idle' | 'loading' | 'success' | 'error';

/** Native button type. */
export type DmLoadingButtonType = 'button' | 'submit' | 'reset';
