import { InjectionToken, Provider } from '@angular/core';

import { DmKbdSize } from './kbd.types';

/** Globally overridable defaults for `dm-kbd`. */
export interface DmKbdDefaults {
  size: DmKbdSize;
}

export const DM_KBD_FALLBACK_DEFAULTS: DmKbdDefaults = {
  size: 'md',
};

/** Injection token holding the defaults every `dm-kbd` starts from. */
export const KBD_DEFAULTS = new InjectionToken<DmKbdDefaults>('KBD_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_KBD_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the `dm-kbd` defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideKbdDefaults({ size: 'sm' })]
 * ```
 */
export function provideKbdDefaults(defaults: Partial<DmKbdDefaults>): Provider {
  return {
    provide: KBD_DEFAULTS,
    useValue: { ...DM_KBD_FALLBACK_DEFAULTS, ...defaults },
  };
}
