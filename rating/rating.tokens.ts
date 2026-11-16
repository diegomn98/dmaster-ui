import { InjectionToken, Provider } from '@angular/core';

import { DmRatingColor, DmRatingSize } from './rating.types';

/** Globally overridable defaults for `dm-rating`. */
export interface DmRatingDefaults {
  max: number;
  size: DmRatingSize;
  color: DmRatingColor;
  allowHalf: boolean;
}

export const DM_RATING_FALLBACK_DEFAULTS: DmRatingDefaults = {
  max: 5,
  size: 'md',
  color: 'warning',
  allowHalf: false,
};

/** Injection token holding the defaults every `dm-rating` starts from. */
export const RATING_DEFAULTS = new InjectionToken<DmRatingDefaults>('RATING_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_RATING_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the rating defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideRatingDefaults({ max: 10, color: 'primary', allowHalf: true })]
 * ```
 */
export function provideRatingDefaults(defaults: Partial<DmRatingDefaults>): Provider {
  return {
    provide: RATING_DEFAULTS,
    useValue: { ...DM_RATING_FALLBACK_DEFAULTS, ...defaults },
  };
}
