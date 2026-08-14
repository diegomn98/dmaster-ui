import { InjectionToken, Provider } from '@angular/core';

import { DmPopoverPlacement } from './popover.types';

/** Globally overridable defaults for `dm-popover`. */
export interface DmPopoverDefaults {
  /** Preferred placement; flips to the opposite side when there is no room. */
  placement: DmPopoverPlacement;
  /** Whether the little arrow pointing at the trigger is rendered. */
  showArrow: boolean;
  /** Gap between the trigger and the panel, in pixels. */
  offset: number;
}

export const DM_POPOVER_FALLBACK_DEFAULTS: DmPopoverDefaults = {
  placement: 'bottom',
  showArrow: true,
  offset: 8,
};

/** Injection token holding the defaults every `dm-popover` starts from. */
export const POPOVER_DEFAULTS = new InjectionToken<DmPopoverDefaults>('POPOVER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_POPOVER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the popover defaults app- or route-wide.
 *
 * ```ts
 * providers: [providePopoverDefaults({ placement: 'top', showArrow: false })]
 * ```
 */
export function providePopoverDefaults(defaults: Partial<DmPopoverDefaults>): Provider {
  return {
    provide: POPOVER_DEFAULTS,
    useValue: { ...DM_POPOVER_FALLBACK_DEFAULTS, ...defaults },
  };
}
