import { InjectionToken, Provider } from '@angular/core';

import {
  DmTimelineAlign,
  DmTimelineColor,
  DmTimelineItemVariant,
  DmTimelineOrientation,
  DmTimelineSize,
} from './timeline.types';

/** Globally overridable defaults for `dm-timeline` / `dm-timeline-item`. */
export interface DmTimelineDefaults {
  orientation: DmTimelineOrientation;
  align: DmTimelineAlign;
  size: DmTimelineSize;
  color: DmTimelineColor;
  /** Default marker style of every `dm-timeline-item`. */
  variant: DmTimelineItemVariant;
}

export const DM_TIMELINE_FALLBACK_DEFAULTS: DmTimelineDefaults = {
  orientation: 'vertical',
  align: 'start',
  size: 'md',
  color: 'primary',
  variant: 'solid',
};

/** Injection token holding the defaults every `dm-timeline` starts from. */
export const TIMELINE_DEFAULTS = new InjectionToken<DmTimelineDefaults>('TIMELINE_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_TIMELINE_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the timeline defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideTimelineDefaults({ color: 'success', variant: 'outlined' })]
 * ```
 */
export function provideTimelineDefaults(defaults: Partial<DmTimelineDefaults>): Provider {
  return {
    provide: TIMELINE_DEFAULTS,
    useValue: { ...DM_TIMELINE_FALLBACK_DEFAULTS, ...defaults },
  };
}
