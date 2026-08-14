import { InjectionToken, Provider } from '@angular/core';

import { DmMenuPlacement } from './menu.types';

/** Globally overridable defaults for `dm-menu`. */
export interface DmMenuDefaults {
  /** Preferred placement of the panel. */
  placement: DmMenuPlacement;
  /** Close the menu when an item is activated. */
  closeOnSelect: boolean;
}

export const DM_MENU_FALLBACK_DEFAULTS: DmMenuDefaults = {
  placement: 'bottom-start',
  closeOnSelect: true,
};

/** Injection token holding the defaults every `dm-menu` starts from. */
export const MENU_DEFAULTS = new InjectionToken<DmMenuDefaults>('MENU_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_MENU_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the menu defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideMenuDefaults({ placement: 'bottom-end', closeOnSelect: false })]
 * ```
 */
export function provideMenuDefaults(defaults: Partial<DmMenuDefaults>): Provider {
  return {
    provide: MENU_DEFAULTS,
    useValue: { ...DM_MENU_FALLBACK_DEFAULTS, ...defaults },
  };
}
