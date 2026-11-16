import { InjectionToken, Provider } from '@angular/core';

import { DmButtonGroupOrientation } from './button-group.types';

/** Globally overridable defaults for `dm-button-group`. */
export interface DmButtonGroupDefaults {
  orientation: DmButtonGroupOrientation;
}

export const DM_BUTTON_GROUP_FALLBACK_DEFAULTS: DmButtonGroupDefaults = {
  orientation: 'horizontal',
};

/** Injection token holding the defaults every `dm-button-group` starts from. */
export const BUTTON_GROUP_DEFAULTS = new InjectionToken<DmButtonGroupDefaults>(
  'BUTTON_GROUP_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_BUTTON_GROUP_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the button-group defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideButtonGroupDefaults({ orientation: 'vertical' })]
 * ```
 */
export function provideButtonGroupDefaults(defaults: Partial<DmButtonGroupDefaults>): Provider {
  return {
    provide: BUTTON_GROUP_DEFAULTS,
    useValue: { ...DM_BUTTON_GROUP_FALLBACK_DEFAULTS, ...defaults },
  };
}
