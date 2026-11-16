import { InjectionToken, Provider } from '@angular/core';

import { DmSpinnerSize } from './spinner.types';

/** Globally overridable defaults for `dm-spinner`. */
export interface DmSpinnerDefaults {
  size: DmSpinnerSize;
  strokeWidth: number;
}

export const DM_SPINNER_FALLBACK_DEFAULTS: DmSpinnerDefaults = {
  size: 'md',
  strokeWidth: 2.5,
};

/** Injection token holding the defaults every `dm-spinner` starts from. */
export const SPINNER_DEFAULTS = new InjectionToken<DmSpinnerDefaults>('SPINNER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_SPINNER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the spinner defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideSpinnerDefaults({ strokeWidth: 3 })]
 * ```
 */
export function provideSpinnerDefaults(defaults: Partial<DmSpinnerDefaults>): Provider {
  return {
    provide: SPINNER_DEFAULTS,
    useValue: { ...DM_SPINNER_FALLBACK_DEFAULTS, ...defaults },
  };
}
