import { InjectionToken, Provider } from '@angular/core';

import { DmBadgeColor, DmBadgeRadius, DmBadgeSize, DmBadgeVariant } from './badge.types';

/** Globally overridable defaults for `dm-badge`. */
export interface DmBadgeDefaults {
  color: DmBadgeColor;
  variant: DmBadgeVariant;
  size: DmBadgeSize;
  radius: DmBadgeRadius;
}

export const DM_BADGE_FALLBACK_DEFAULTS: DmBadgeDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'full',
};

/** Injection token holding the defaults every `dm-badge` starts from. */
export const BADGE_DEFAULTS = new InjectionToken<DmBadgeDefaults>('BADGE_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_BADGE_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the badge defaults app- or route-wide. */
export function provideBadgeDefaults(defaults: Partial<DmBadgeDefaults>): Provider {
  return {
    provide: BADGE_DEFAULTS,
    useValue: { ...DM_BADGE_FALLBACK_DEFAULTS, ...defaults },
  };
}
