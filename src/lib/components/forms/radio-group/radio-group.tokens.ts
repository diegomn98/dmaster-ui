import { InjectionToken, Provider } from '@angular/core';

import { DmRadioColor, DmRadioOrientation, DmRadioSize } from './radio-group.types';

/** Globally overridable defaults for `dm-radio-group` and its `dm-radio` items. */
export interface DmRadioDefaults {
  color: DmRadioColor;
  size: DmRadioSize;
  orientation: DmRadioOrientation;
}

export const DM_RADIO_FALLBACK_DEFAULTS: DmRadioDefaults = {
  color: 'primary',
  size: 'md',
  orientation: 'vertical',
};

/** Injection token holding the defaults every `dm-radio-group` starts from. */
export const RADIO_DEFAULTS = new InjectionToken<DmRadioDefaults>('RADIO_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_RADIO_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the radio defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideRadioDefaults({ color: 'secondary', size: 'lg' })]
 * ```
 */
export function provideRadioDefaults(defaults: Partial<DmRadioDefaults>): Provider {
  return {
    provide: RADIO_DEFAULTS,
    useValue: { ...DM_RADIO_FALLBACK_DEFAULTS, ...defaults },
  };
}
