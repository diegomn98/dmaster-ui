import {
  EnvironmentProviders,
  InjectionToken,
  Provider,
  makeEnvironmentProviders,
} from '@angular/core';

import { DmIconFamily, DmIconSet, DmIconSize } from './icon.types';

/** Globally overridable defaults for `dm-icon`. */
export interface DmIconDefaults {
  size: DmIconSize;
  /** Default font-mode weight (the Material Symbols `wght` axis). */
  weight: number;
  /** Default font-mode family. */
  family: DmIconFamily;
}

export const DM_ICON_FALLBACK_DEFAULTS: DmIconDefaults = {
  size: 'md',
  weight: 400,
  family: 'outlined',
};

/** Injection token holding the defaults every `dm-icon` starts from. */
export const ICON_DEFAULTS = new InjectionToken<DmIconDefaults>('ICON_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_ICON_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the icon defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideIconDefaults({ size: 'sm' })]
 * ```
 */
export function provideIconDefaults(defaults: Partial<DmIconDefaults>): Provider {
  return {
    provide: ICON_DEFAULTS,
    useValue: { ...DM_ICON_FALLBACK_DEFAULTS, ...defaults },
  };
}

/**
 * @internal
 * Multi-token collecting every registered icon set. Each `provideDmasterIcons`
 * call contributes one set; `DmIconRegistry` merges them all.
 */
export const ICON_SETS = new InjectionToken<DmIconSet[]>('DM_ICON_SETS');

/**
 * Register a set of icons app- or route-wide so `<dm-icon name="…">` can draw
 * them. Callable multiple times — every set is merged, later names winning.
 *
 * ```ts
 * import { provideDmasterIcons } from '@dmaster/ui';
 * import { DM_ICONS } from '@dmaster/ui/icons';
 *
 * providers: [
 *   provideDmasterIcons(DM_ICONS),           // the curated set
 *   provideDmasterIcons({ brand: '<svg…' }), // plus your own
 * ]
 * ```
 *
 * Only pass **trusted** SVG markup: registered strings are rendered with the
 * Angular sanitizer bypassed (the same trust model as Angular Material's icon
 * registry). Never register markup that came from user input or the network.
 */
export function provideDmasterIcons(icons: DmIconSet): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ICON_SETS, useValue: icons, multi: true }]);
}
