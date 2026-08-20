import { InjectionToken, Signal } from '@angular/core';

import type { DmSize } from '../../../core/types/common.types';
import type { DmButtonColor, DmButtonRadius, DmButtonVariant } from '../button/button.types';

/** Layout direction of a button group. */
export type DmButtonGroupOrientation = 'horizontal' | 'vertical';

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
 * Token linking `dm-button` to its optional parent group. Lives in the types
 * file (not the component) so the button can inject it without importing the
 * group component — no circular reference.
 */
export const DM_BUTTON_GROUP = new InjectionToken<DmButtonGroupContext>('DM_BUTTON_GROUP');
