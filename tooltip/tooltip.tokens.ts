import { InjectionToken, Provider } from '@angular/core';

import { DmTooltipPosition } from './tooltip.types';

/** Globally overridable defaults for `dmTooltip`. */
export interface DmTooltipDefaults {
  position: DmTooltipPosition;
  /** Delay before showing on hover, in ms (focus shows immediately). */
  showDelay: number;
  /** Delay before hiding after the pointer leaves, in ms. */
  hideDelay: number;
}

export const DM_TOOLTIP_FALLBACK_DEFAULTS: DmTooltipDefaults = {
  position: 'top',
  showDelay: 300,
  hideDelay: 100,
};

/** Injection token holding the defaults every `dmTooltip` starts from. */
export const TOOLTIP_DEFAULTS = new InjectionToken<DmTooltipDefaults>('TOOLTIP_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_TOOLTIP_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the tooltip defaults app- or route-wide. */
export function provideTooltipDefaults(defaults: Partial<DmTooltipDefaults>): Provider {
  return {
    provide: TOOLTIP_DEFAULTS,
    useValue: { ...DM_TOOLTIP_FALLBACK_DEFAULTS, ...defaults },
  };
}
