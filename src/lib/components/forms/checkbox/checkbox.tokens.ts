import { InjectionToken, Provider } from '@angular/core';

import { DmCheckboxSize } from './checkbox.types';

/** Globally overridable defaults for `dm-checkbox`. */
export interface DmCheckboxDefaults {
  size: DmCheckboxSize;
}

export const DM_CHECKBOX_FALLBACK_DEFAULTS: DmCheckboxDefaults = {
  size: 'md',
};

/** Injection token holding the defaults every `dm-checkbox` starts from. */
export const CHECKBOX_DEFAULTS = new InjectionToken<DmCheckboxDefaults>('CHECKBOX_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_CHECKBOX_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the checkbox defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideCheckboxDefaults({ size: 'sm' })]
 * ```
 */
export function provideCheckboxDefaults(defaults: Partial<DmCheckboxDefaults>): Provider {
  return {
    provide: CHECKBOX_DEFAULTS,
    useValue: { ...DM_CHECKBOX_FALLBACK_DEFAULTS, ...defaults },
  };
}
