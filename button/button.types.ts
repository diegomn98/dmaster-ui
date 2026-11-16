import { InjectionToken, Signal } from '@angular/core';

import type { DmSize } from '@dmaster/ui/core';

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

/**
 * Group context read by every `dm-button` projected inside a
 * `dm-button-group`: appearance set on the group cascades to the buttons
 * (each button's own inputs still win). `undefined` means "not set here".
 */
export interface DmButtonGroupContext {
  readonly color: Signal<DmButtonColor | undefined>;
  readonly variant: Signal<DmButtonVariant | undefined>;
  readonly size: Signal<DmSize | undefined>;
  readonly radius: Signal<DmButtonRadius | undefined>;
  readonly isDisabled: Signal<boolean>;
}

/**
 * Token linking `dm-button` to its optional parent group. It lives in the
 * button entry point (`@dmaster/ui/button`), not in `@dmaster/ui/button-group`:
 * the group depends on the button, never the other way round, so the two
 * entry points don't form a cycle and the button can inject its group without
 * importing the group component.
 */
export const DM_BUTTON_GROUP = new InjectionToken<DmButtonGroupContext>('DM_BUTTON_GROUP');
