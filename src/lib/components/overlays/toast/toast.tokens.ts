import { InjectionToken, Provider } from '@angular/core';

/** Globally overridable defaults for `DmToastService`. */
export interface DmToastDefaults {
  /** Auto-dismiss delay in ms. `0` disables auto-dismiss. */
  duration: number;
  /** Shows the dismiss button. */
  dismissible: boolean;
  /**
   * Accessible label of the dismiss button. The only built-in copy in the
   * library — override it per app language.
   */
  dismissLabel: string;
}

export const DM_TOAST_FALLBACK_DEFAULTS: DmToastDefaults = {
  duration: 4000,
  dismissible: true,
  dismissLabel: 'Dismiss',
};

/** Injection token holding the defaults `DmToastService` starts from. */
export const TOAST_DEFAULTS = new InjectionToken<DmToastDefaults>('TOAST_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_TOAST_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the toast defaults app-wide. */
export function provideToastDefaults(defaults: Partial<DmToastDefaults>): Provider {
  return {
    provide: TOAST_DEFAULTS,
    useValue: { ...DM_TOAST_FALLBACK_DEFAULTS, ...defaults },
  };
}
