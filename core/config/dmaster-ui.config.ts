import { InjectionToken } from '@angular/core';

import { DmDensity, DmTheme, DmThemeDefinition } from '../types/common.types';

/** Global configuration for @dmaster/ui, provided via `provideDmasterUI()`. */
export interface DmasterUIConfig {
  /** Initial theme. `auto` follows the OS preference. Default: `'auto'`. */
  theme: DmTheme;
  /** Initial density for controls and spacing. Default: `'comfortable'`. */
  density: DmDensity;
  /**
   * Custom named themes beyond the built-in `light`/`dark`. Each key is the
   * theme name (the value stamped on `<html data-dm-theme="...">`, matching a
   * `[data-dm-theme='<name>']` CSS block you author). The value declares its
   * base scheme (for the toggle and `color-scheme`) and an optional label.
   *
   * ```ts
   * provideDmasterUI({
   *   themes: {
   *     midnight: { scheme: 'dark', label: 'Midnight' },
   *     sand:     { scheme: 'light', label: 'Sand' },
   *   },
   * })
   * ```
   */
  themes: Readonly<Record<string, DmThemeDefinition>>;
}

export const DMASTER_UI_DEFAULT_CONFIG: DmasterUIConfig = {
  theme: 'auto',
  density: 'comfortable',
  themes: {},
};

/** Resolved global configuration. Falls back to defaults when `provideDmasterUI()` was not called. */
export const DMASTER_UI_CONFIG = new InjectionToken<DmasterUIConfig>('DMASTER_UI_CONFIG', {
  providedIn: 'root',
  factory: () => DMASTER_UI_DEFAULT_CONFIG,
});
