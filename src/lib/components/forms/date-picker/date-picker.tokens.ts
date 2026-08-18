import { InjectionToken, Provider, Signal } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import {
  DmDatePickerColor,
  DmDatePickerRadius,
  DmDatePickerVariant,
  DmFirstDayOfWeek,
  DmWeekdayFormat,
} from './date-picker.types';

/**
 * App-wide locale for every `dm-date-picker` — the reactive analogue of
 * Material's `MAT_DATE_LOCALE`. Accepts a plain BCP-47 string or a
 * `Signal<string>`; with a signal, every open picker re-renders live when the
 * app language changes (names, digits, trigger text AND week convention).
 *
 * Per-instance `locale` inputs always win over this token.
 *
 * ```ts
 * // Static:
 * provideDateLocale('es')
 * // Reactive (e.g. from your i18n service):
 * provideDateLocale(myLocaleSignal)
 * ```
 */
export const DM_DATE_LOCALE = new InjectionToken<string | Signal<string>>('DM_DATE_LOCALE');

/** Convenience provider for {@link DM_DATE_LOCALE}. */
export function provideDateLocale(locale: string | Signal<string>): Provider {
  return { provide: DM_DATE_LOCALE, useValue: locale };
}

/** Globally overridable defaults for `dm-date-picker`. */
export interface DmDatePickerDefaults {
  color: DmDatePickerColor;
  variant: DmDatePickerVariant;
  size: DmSize;
  radius: DmDatePickerRadius;
  /**
   * Leftmost column of the calendar: 0 (Sunday) … 6 (Saturday), or `'auto'`
   * to follow the active locale's CLDR week data.
   */
  firstDayOfWeek: DmFirstDayOfWeek;
  /** Whether the panel shows the "Today" quick-jump button. */
  showTodayButton: boolean;
  /** `Intl` options used to format the selected date in the trigger. */
  displayFormat: Intl.DateTimeFormatOptions;
  /** Weekday header label length. */
  weekdayFormat: DmWeekdayFormat;
}

export const DM_DATE_PICKER_FALLBACK_DEFAULTS: DmDatePickerDefaults = {
  color: 'default',
  variant: 'flat',
  size: 'md',
  radius: 'md',
  firstDayOfWeek: 'auto',
  showTodayButton: true,
  displayFormat: { year: 'numeric', month: 'short', day: 'numeric' },
  weekdayFormat: 'short',
};

/** Injection token holding the defaults every `dm-date-picker` starts from. */
export const DATE_PICKER_DEFAULTS = new InjectionToken<DmDatePickerDefaults>('DATE_PICKER_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_DATE_PICKER_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the date-picker defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideDatePickerDefaults({ firstDayOfWeek: 1, variant: 'bordered' })]
 * ```
 */
export function provideDatePickerDefaults(defaults: Partial<DmDatePickerDefaults>): Provider {
  return {
    provide: DATE_PICKER_DEFAULTS,
    useValue: { ...DM_DATE_PICKER_FALLBACK_DEFAULTS, ...defaults },
  };
}
