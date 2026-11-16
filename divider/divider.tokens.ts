import { InjectionToken, Provider } from '@angular/core';

import { DmDividerLabelPlacement, DmDividerLineStyle, DmDividerOrientation } from './divider.types';

/** Globally overridable defaults for `dm-divider`. */
export interface DmDividerDefaults {
  orientation: DmDividerOrientation;
  labelPlacement: DmDividerLabelPlacement;
  lineStyle: DmDividerLineStyle;
}

export const DM_DIVIDER_FALLBACK_DEFAULTS: DmDividerDefaults = {
  orientation: 'horizontal',
  labelPlacement: 'center',
  lineStyle: 'solid',
};

/** Injection token holding the defaults every `dm-divider` starts from. */
export const DIVIDER_DEFAULTS = new InjectionToken<DmDividerDefaults>('DIVIDER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_DIVIDER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the divider defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideDividerDefaults({ labelPlacement: 'start' })]
 * ```
 */
export function provideDividerDefaults(defaults: Partial<DmDividerDefaults>): Provider {
  return {
    provide: DIVIDER_DEFAULTS,
    useValue: { ...DM_DIVIDER_FALLBACK_DEFAULTS, ...defaults },
  };
}
