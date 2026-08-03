import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmLoadingButtonVariant } from './loading-button.types';

/** Globally overridable defaults for `dm-loading-button`. */
export interface DmLoadingButtonDefaults {
  variant: DmLoadingButtonVariant;
  size: DmSize;
}

export const DM_LOADING_BUTTON_FALLBACK_DEFAULTS: DmLoadingButtonDefaults = {
  variant: 'primary',
  size: 'md',
};

/** Injection token holding the defaults every `dm-loading-button` starts from. */
export const LOADING_BUTTON_DEFAULTS = new InjectionToken<DmLoadingButtonDefaults>(
  'LOADING_BUTTON_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_LOADING_BUTTON_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the loading-button defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideLoadingButtonDefaults({ variant: 'outline' })]
 * ```
 */
export function provideLoadingButtonDefaults(defaults: Partial<DmLoadingButtonDefaults>): Provider {
  return {
    provide: LOADING_BUTTON_DEFAULTS,
    useValue: { ...DM_LOADING_BUTTON_FALLBACK_DEFAULTS, ...defaults },
  };
}
