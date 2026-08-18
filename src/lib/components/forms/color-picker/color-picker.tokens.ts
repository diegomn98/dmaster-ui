import { InjectionToken, Provider } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmColorPickerColor, DmColorPickerRadius, DmColorPickerVariant } from './color-picker.types';

/** Globally overridable defaults for `dm-color-picker`. */
export interface DmColorPickerDefaults {
  color: DmColorPickerColor;
  variant: DmColorPickerVariant;
  size: DmSize;
  radius: DmColorPickerRadius;
  /** Whether the alpha rail is shown and the emitted hex carries an alpha byte. */
  showAlpha: boolean;
  /** Preset color chips shown in the panel's swatch grid (hex strings). */
  swatches: string[];
}

/** A small, pleasant default palette for the swatch grid. */
export const DM_COLOR_PICKER_DEFAULT_SWATCHES: string[] = [
  '#f31260',
  '#f5a524',
  '#f7b750',
  '#17c964',
  '#06b6d4',
  '#0072f5',
  '#7828c8',
  '#111827',
  '#71717a',
  '#ffffff',
];

export const DM_COLOR_PICKER_FALLBACK_DEFAULTS: DmColorPickerDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'md',
  showAlpha: false,
  swatches: DM_COLOR_PICKER_DEFAULT_SWATCHES,
};

/** Injection token holding the defaults every `dm-color-picker` starts from. */
export const COLOR_PICKER_DEFAULTS = new InjectionToken<DmColorPickerDefaults>(
  'COLOR_PICKER_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_COLOR_PICKER_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the color-picker defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideColorPickerDefaults({ showAlpha: true, variant: 'bordered' })]
 * ```
 */
export function provideColorPickerDefaults(defaults: Partial<DmColorPickerDefaults>): Provider {
  return {
    provide: COLOR_PICKER_DEFAULTS,
    useValue: { ...DM_COLOR_PICKER_FALLBACK_DEFAULTS, ...defaults },
  };
}
