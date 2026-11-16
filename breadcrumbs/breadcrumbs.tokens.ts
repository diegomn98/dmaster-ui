import { InjectionToken, Provider } from '@angular/core';

import { DmBreadcrumbsSize } from './breadcrumbs.types';

/** Globally overridable defaults for `dm-breadcrumbs`. */
export interface DmBreadcrumbsDefaults {
  /** Accessible label announced for the `<nav>` landmark. */
  ariaLabel: string;
  /** Size scale. */
  size: DmBreadcrumbsSize;
}

export const DM_BREADCRUMBS_FALLBACK_DEFAULTS: DmBreadcrumbsDefaults = {
  ariaLabel: 'Breadcrumbs',
  size: 'md',
};

/** Injection token holding the defaults every `dm-breadcrumbs` starts from. */
export const BREADCRUMBS_DEFAULTS = new InjectionToken<DmBreadcrumbsDefaults>(
  'BREADCRUMBS_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_BREADCRUMBS_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the breadcrumbs defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideBreadcrumbsDefaults({ ariaLabel: 'You are here', size: 'lg' })]
 * ```
 */
export function provideBreadcrumbsDefaults(defaults: Partial<DmBreadcrumbsDefaults>): Provider {
  return {
    provide: BREADCRUMBS_DEFAULTS,
    useValue: { ...DM_BREADCRUMBS_FALLBACK_DEFAULTS, ...defaults },
  };
}
