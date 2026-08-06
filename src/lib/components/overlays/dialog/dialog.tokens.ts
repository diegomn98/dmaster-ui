import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';

/** Globally overridable defaults for `DmDialogService.open()`. */
export interface DmDialogDefaults {
  /** Panel width. `sm` 22rem · `md` 30rem · `lg` 42rem. */
  size: DmSize;
  /** Prevents closing via backdrop click / Escape. */
  disableClose: boolean;
}

export const DM_DIALOG_FALLBACK_DEFAULTS: DmDialogDefaults = {
  size: 'md',
  disableClose: false,
};

/** Injection token holding the defaults every `DmDialogService.open()` call starts from. */
export const DIALOG_DEFAULTS = new InjectionToken<DmDialogDefaults>('DIALOG_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_DIALOG_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the dialog defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideDialogDefaults({ size: 'lg', disableClose: true })]
 * ```
 */
export function provideDialogDefaults(defaults: Partial<DmDialogDefaults>): Provider {
  return {
    provide: DIALOG_DEFAULTS,
    useValue: { ...DM_DIALOG_FALLBACK_DEFAULTS, ...defaults },
  };
}
