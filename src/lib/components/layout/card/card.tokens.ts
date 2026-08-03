import { InjectionToken, Provider } from '@angular/core';

import { DmCardAppearance, DmCardPadding } from './card.types';

/** Globally overridable defaults for `dm-card`. */
export interface DmCardDefaults {
  appearance: DmCardAppearance;
  padding: DmCardPadding;
}

export const DM_CARD_FALLBACK_DEFAULTS: DmCardDefaults = {
  appearance: 'elevated',
  padding: 'md',
};

/** Injection token holding the defaults every `dm-card` starts from. */
export const CARD_DEFAULTS = new InjectionToken<DmCardDefaults>('CARD_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_CARD_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the card defaults app- or route-wide. */
export function provideCardDefaults(defaults: Partial<DmCardDefaults>): Provider {
  return {
    provide: CARD_DEFAULTS,
    useValue: { ...DM_CARD_FALLBACK_DEFAULTS, ...defaults },
  };
}
