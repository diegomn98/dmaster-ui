import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmSelectColor, DmSelectRadius, DmSelectVariant } from './select.types';

/** Globally overridable defaults for `dm-select`. */
export interface DmSelectDefaults {
  color: DmSelectColor;
  variant: DmSelectVariant;
  size: DmSize;
  radius: DmSelectRadius;
}

export const DM_SELECT_FALLBACK_DEFAULTS: DmSelectDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'md',
};

/** Injection token holding the defaults every `dm-select` starts from. */
export const SELECT_DEFAULTS = new InjectionToken<DmSelectDefaults>('SELECT_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_SELECT_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the select defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideSelectDefaults({ variant: 'bordered' })]
 * ```
 */
export function provideSelectDefaults(defaults: Partial<DmSelectDefaults>): Provider {
  return {
    provide: SELECT_DEFAULTS,
    useValue: { ...DM_SELECT_FALLBACK_DEFAULTS, ...defaults },
  };
}
