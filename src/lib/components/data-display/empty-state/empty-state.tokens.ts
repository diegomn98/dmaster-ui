import { InjectionToken, Provider } from '@angular/core';

import { DmEmptyStateSize } from './empty-state.types';

/** Globally overridable defaults for `dm-empty-state`. */
export interface DmEmptyStateDefaults {
  size: DmEmptyStateSize;
}

export const DM_EMPTY_STATE_FALLBACK_DEFAULTS: DmEmptyStateDefaults = {
  size: 'md',
};

/** Injection token holding the defaults every `dm-empty-state` starts from. */
export const EMPTY_STATE_DEFAULTS = new InjectionToken<DmEmptyStateDefaults>(
  'EMPTY_STATE_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_EMPTY_STATE_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the empty-state defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideEmptyStateDefaults({ size: 'lg' })]
 * ```
 */
export function provideEmptyStateDefaults(defaults: Partial<DmEmptyStateDefaults>): Provider {
  return {
    provide: EMPTY_STATE_DEFAULTS,
    useValue: { ...DM_EMPTY_STATE_FALLBACK_DEFAULTS, ...defaults },
  };
}
