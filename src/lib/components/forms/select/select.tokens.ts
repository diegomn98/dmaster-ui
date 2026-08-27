import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import {
  DmSelectColor,
  DmSelectLoadMoreMode,
  DmSelectRadius,
  DmSelectVariant,
} from './select.types';

/** Globally overridable defaults for `dm-select`. */
export interface DmSelectDefaults {
  color: DmSelectColor;
  variant: DmSelectVariant;
  size: DmSize;
  radius: DmSelectRadius;
  /** Async mode: how pages past the first are loaded. */
  loadMoreMode: DmSelectLoadMoreMode;
  /** Async mode: milliseconds of quiet input before the search reloads. */
  searchDebounceMs: number;
  /** Async mode: number of items to request per page. */
  pageSize: number;
}

export const DM_SELECT_FALLBACK_DEFAULTS: DmSelectDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'md',
  loadMoreMode: 'infinite',
  searchDebounceMs: 250,
  pageSize: 20,
};

/** Injection token holding the defaults every `dm-select` starts from. */
export const SELECT_DEFAULTS = new InjectionToken<DmSelectDefaults>('SELECT_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_SELECT_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the select defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideSelectDefaults({ variant: 'bordered', pageSize: 10 })]
 * ```
 */
export function provideSelectDefaults(defaults: Partial<DmSelectDefaults>): Provider {
  return {
    provide: SELECT_DEFAULTS,
    useValue: { ...DM_SELECT_FALLBACK_DEFAULTS, ...defaults },
  };
}
