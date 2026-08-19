import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import {
  DmAutocompleteColor,
  DmAutocompleteRadius,
  DmAutocompleteVariant,
} from './autocomplete.types';

/** Globally overridable defaults for `dm-autocomplete`. */
export interface DmAutocompleteDefaults {
  color: DmAutocompleteColor;
  variant: DmAutocompleteVariant;
  size: DmSize;
  radius: DmAutocompleteRadius;
}

export const DM_AUTOCOMPLETE_FALLBACK_DEFAULTS: DmAutocompleteDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'md',
};

/** Injection token holding the defaults every `dm-autocomplete` starts from. */
export const AUTOCOMPLETE_DEFAULTS = new InjectionToken<DmAutocompleteDefaults>(
  'AUTOCOMPLETE_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_AUTOCOMPLETE_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the autocomplete defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideAutocompleteDefaults({ variant: 'bordered' })]
 * ```
 */
export function provideAutocompleteDefaults(defaults: Partial<DmAutocompleteDefaults>): Provider {
  return {
    provide: AUTOCOMPLETE_DEFAULTS,
    useValue: { ...DM_AUTOCOMPLETE_FALLBACK_DEFAULTS, ...defaults },
  };
}
