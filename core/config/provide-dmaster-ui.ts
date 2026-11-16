import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';

import { DensityService } from '../services/density.service';
import { ThemeService } from '../services/theme.service';
import { DMASTER_UI_CONFIG, DMASTER_UI_DEFAULT_CONFIG, DmasterUIConfig } from './dmaster-ui.config';

/**
 * Registers the global @dmaster/ui configuration and eagerly initializes
 * the theme and density services so `<html>` is stamped from app startup.
 *
 * ```ts
 * providers: [
 *   provideDmasterUI({ theme: 'auto', density: 'comfortable' }),
 * ]
 * ```
 */
export function provideDmasterUI(config: Partial<DmasterUIConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DMASTER_UI_CONFIG, useValue: { ...DMASTER_UI_DEFAULT_CONFIG, ...config } },
    provideEnvironmentInitializer(() => {
      inject(ThemeService);
      inject(DensityService);
    }),
  ]);
}
