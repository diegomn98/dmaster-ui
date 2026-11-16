import { InjectionToken, Provider } from '@angular/core';

import { DmProgressColor, DmProgressSize } from './progress.types';

/** Globally overridable defaults for `dm-progress`. */
export interface DmProgressDefaults {
  color: DmProgressColor;
  size: DmProgressSize;
}

export const DM_PROGRESS_FALLBACK_DEFAULTS: DmProgressDefaults = {
  color: 'primary',
  size: 'md',
};

/** Injection token holding the defaults every `dm-progress` starts from. */
export const PROGRESS_DEFAULTS = new InjectionToken<DmProgressDefaults>('PROGRESS_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_PROGRESS_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the progress defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideProgressDefaults({ color: 'success', size: 'lg' })]
 * ```
 */
export function provideProgressDefaults(defaults: Partial<DmProgressDefaults>): Provider {
  return {
    provide: PROGRESS_DEFAULTS,
    useValue: { ...DM_PROGRESS_FALLBACK_DEFAULTS, ...defaults },
  };
}
