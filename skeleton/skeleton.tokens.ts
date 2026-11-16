import { InjectionToken, Provider } from '@angular/core';

import { DmSkeletonAnimation, DmSkeletonRounded, DmSkeletonVariant } from './skeleton.types';

/** Globally overridable defaults for `dm-skeleton`. */
export interface DmSkeletonDefaults {
  variant: DmSkeletonVariant;
  animation: DmSkeletonAnimation;
  rounded: DmSkeletonRounded;
  count: number;
}

export const DM_SKELETON_FALLBACK_DEFAULTS: DmSkeletonDefaults = {
  variant: 'text',
  animation: 'pulse',
  rounded: 'md',
  count: 1,
};

/** Injection token holding the defaults every `dm-skeleton` starts from. */
export const SKELETON_DEFAULTS = new InjectionToken<DmSkeletonDefaults>('SKELETON_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_SKELETON_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the skeleton defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideSkeletonDefaults({ animation: 'wave' })]
 * ```
 */
export function provideSkeletonDefaults(defaults: Partial<DmSkeletonDefaults>): Provider {
  return {
    provide: SKELETON_DEFAULTS,
    useValue: { ...DM_SKELETON_FALLBACK_DEFAULTS, ...defaults },
  };
}
