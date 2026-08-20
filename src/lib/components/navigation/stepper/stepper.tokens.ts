import { InjectionToken, Provider } from '@angular/core';

import { DmStepperColor, DmStepperOrientation, DmStepperSize } from './stepper.types';

/** Globally overridable defaults for `dm-stepper`. */
export interface DmStepperDefaults {
  orientation: DmStepperOrientation;
  color: DmStepperColor;
  size: DmStepperSize;
}

export const DM_STEPPER_FALLBACK_DEFAULTS: DmStepperDefaults = {
  orientation: 'horizontal',
  color: 'primary',
  size: 'md',
};

/** Injection token holding the defaults every `dm-stepper` starts from. */
export const STEPPER_DEFAULTS = new InjectionToken<DmStepperDefaults>('STEPPER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_STEPPER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the stepper defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideStepperDefaults({ orientation: 'vertical', color: 'success' })]
 * ```
 */
export function provideStepperDefaults(defaults: Partial<DmStepperDefaults>): Provider {
  return {
    provide: STEPPER_DEFAULTS,
    useValue: { ...DM_STEPPER_FALLBACK_DEFAULTS, ...defaults },
  };
}
