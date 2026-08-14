import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmPaginationColor } from './pagination.types';

/** Globally overridable defaults for `dm-pagination`. */
export interface DmPaginationDefaults {
  size: DmSize;
  color: DmPaginationColor;
  /** Show the previous/next chevron buttons. */
  showControls: boolean;
  /** Pages shown on each side of the current page. */
  siblingCount: number;
  /** Pages always shown at the start and at the end. */
  boundaryCount: number;
  /** Accessible name of the `<nav>` landmark. Override it per app language. */
  ariaLabel: string;
  /** ARIA label of the previous-page button. */
  prevLabel: string;
  /** ARIA label of the next-page button. */
  nextLabel: string;
  /** Builds the ARIA label of each page button. */
  pageAriaLabel: (page: number) => string;
}

export const DM_PAGINATION_FALLBACK_DEFAULTS: DmPaginationDefaults = {
  size: 'md',
  color: 'primary',
  showControls: true,
  siblingCount: 1,
  boundaryCount: 1,
  ariaLabel: 'Pagination',
  prevLabel: 'Previous page',
  nextLabel: 'Next page',
  pageAriaLabel: (page: number) => `Page ${page}`,
};

/** Injection token holding the defaults every `dm-pagination` starts from. */
export const PAGINATION_DEFAULTS = new InjectionToken<DmPaginationDefaults>('PAGINATION_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_PAGINATION_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the pagination defaults app- or route-wide —
 * including every accessible label, so they can be localized in one place.
 *
 * ```ts
 * providers: [
 *   providePaginationDefaults({
 *     ariaLabel: 'Paginación',
 *     prevLabel: 'Página anterior',
 *     nextLabel: 'Página siguiente',
 *     pageAriaLabel: (page) => `Página ${page}`,
 *   }),
 * ]
 * ```
 */
export function providePaginationDefaults(defaults: Partial<DmPaginationDefaults>): Provider {
  return {
    provide: PAGINATION_DEFAULTS,
    useValue: { ...DM_PAGINATION_FALLBACK_DEFAULTS, ...defaults },
  };
}
