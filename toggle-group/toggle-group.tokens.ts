import { InjectionToken, Provider } from '@angular/core';

import {
  DmToggleGroupColor,
  DmToggleGroupOrientation,
  DmToggleGroupSize,
} from './toggle-group.types';

/** Globally overridable defaults for `dm-toggle-group` and its `dm-toggle` items. */
export interface DmToggleGroupDefaults {
  color: DmToggleGroupColor;
  size: DmToggleGroupSize;
  orientation: DmToggleGroupOrientation;
}

export const DM_TOGGLE_GROUP_FALLBACK_DEFAULTS: DmToggleGroupDefaults = {
  color: 'default',
  size: 'md',
  orientation: 'horizontal',
};

/** Injection token holding the defaults every `dm-toggle-group` starts from. */
export const TOGGLE_GROUP_DEFAULTS = new InjectionToken<DmToggleGroupDefaults>(
  'TOGGLE_GROUP_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_TOGGLE_GROUP_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the toggle-group defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideToggleGroupDefaults({ color: 'primary', size: 'lg' })]
 * ```
 */
export function provideToggleGroupDefaults(defaults: Partial<DmToggleGroupDefaults>): Provider {
  return {
    provide: TOGGLE_GROUP_DEFAULTS,
    useValue: { ...DM_TOGGLE_GROUP_FALLBACK_DEFAULTS, ...defaults },
  };
}
