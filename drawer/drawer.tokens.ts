import { InjectionToken, Provider } from '@angular/core';

import { DmDrawerPlacement, DmDrawerSize } from './drawer.types';

/** Globally overridable defaults for `DmDrawerService.open()`. */
export interface DmDrawerDefaults {
  /** Edge the panel slides in from. */
  placement: DmDrawerPlacement;
  /** Panel size along its axis. */
  size: DmDrawerSize;
  /** Renders the dimming backdrop behind the panel. */
  backdrop: boolean;
  /** Prevents closing via backdrop click / Escape. */
  disableClose: boolean;
}

export const DM_DRAWER_FALLBACK_DEFAULTS: DmDrawerDefaults = {
  placement: 'right',
  size: 'md',
  backdrop: true,
  disableClose: false,
};

/** Injection token holding the defaults every `DmDrawerService.open()` call starts from. */
export const DRAWER_DEFAULTS = new InjectionToken<DmDrawerDefaults>('DRAWER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_DRAWER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the drawer defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideDrawerDefaults({ placement: 'left', size: 'lg' })]
 * ```
 */
export function provideDrawerDefaults(defaults: Partial<DmDrawerDefaults>): Provider {
  return {
    provide: DRAWER_DEFAULTS,
    useValue: { ...DM_DRAWER_FALLBACK_DEFAULTS, ...defaults },
  };
}
