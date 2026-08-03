import { InjectionToken } from '@angular/core';

import { DmDensity, DmTheme } from '../types/common.types';

/** Global configuration for ngx-dmaster-ui, provided via `provideDmasterUI()`. */
export interface DmasterUIConfig {
  /** Initial theme. `auto` follows the OS preference. Default: `'auto'`. */
  theme: DmTheme;
  /** Initial density for controls and spacing. Default: `'comfortable'`. */
  density: DmDensity;
}

export const DMASTER_UI_DEFAULT_CONFIG: DmasterUIConfig = {
  theme: 'auto',
  density: 'comfortable',
};

/** Resolved global configuration. Falls back to defaults when `provideDmasterUI()` was not called. */
export const DMASTER_UI_CONFIG = new InjectionToken<DmasterUIConfig>('DMASTER_UI_CONFIG', {
  providedIn: 'root',
  factory: () => DMASTER_UI_DEFAULT_CONFIG,
});
