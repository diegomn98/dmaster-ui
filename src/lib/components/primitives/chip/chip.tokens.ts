import { InjectionToken, Provider } from '@angular/core';

import { DmChipColor, DmChipRadius, DmChipSize, DmChipVariant } from './chip.types';

/** Globally overridable defaults for `dm-chip`. */
export interface DmChipDefaults {
  color: DmChipColor;
  variant: DmChipVariant;
  size: DmChipSize;
  radius: DmChipRadius;
}

export const DM_CHIP_FALLBACK_DEFAULTS: DmChipDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'full',
};

/** Injection token holding the defaults every `dm-chip` starts from. */
export const CHIP_DEFAULTS = new InjectionToken<DmChipDefaults>('CHIP_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_CHIP_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the chip defaults app- or route-wide. */
export function provideChipDefaults(defaults: Partial<DmChipDefaults>): Provider {
  return {
    provide: CHIP_DEFAULTS,
    useValue: { ...DM_CHIP_FALLBACK_DEFAULTS, ...defaults },
  };
}
