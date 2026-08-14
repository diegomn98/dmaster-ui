import { InjectionToken, Provider } from '@angular/core';

import { DmAlertColor, DmAlertVariant } from './alert.types';

/** Globally overridable defaults for `dm-alert`. */
export interface DmAlertDefaults {
  color: DmAlertColor;
  variant: DmAlertVariant;
  /**
   * Accessible label of the dismiss button. Built-in copy (like the toast's
   * `dismissLabel`) — override it per app language.
   */
  dismissLabel: string;
}

export const DM_ALERT_FALLBACK_DEFAULTS: DmAlertDefaults = {
  color: 'default',
  variant: 'flat',
  dismissLabel: 'Dismiss',
};

/** Injection token holding the defaults every `dm-alert` starts from. */
export const ALERT_DEFAULTS = new InjectionToken<DmAlertDefaults>('ALERT_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_ALERT_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the alert defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideAlertDefaults({ variant: 'faded', dismissLabel: 'Cerrar' })]
 * ```
 */
export function provideAlertDefaults(defaults: Partial<DmAlertDefaults>): Provider {
  return {
    provide: ALERT_DEFAULTS,
    useValue: { ...DM_ALERT_FALLBACK_DEFAULTS, ...defaults },
  };
}
