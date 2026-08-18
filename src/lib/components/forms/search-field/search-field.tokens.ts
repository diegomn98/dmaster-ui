import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import {
  DmSearchFieldColor,
  DmSearchFieldRadius,
  DmSearchFieldVariant,
} from './search-field.types';

/** Globally overridable defaults for `dm-search-field`. */
export interface DmSearchFieldDefaults {
  color: DmSearchFieldColor;
  variant: DmSearchFieldVariant;
  size: DmSize;
  radius: DmSearchFieldRadius;
}

export const DM_SEARCH_FIELD_FALLBACK_DEFAULTS: DmSearchFieldDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  // `md`, like every other field: input, select and search must read as one
  // family. The pill look stays one prop away (radius="full").
  radius: 'md',
};

/** Injection token holding the defaults every `dm-search-field` starts from. */
export const SEARCH_FIELD_DEFAULTS = new InjectionToken<DmSearchFieldDefaults>(
  'SEARCH_FIELD_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_SEARCH_FIELD_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the search-field defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideSearchFieldDefaults({ variant: 'bordered', radius: 'md' })]
 * ```
 */
export function provideSearchFieldDefaults(defaults: Partial<DmSearchFieldDefaults>): Provider {
  return {
    provide: SEARCH_FIELD_DEFAULTS,
    useValue: { ...DM_SEARCH_FIELD_FALLBACK_DEFAULTS, ...defaults },
  };
}
