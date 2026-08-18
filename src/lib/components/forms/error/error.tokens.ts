import { InjectionToken, Provider } from '@angular/core';

import { DmErrorSize } from './error.types';

/** Globally overridable defaults for `dm-error`. */
export interface DmErrorDefaults {
  /** Text scale. */
  size: DmErrorSize;
}

export const DM_ERROR_FALLBACK_DEFAULTS: DmErrorDefaults = {
  size: 'sm',
};

/** Injection token holding the defaults every `dm-error` starts from. */
export const ERROR_DEFAULTS = new InjectionToken<DmErrorDefaults>('ERROR_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_ERROR_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the `dm-error` defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideErrorDefaults({ size: 'md' })]
 * ```
 */
export function provideErrorDefaults(defaults: Partial<DmErrorDefaults>): Provider {
  return {
    provide: ERROR_DEFAULTS,
    useValue: { ...DM_ERROR_FALLBACK_DEFAULTS, ...defaults },
  };
}
