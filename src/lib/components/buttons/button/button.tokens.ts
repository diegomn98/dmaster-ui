import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmButtonColor, DmButtonRadius, DmButtonVariant } from './button.types';

/** Globally overridable defaults for `dm-button`. */
export interface DmButtonDefaults {
  color: DmButtonColor;
  variant: DmButtonVariant;
  size: DmSize;
  radius: DmButtonRadius;
}

export const DM_BUTTON_FALLBACK_DEFAULTS: DmButtonDefaults = {
  color: 'primary',
  variant: 'solid',
  size: 'md',
  // Pill by default — the library's signature look.
  radius: 'full',
};

/** Injection token holding the defaults every `dm-button` starts from. */
export const BUTTON_DEFAULTS = new InjectionToken<DmButtonDefaults>('BUTTON_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_BUTTON_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the button defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideButtonDefaults({ variant: 'flat' })]
 * ```
 */
export function provideButtonDefaults(defaults: Partial<DmButtonDefaults>): Provider {
  return {
    provide: BUTTON_DEFAULTS,
    useValue: { ...DM_BUTTON_FALLBACK_DEFAULTS, ...defaults },
  };
}
