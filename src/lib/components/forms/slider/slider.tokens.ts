import { InjectionToken, Provider } from '@angular/core';

import { DmSliderColor, DmSliderSize } from './slider.types';

/** Globally overridable defaults for `dm-slider`. */
export interface DmSliderDefaults {
  size: DmSliderSize;
  color: DmSliderColor;
  showValueLabel: boolean;
}

export const DM_SLIDER_FALLBACK_DEFAULTS: DmSliderDefaults = {
  size: 'md',
  color: 'primary',
  showValueLabel: false,
};

/** Injection token holding the defaults every `dm-slider` starts from. */
export const SLIDER_DEFAULTS = new InjectionToken<DmSliderDefaults>('SLIDER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_SLIDER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the slider defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideSliderDefaults({ color: 'secondary', showValueLabel: true })]
 * ```
 */
export function provideSliderDefaults(defaults: Partial<DmSliderDefaults>): Provider {
  return {
    provide: SLIDER_DEFAULTS,
    useValue: { ...DM_SLIDER_FALLBACK_DEFAULTS, ...defaults },
  };
}
