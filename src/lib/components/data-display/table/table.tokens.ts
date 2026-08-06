import { InjectionToken, Provider } from '@angular/core';

import { DmTableDensity, DmTableVariant } from './table.types';

/** Globally overridable defaults for `dm-table`. */
export interface DmTableDefaults {
  density: DmTableDensity;
  variant: DmTableVariant;
  hover: boolean;
  sticky: boolean;
  /** Default page size when pagination is enabled (`0` = show all rows). */
  pageSize: number;
  /** Options offered by the rows-per-page selector in the footer. */
  pageSizeOptions: number[];
}

export const DM_TABLE_FALLBACK_DEFAULTS: DmTableDefaults = {
  density: 'comfortable',
  variant: 'default',
  hover: true,
  sticky: false,
  pageSize: 0,
  pageSizeOptions: [10, 25, 50],
};

/** Injection token holding the defaults every `dm-table` starts from. */
export const TABLE_DEFAULTS = new InjectionToken<DmTableDefaults>('TABLE_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_TABLE_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the table defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideTableDefaults({ density: 'compact', hover: false })]
 * ```
 */
export function provideTableDefaults(defaults: Partial<DmTableDefaults>): Provider {
  return {
    provide: TABLE_DEFAULTS,
    useValue: { ...DM_TABLE_FALLBACK_DEFAULTS, ...defaults },
  };
}
