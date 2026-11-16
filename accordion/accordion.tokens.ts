import { InjectionToken, Provider } from '@angular/core';

import { DmAccordionSelectionMode, DmAccordionVariant } from './accordion.types';

/** Globally overridable defaults for `dm-accordion`. */
export interface DmAccordionDefaults {
  variant: DmAccordionVariant;
  selectionMode: DmAccordionSelectionMode;
}

export const DM_ACCORDION_FALLBACK_DEFAULTS: DmAccordionDefaults = {
  variant: 'light',
  selectionMode: 'single',
};

/** Injection token holding the defaults every `dm-accordion` starts from. */
export const ACCORDION_DEFAULTS = new InjectionToken<DmAccordionDefaults>('ACCORDION_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_ACCORDION_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the accordion defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideAccordionDefaults({ variant: 'splitted', selectionMode: 'multiple' })]
 * ```
 */
export function provideAccordionDefaults(defaults: Partial<DmAccordionDefaults>): Provider {
  return {
    provide: ACCORDION_DEFAULTS,
    useValue: { ...DM_ACCORDION_FALLBACK_DEFAULTS, ...defaults },
  };
}
