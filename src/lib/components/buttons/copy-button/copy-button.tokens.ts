import { InjectionToken, Provider } from '@angular/core';

import type { DmSize } from '../../../core/types/common.types';
import type {
  DmCopyButtonColor,
  DmCopyButtonRadius,
  DmCopyButtonVariant,
} from './copy-button.types';

/** Globally overridable defaults for `dm-copy-button`. */
export interface DmCopyButtonDefaults {
  color: DmCopyButtonColor;
  variant: DmCopyButtonVariant;
  radius: DmCopyButtonRadius;
  size: DmSize;
  /** How long the "copied" state lasts before reverting, in milliseconds. */
  resetDelay: number;
}

export const DM_COPY_BUTTON_FALLBACK_DEFAULTS: DmCopyButtonDefaults = {
  color: 'default',
  variant: 'flat',
  radius: 'md',
  size: 'md',
  resetDelay: 2000,
};

/** Injection token holding the defaults every `dm-copy-button` starts from. */
export const COPY_BUTTON_DEFAULTS = new InjectionToken<DmCopyButtonDefaults>(
  'COPY_BUTTON_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_COPY_BUTTON_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the copy-button defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideCopyButtonDefaults({ variant: 'bordered', resetDelay: 1200 })]
 * ```
 */
export function provideCopyButtonDefaults(defaults: Partial<DmCopyButtonDefaults>): Provider {
  return {
    provide: COPY_BUTTON_DEFAULTS,
    useValue: { ...DM_COPY_BUTTON_FALLBACK_DEFAULTS, ...defaults },
  };
}
