import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import {
  DmPaginatedSelectColor,
  DmPaginatedSelectLoadMoreMode,
  DmPaginatedSelectRadius,
  DmPaginatedSelectVariant,
} from './paginated-select.types';

/** Globally overridable defaults for `dm-paginated-select`. */
export interface DmPaginatedSelectDefaults {
  color: DmPaginatedSelectColor;
  variant: DmPaginatedSelectVariant;
  size: DmSize;
  radius: DmPaginatedSelectRadius;
  loadMoreMode: DmPaginatedSelectLoadMoreMode;
  /** Milliseconds of quiet input before the search triggers a reload. */
  searchDebounceMs: number;
  /** Number of items to request per page. */
  pageSize: number;
}

export const DM_PAGINATED_SELECT_FALLBACK_DEFAULTS: DmPaginatedSelectDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'md',
  loadMoreMode: 'infinite',
  searchDebounceMs: 250,
  pageSize: 20,
};

/** Injection token holding the defaults every `dm-paginated-select` starts from. */
export const PAGINATED_SELECT_DEFAULTS = new InjectionToken<DmPaginatedSelectDefaults>(
  'PAGINATED_SELECT_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_PAGINATED_SELECT_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the paginated-select defaults app-wide.
 *
 * ```ts
 * providers: [providePaginatedSelectDefaults({ variant: 'bordered', pageSize: 10 })]
 * ```
 */
export function providePaginatedSelectDefaults(
  defaults: Partial<DmPaginatedSelectDefaults>,
): Provider {
  return {
    provide: PAGINATED_SELECT_DEFAULTS,
    useValue: { ...DM_PAGINATED_SELECT_FALLBACK_DEFAULTS, ...defaults },
  };
}
