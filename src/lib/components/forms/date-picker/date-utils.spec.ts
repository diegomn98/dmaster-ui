import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  clampDate,
  daysInMonth,
  endOfMonth,
  firstDayOfWeekForLocale,
  isAfter,
  isBefore,
  isDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from './date-utils';

// A fixed reference so tests never touch the real clock.
const REF = new Date(2026, 7, 17, 13, 45, 30, 123); // 2026-08-17 (August is month 7)

describe('date-utils', () => {
  describe('startOfDay', () => {
    it('strips the time to local midnight', () => {
      const d = startOfDay(REF);
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
      expect(d.getMilliseconds()).toBe(0);
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(7);
      expect(d.getDate()).toBe(17);
    });
  });

  describe('isSameDay', () => {
    it('ignores the time component', () => {
      expect(isSameDay(REF, new Date(2026, 7, 17))).toBe(true);
    });

    it('is false across days and for null operands', () => {
      expect(isSameDay(REF, new Date(2026, 7, 18))).toBe(false);
      expect(isSameDay(null, REF)).toBe(false);
      expect(isSameDay(REF, null)).toBe(false);
    });
  });

  describe('isSameMonth', () => {
    it('matches month + year, ignores the day', () => {
      expect(isSameMonth(REF, new Date(2026, 7, 1))).toBe(true);
      expect(isSameMonth(REF, new Date(2026, 8, 17))).toBe(false);
      expect(isSameMonth(REF, new Date(2025, 7, 17))).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds and subtracts, rolling over month boundaries', () => {
      expect(isSameDay(addDays(new Date(2026, 7, 31), 1), new Date(2026, 8, 1))).toBe(true);
      expect(isSameDay(addDays(new Date(2026, 8, 1), -1), new Date(2026, 7, 31))).toBe(true);
    });
  });

  describe('addMonths', () => {
    it('clamps the day to the target month length', () => {
      // Jan 31 + 1 month → Feb 28 (2026 is not a leap year), never Mar 3.
      expect(isSameDay(addMonths(new Date(2026, 0, 31), 1), new Date(2026, 1, 28))).toBe(true);
    });

    it('handles leap February', () => {
      expect(isSameDay(addMonths(new Date(2024, 0, 31), 1), new Date(2024, 1, 29))).toBe(true);
    });

    it('crosses year boundaries in both directions', () => {
      expect(isSameDay(addMonths(new Date(2026, 11, 15), 1), new Date(2027, 0, 15))).toBe(true);
      expect(isSameDay(addMonths(new Date(2026, 0, 15), -1), new Date(2025, 11, 15))).toBe(true);
    });
  });

  describe('addYears', () => {
    it('clamps Feb 29 onto a non-leap year', () => {
      expect(isSameDay(addYears(new Date(2024, 1, 29), 1), new Date(2025, 1, 28))).toBe(true);
    });
  });

  describe('startOfMonth / endOfMonth', () => {
    it('returns the first and last day of the month', () => {
      expect(isSameDay(startOfMonth(REF), new Date(2026, 7, 1))).toBe(true);
      expect(isSameDay(endOfMonth(REF), new Date(2026, 7, 31))).toBe(true);
    });

    it('endOfMonth handles February length', () => {
      expect(endOfMonth(new Date(2026, 1, 10)).getDate()).toBe(28);
      expect(endOfMonth(new Date(2024, 1, 10)).getDate()).toBe(29);
    });
  });

  describe('daysInMonth', () => {
    it('returns the correct lengths', () => {
      expect(daysInMonth(2026, 7)).toBe(31); // August
      expect(daysInMonth(2026, 1)).toBe(28); // Feb non-leap
      expect(daysInMonth(2024, 1)).toBe(29); // Feb leap
      expect(daysInMonth(2026, 3)).toBe(30); // April
    });
  });

  describe('isBefore / isAfter', () => {
    it('compares at day granularity, ignoring time', () => {
      const morning = new Date(2026, 7, 17, 1);
      const evening = new Date(2026, 7, 17, 23);
      expect(isBefore(morning, evening)).toBe(false);
      expect(isAfter(evening, morning)).toBe(false);
      expect(isBefore(new Date(2026, 7, 16), REF)).toBe(true);
      expect(isAfter(new Date(2026, 7, 18), REF)).toBe(true);
    });
  });

  describe('clampDate', () => {
    const min = new Date(2026, 7, 10);
    const max = new Date(2026, 7, 20);

    it('pulls a date into the window', () => {
      expect(isSameDay(clampDate(new Date(2026, 7, 5), min, max), min)).toBe(true);
      expect(isSameDay(clampDate(new Date(2026, 7, 25), min, max), max)).toBe(true);
      expect(isSameDay(clampDate(new Date(2026, 7, 15), min, max), new Date(2026, 7, 15))).toBe(
        true,
      );
    });

    it('treats null bounds as unbounded and returns local midnight', () => {
      const out = clampDate(REF, null, null);
      expect(out.getHours()).toBe(0);
      expect(isSameDay(out, REF)).toBe(true);
    });
  });

  describe('isDisabled', () => {
    const min = new Date(2026, 7, 10);
    const max = new Date(2026, 7, 20);

    it('flags dates outside the min/max window', () => {
      expect(isDisabled(new Date(2026, 7, 9), min, max)).toBe(true);
      expect(isDisabled(new Date(2026, 7, 21), min, max)).toBe(true);
      expect(isDisabled(new Date(2026, 7, 15), min, max)).toBe(false);
    });

    it('applies the predicate to a local-midnight date', () => {
      // Disable weekends.
      const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
      expect(isDisabled(new Date(2026, 7, 15), null, null, weekend)).toBe(true); // Sat
      expect(isDisabled(new Date(2026, 7, 17), null, null, weekend)).toBe(false); // Mon
    });
  });

  describe('firstDayOfWeekForLocale', () => {
    it('resolves Monday-first locales (Spain, France, Germany)', () => {
      expect(firstDayOfWeekForLocale('es-ES')).toBe(1);
      expect(firstDayOfWeekForLocale('fr-FR')).toBe(1);
      expect(firstDayOfWeekForLocale('de-DE')).toBe(1);
    });

    it('resolves Sunday-first locales (US, Japan, Brazil)', () => {
      expect(firstDayOfWeekForLocale('en-US')).toBe(0);
      expect(firstDayOfWeekForLocale('ja-JP')).toBe(0);
      expect(firstDayOfWeekForLocale('pt-BR')).toBe(0);
    });

    it('resolves MENA locales to a weekend-adjacent start (Sat or Sun)', () => {
      // Exact CLDR week data for these regions varies across ICU versions
      // (Egypt: Saturday in CLDR, Sunday in some builds) — assert the family,
      // not the pinned value, so tests hold on any runtime.
      expect([0, 6]).toContain(firstDayOfWeekForLocale('ar-EG'));
      expect([0, 6]).toContain(firstDayOfWeekForLocale('ar-SA'));
    });

    it('resolves bare language tags via likely subtags', () => {
      expect(firstDayOfWeekForLocale('es')).toBe(1); // → es-ES
      expect(firstDayOfWeekForLocale('en')).toBe(0); // → en-US
    });

    it('falls back to Monday for malformed tags', () => {
      expect(firstDayOfWeekForLocale('not a locale !!')).toBe(1);
    });
  });

  describe('buildMonthGrid', () => {
    it('always returns 42 cells', () => {
      expect(buildMonthGrid(2026, 7, 0)).toHaveLength(42);
      expect(buildMonthGrid(2026, 1, 1)).toHaveLength(42);
    });

    it('starts on the configured first day of week', () => {
      // August 2026: the 1st is a Saturday (getDay 6).
      const sundayFirst = buildMonthGrid(2026, 7, 0);
      expect(sundayFirst[0].getDay()).toBe(0);
      const mondayFirst = buildMonthGrid(2026, 7, 1);
      expect(mondayFirst[0].getDay()).toBe(1);
    });

    it('pads with the correct leading/trailing adjacent-month days', () => {
      // Sunday-first August 2026: 1st is Saturday, so 6 leading July days.
      const grid = buildMonthGrid(2026, 7, 0);
      expect(isSameDay(grid[0], new Date(2026, 6, 26))).toBe(true); // Jul 26 (Sun)
      expect(isSameDay(grid[6], new Date(2026, 7, 1))).toBe(true); // Aug 1 (Sat)
      expect(isSameDay(grid[41], new Date(2026, 8, 5))).toBe(true); // trailing Sep 5
    });

    it('contains every day of the target month', () => {
      const grid = buildMonthGrid(2026, 7, 0);
      const augustDays = grid.filter((d) => d.getMonth() === 7).map((d) => d.getDate());
      expect(augustDays).toHaveLength(31);
      expect(Math.min(...augustDays)).toBe(1);
      expect(Math.max(...augustDays)).toBe(31);
    });
  });
});
