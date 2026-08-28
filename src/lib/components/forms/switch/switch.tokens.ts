import { InjectionToken, Provider } from '@angular/core';

import { DmSwitchColor, DmSwitchSize } from './switch.types';

/** Globally overridable defaults for `dm-switch`. */
export interface DmSwitchDefaults {
  color: DmSwitchColor;
  size: DmSwitchSize;
}

export const DM_SWITCH_FALLBACK_DEFAULTS: DmSwitchDefaults = {
  color: 'primary',
  size: 'md',
};

/** Injection token holding the defaults every `dm-switch` starts from. */
export const SWITCH_DEFAULTS = new InjectionToken<DmSwitchDefaults>('SWITCH_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_SWITCH_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the switch defaults app- or route-wide. */
export function provideSwitchDefaults(defaults: Partial<DmSwitchDefaults>): Provider {
  return {
    provide: SWITCH_DEFAULTS,
    useValue: { ...DM_SWITCH_FALLBACK_DEFAULTS, ...defaults },
  };
}
