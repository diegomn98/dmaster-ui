/**
 * Pure, dependency-free calendar math for `dm-date-picker`.
 *
 * Every helper works on **local-midnight** `Date` values (time stripped) so the
 * calendar grid never drifts across timezones or DST. Nothing here touches
 * `Date.now()`, `window`, or any global — the caller supplies "today" — so the
 * module is SSR-safe and trivially unit-testable.
 */

/** A `Date` at local midnight (00:00:00.000) of the same calendar day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Same calendar day (ignores time). */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Same calendar month + year (ignores day and time). */
export function isSameMonth(a: Date | null, b: Date | null): boolean {
  if (!a || !b) {
    return false;
  }
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** `date` shifted by `n` days (may be negative). Returns local midnight. */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/**
 * `date` shifted by `n` months (may be negative), clamped to the target
 * month's last day (Jan 31 + 1 month → Feb 28/29, never a rolled-over Mar 3).
 */
export function addMonths(date: Date, n: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + n;
  const day = Math.min(date.getDate(), daysInMonth(year, month));
  return new Date(year, month, day);
}

/** `date` shifted by `n` years (may be negative), clamped for Feb 29. */
export function addYears(date: Date, n: number): Date {
  const year = date.getFullYear() + n;
  const day = Math.min(date.getDate(), daysInMonth(year, date.getMonth()));
  return new Date(year, date.getMonth(), day);
}

/** First day of `date`'s month, at local midnight. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Last day of `date`'s month, at local midnight. */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Number of days in a given month. `month` is 0-based and may be out of range
 * (e.g. `12` = next January) — JS `Date` normalises it, so this composes with
 * `addMonths`' overflow arithmetic.
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** `a` is strictly before `b` at day granularity. */
export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/** `a` is strictly after `b` at day granularity. */
export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/** `date` confined to the `[min, max]` window (either bound may be null). */
export function clampDate(date: Date, min: Date | null, max: Date | null): Date {
  if (min && isBefore(date, min)) {
    return startOfDay(min);
  }
  if (max && isAfter(date, max)) {
    return startOfDay(max);
  }
  return startOfDay(date);
}

/**
 * Whether a day is unselectable: outside `[min, max]` or rejected by the
 * consumer predicate. The predicate receives a local-midnight `Date`.
 */
export function isDisabled(
  date: Date,
  min: Date | null,
  max: Date | null,
  predicate?: ((date: Date) => boolean) | null,
): boolean {
  if (min && isBefore(date, min)) {
    return true;
  }
  if (max && isAfter(date, max)) {
    return true;
  }
  return predicate ? predicate(startOfDay(date)) : false;
}

/**
 * The 6×7 grid of days shown for a month: the target month's days plus leading
 * days from the previous month and trailing days from the next, so the grid is
 * always exactly 42 cells starting on `firstDayOfWeek`.
 *
 * @param year         Full year of the month to render.
 * @param month        0-based month to render.
 * @param firstDayOfWeek 0 (Sunday) … 6 (Saturday) — the leftmost column.
 */
export function buildMonthGrid(year: number, month: number, firstDayOfWeek: number): Date[] {
  const first = new Date(year, month, 1);
  // How many leading cells belong to the previous month.
  const lead = (first.getDay() - firstDayOfWeek + 7) % 7;
  const start = new Date(year, month, 1 - lead);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

// CLDR fallback for runtimes without `Intl.Locale` week info (e.g. Firefox):
// regions whose week starts on Sunday / Saturday; everywhere else is Monday.
const SUNDAY_FIRST_REGIONS = new Set([
  'AG',
  'AS',
  'AU',
  'BD',
  'BR',
  'BS',
  'BT',
  'BW',
  'BZ',
  'CA',
  'CN',
  'CO',
  'DM',
  'DO',
  'ET',
  'GT',
  'GU',
  'HK',
  'HN',
  'ID',
  'IL',
  'IN',
  'JM',
  'JP',
  'KE',
  'KH',
  'KR',
  'LA',
  'MH',
  'MM',
  'MO',
  'MT',
  'MX',
  'MZ',
  'NI',
  'NP',
  'PA',
  'PE',
  'PH',
  'PK',
  'PR',
  'PT',
  'PY',
  'SA',
  'SG',
  'SV',
  'TH',
  'TT',
  'TW',
  'UM',
  'US',
  'VE',
  'VI',
  'WS',
  'YE',
  'ZA',
  'ZW',
]);
const SATURDAY_FIRST_REGIONS = new Set([
  'AE',
  'AF',
  'BH',
  'DJ',
  'DZ',
  'EG',
  'IQ',
  'IR',
  'JO',
  'KW',
  'LY',
  'OM',
  'QA',
  'SD',
  'SY',
]);

/**
 * First day of the week for a locale, as a JS weekday (0 = Sunday … 6 =
 * Saturday). Prefers the platform's CLDR week data (`Intl.Locale` week info,
 * where `firstDay` is ISO 1–7 with 7 = Sunday) and falls back to a compact
 * region table. Pass `undefined` to use the runtime's default locale.
 */
export function firstDayOfWeekForLocale(locale?: string): number {
  try {
    const resolved = locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
    const loc = new Intl.Locale(resolved);
    // Chrome exposes getWeekInfo(); Safari exposes a weekInfo accessor.
    const withWeekInfo = loc as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info =
      typeof withWeekInfo.getWeekInfo === 'function'
        ? withWeekInfo.getWeekInfo()
        : withWeekInfo.weekInfo;
    if (info && typeof info.firstDay === 'number') {
      return info.firstDay % 7; // ISO 1–7 (7 = Sunday) → JS 0–6.
    }
    const region = loc.maximize().region;
    if (region && SUNDAY_FIRST_REGIONS.has(region)) {
      return 0;
    }
    if (region && SATURDAY_FIRST_REGIONS.has(region)) {
      return 6;
    }
  } catch {
    // Malformed locale tag — fall through to the Monday default.
  }
  return 1;
}
