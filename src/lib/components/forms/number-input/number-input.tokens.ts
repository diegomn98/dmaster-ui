import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import {
  DmNumberInputColor,
  DmNumberInputRadius,
  DmNumberInputVariant,
} from './number-input.types';

/** Globally overridable defaults for `dm-number-input`. */
export interface DmNumberInputDefaults {
  color: DmNumberInputColor;
  variant: DmNumberInputVariant;
  size: DmSize;
  radius: DmNumberInputRadius;
  /** Hides the −/+ buttons app-wide (keyboard stepping keeps working). */
  hideControls: boolean;
  /**
   * Accessible label of the − button. Together with `incrementLabel` this is
   * the only built-in copy of the component (same policy as the toast's
   * `dismissLabel`) — override it per app language.
   */
  decrementLabel: string;
  /** Accessible label of the + button. */
  incrementLabel: string;
}

export const DM_NUMBER_INPUT_FALLBACK_DEFAULTS: DmNumberInputDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  // `md`, like every other field: input, select, search and number must read
  // as one family. The pill look stays one prop away (radius="full").
  radius: 'md',
  hideControls: false,
  decrementLabel: 'Decrease',
  incrementLabel: 'Increase',
};

/** Injection token holding the defaults every `dm-number-input` starts from. */
export const NUMBER_INPUT_DEFAULTS = new InjectionToken<DmNumberInputDefaults>(
  'NUMBER_INPUT_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_NUMBER_INPUT_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the number-input defaults app- or route-wide.
 *
 * ```ts
 * providers: [
 *   provideNumberInputDefaults({
 *     variant: 'bordered',
 *     decrementLabel: 'Disminuir',
 *     incrementLabel: 'Aumentar',
 *   }),
 * ]
 * ```
 */
export function provideNumberInputDefaults(defaults: Partial<DmNumberInputDefaults>): Provider {
  return {
    provide: NUMBER_INPUT_DEFAULTS,
    useValue: { ...DM_NUMBER_INPUT_FALLBACK_DEFAULTS, ...defaults },
  };
}
