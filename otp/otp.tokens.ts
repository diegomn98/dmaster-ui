import { InjectionToken, Provider } from '@angular/core';

import { DmOtpColor, DmOtpMode, DmOtpSize, DmOtpVariant } from './otp.types';

/** Globally overridable defaults for `dm-otp`. */
export interface DmOtpDefaults {
  length: number;
  mode: DmOtpMode;
  color: DmOtpColor;
  size: DmOtpSize;
  variant: DmOtpVariant;
}

export const DM_OTP_FALLBACK_DEFAULTS: DmOtpDefaults = {
  length: 6,
  mode: 'numeric',
  color: 'default',
  size: 'md',
  variant: 'flat',
};

/** Injection token holding the defaults every `dm-otp` starts from. */
export const OTP_DEFAULTS = new InjectionToken<DmOtpDefaults>('OTP_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_OTP_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the OTP defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideOtpDefaults({ length: 4, mode: 'numeric' })]
 * ```
 */
export function provideOtpDefaults(defaults: Partial<DmOtpDefaults>): Provider {
  return {
    provide: OTP_DEFAULTS,
    useValue: { ...DM_OTP_FALLBACK_DEFAULTS, ...defaults },
  };
}
