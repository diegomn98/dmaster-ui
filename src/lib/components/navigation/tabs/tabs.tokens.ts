import { InjectionToken, Provider } from '@angular/core';

import {
  DmTabsColor,
  DmTabsPlacement,
  DmTabsRadius,
  DmTabsSize,
  DmTabsVariant,
} from './tabs.types';

/** Globally overridable defaults for `dm-tabs`. */
export interface DmTabsDefaults {
  color: DmTabsColor;
  variant: DmTabsVariant;
  size: DmTabsSize;
  radius: DmTabsRadius;
  placement: DmTabsPlacement;
  /** Stretch tabs to share the full width equally. */
  fullWidth: boolean;
  /** Draw a separator rule under (or beside) the tablist. */
  divider: boolean;
}

export const DM_TABS_FALLBACK_DEFAULTS: DmTabsDefaults = {
  color: 'primary',
  variant: 'underlined',
  size: 'md',
  radius: 'md',
  placement: 'top',
  fullWidth: true,
  divider: true,
};

/** Injection token holding the defaults every `dm-tabs` starts from. */
export const TABS_DEFAULTS = new InjectionToken<DmTabsDefaults>('TABS_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_TABS_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the tabs defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideTabsDefaults({ variant: 'underlined' })]
 * ```
 */
export function provideTabsDefaults(defaults: Partial<DmTabsDefaults>): Provider {
  return {
    provide: TABS_DEFAULTS,
    useValue: { ...DM_TABS_FALLBACK_DEFAULTS, ...defaults },
  };
}
