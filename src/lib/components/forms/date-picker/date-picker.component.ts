import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  firstDayOfWeekForLocale,
  isDisabled as isDayDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from './date-utils';
import { DATE_PICKER_DEFAULTS, DM_DATE_LOCALE } from './date-picker.tokens';
import {
  DmCalendarView,
  DmDatePickerColor,
  DmDatePickerRadius,
  DmDatePickerVariant,
  DmDateDisabledFn,
  DmFirstDayOfWeek,
  DmWeekdayFormat,
} from './date-picker.types';

/** A day cell in the rendered month grid. */
interface DayCell {
  date: Date;
  /** Localised day-of-month digits shown in the cell. */
  label: string;
  /** Belongs to the month being viewed (vs. a leading/trailing filler day). */
  inMonth: boolean;
}

const YEARS_PER_PAGE = 12;

/** Splits a flat array into rows of `size` for role="row" grid grouping. */
function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
}

/**
 * Single-date calendar picker with a color × variant API.
 *
 * ```html
 * <dm-date-picker label="Start date" [(value)]="start" [min]="today" />
 * ```
 *
 * The calendar opens in a CDK overlay anchored to the trigger and is fully
 * keyboard-driven (WAI-ARIA date-picker dialog pattern) with layered
 * day → month → year navigation. All month/weekday names and the trigger text
 * are produced by `Intl.DateTimeFormat`, so the calendar follows the `locale`
 * input with **no date library** and works under SSR/prerender.
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Component({
  selector: 'dm-date-picker',
  imports: [OverlayModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmDatePickerComponent),
      multi: true,
    },
  ],
})
export class DmDatePickerComponent implements ControlValueAccessor {
  private readonly defaults = inject(DATE_PICKER_DEFAULTS);
  private readonly appLocale = inject(DM_DATE_LOCALE, { optional: true });
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  protected readonly uid = dmUid('dm-date-picker');

  /** Local-midnight "today" — computed once; drives the today ring + button. */
  protected readonly today = startOfDay(new Date());

  // ---- Inputs (field family) ----------------------------------------------
  /** Two-way selected date. */
  readonly value = model<Date | null>(null);

  /** Visible label above the trigger. */
  readonly label = input<string>('');

  /** Text shown while no date is selected. */
  readonly placeholder = input<string>('');

  /** Help text below the trigger. */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the trigger. */
  readonly disabled = input<boolean>(false);

  /** Shows the required marker next to the label. */
  readonly required = input<boolean>(false);

  /** Semantic color for focus ring and the selected-day fill. */
  readonly color = input<DmDatePickerColor>(this.defaults.color);

  /** Visual variant of the trigger surface. */
  readonly variant = input<DmDatePickerVariant>(this.defaults.variant);

  /** Trigger height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding of the trigger. */
  readonly radius = input<DmDatePickerRadius>(this.defaults.radius);

  /** ARIA label for triggers without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** Shows an × button to clear the selection. Keyboard: Delete / Backspace. */
  readonly clearable = input<boolean>(false);

  /** ARIA label for the clear button. */
  readonly clearAriaLabel = input<string>('Clear');

  // ---- Inputs (date specific) ---------------------------------------------
  /** Earliest selectable date (inclusive). Days before it are disabled. */
  readonly min = input<Date | null>(null);

  /** Latest selectable date (inclusive). Days after it are disabled. */
  readonly max = input<Date | null>(null);

  /** Predicate to disable arbitrary days (weekends, holidays…). */
  readonly isDateDisabled = input<DmDateDisabledFn | null>(null);

  /**
   * Leftmost weekday column: 0 (Sunday) … 6 (Saturday), or `'auto'` (default)
   * to follow the active locale's week convention (Monday in Spain, Sunday in
   * the US, Saturday in much of MENA).
   */
  readonly firstDayOfWeek = input<DmFirstDayOfWeek>(this.defaults.firstDayOfWeek);

  /**
   * BCP-47 locale for all names/formatting. Omit to fall back to the app-wide
   * {@link DM_DATE_LOCALE} token (string or live `Signal<string>`), and to the
   * runtime default when neither is set.
   */
  readonly locale = input<string>();

  /** Weekday header label length. */
  readonly weekdayFormat = input<DmWeekdayFormat>(this.defaults.weekdayFormat);

  /** `Intl` options used to format the selected date in the trigger. */
  readonly displayFormat = input<Intl.DateTimeFormatOptions>(this.defaults.displayFormat);

  /** Shows the "Today" quick-jump button in the panel footer. */
  readonly showTodayButton = input<boolean>(this.defaults.showTodayButton);

  /** Closes the panel right after a day is picked. */
  readonly closeOnSelect = input<boolean>(true);

  /** Localised caption for the "Today" footer button. */
  readonly todayLabel = input<string>('Today');

  // ---- ARIA ids ------------------------------------------------------------
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly dialogId = `${this.uid}-dialog`;
  protected readonly gridLabelId = `${this.uid}-grid-label`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  // ---- State ---------------------------------------------------------------
  protected readonly open = signal(false);
  protected readonly view = signal<DmCalendarView>('days');
  /** First day of the month currently rendered in the days grid. */
  protected readonly viewDate = signal<Date>(startOfMonth(this.today));
  /** Roving-focus targets, one per view. */
  protected readonly focusedDate = signal<Date>(this.today);
  protected readonly focusedMonth = signal<number>(this.today.getMonth());
  protected readonly focusedYear = signal<number>(this.today.getFullYear());
  /** Announced to assistive tech on month/view changes. */
  protected readonly liveMessage = signal<string>('');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  // ---- Locale resolution ----------------------------------------------------
  /**
   * Active locale: per-instance `locale` input → app-wide `DM_DATE_LOCALE`
   * (unwrapping a `Signal<string>` reactively, so a live language switch
   * re-renders every picker) → `undefined` (runtime default).
   */
  protected readonly resolvedLocale = computed<string | undefined>(() => {
    const own = this.locale();
    if (own) {
      return own;
    }
    const app = this.appLocale;
    if (typeof app === 'function') {
      return app();
    }
    return app ?? undefined;
  });

  // ---- Intl formatters (rebuilt only when locale/format changes) -----------
  private readonly displayFormatter = computed(
    () => new Intl.DateTimeFormat(this.resolvedLocale(), this.displayFormat()),
  );
  private readonly monthYearFormatter = computed(
    () => new Intl.DateTimeFormat(this.resolvedLocale(), { month: 'long', year: 'numeric' }),
  );
  private readonly monthShortFormatter = computed(
    () => new Intl.DateTimeFormat(this.resolvedLocale(), { month: 'short' }),
  );
  private readonly weekdayFormatter = computed(
    () => new Intl.DateTimeFormat(this.resolvedLocale(), { weekday: this.weekdayFormat() }),
  );
  private readonly fullDateFormatter = computed(
    () =>
      new Intl.DateTimeFormat(this.resolvedLocale(), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
  );

  /** Day-of-month digits — via Intl so `ar`/`fa` render native numerals. */
  private readonly dayFormatter = computed(
    () => new Intl.DateTimeFormat(this.resolvedLocale(), { day: 'numeric' }),
  );

  /** `firstDayOfWeek` with `'auto'` resolved against the active locale. */
  protected readonly resolvedFirstDay = computed(() => {
    const first = this.firstDayOfWeek();
    return first === 'auto' ? firstDayOfWeekForLocale(this.resolvedLocale()) : first;
  });

  // ---- Derived view models -------------------------------------------------
  protected readonly displayText = computed(() => {
    const v = this.value();
    return v ? this.displayFormatter().format(v) : this.placeholder();
  });

  protected readonly hasPlaceholder = computed(() => !this.value());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.value() !== null && !this.isDisabled(),
  );

  /** Weekday header cells, ordered from the resolved first day of the week. */
  protected readonly weekdays = computed<{ label: string; long: string }[]>(() => {
    const fmt = this.weekdayFormatter();
    const longFmt = new Intl.DateTimeFormat(this.resolvedLocale(), { weekday: 'long' });
    const start = this.resolvedFirstDay();
    // 2023-01-01 is a Sunday — a stable anchor to walk a full week from.
    const anchor = new Date(2023, 0, 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(anchor, start + i);
      return { label: fmt.format(d), long: longFmt.format(d) };
    });
  });

  /** The 6×7 grid of day cells for the current `viewDate`. */
  protected readonly dayCells = computed<DayCell[]>(() => {
    const vd = this.viewDate();
    const fmt = this.dayFormatter();
    return buildMonthGrid(vd.getFullYear(), vd.getMonth(), this.resolvedFirstDay()).map((date) => ({
      date,
      label: fmt.format(date),
      inMonth: isSameMonth(date, vd),
    }));
  });

  /** Long month + year label shown in the header while in days view. */
  protected readonly monthLabel = computed(() => this.monthYearFormatter().format(this.viewDate()));

  /** Localised short month names for the months view. */
  protected readonly monthCells = computed<{ index: number; label: string }[]>(() => {
    const fmt = this.monthShortFormatter();
    const year = this.viewDate().getFullYear();
    return Array.from({ length: 12 }, (_, i) => ({
      index: i,
      label: fmt.format(new Date(year, i, 1)),
    }));
  });

  /** The 12-year window shown in the years view. */
  protected readonly yearCells = computed<number[]>(() => {
    const year = this.viewDate().getFullYear();
    const startYear = year - (((year % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);
    return Array.from({ length: YEARS_PER_PAGE }, (_, i) => startYear + i);
  });

  /** Day cells grouped into 6 weeks for `role="row"`. */
  protected readonly weeks = computed<DayCell[][]>(() => chunk(this.dayCells(), 7));

  /** Month cells grouped into rows of 3 for `role="row"`. */
  protected readonly monthRows = computed(() => chunk(this.monthCells(), 3));

  /** Year cells grouped into rows of 3 for `role="row"`. */
  protected readonly yearRows = computed(() => chunk(this.yearCells(), 3));

  /** Header label depends on the active view. */
  protected readonly headerLabel = computed(() => {
    switch (this.view()) {
      case 'months':
        return String(this.viewDate().getFullYear());
      case 'years': {
        const years = this.yearCells();
        return `${years[0]} – ${years[years.length - 1]}`;
      }
      default:
        return this.monthLabel();
    }
  });

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.description()) {
      return this.hintId;
    }
    return null;
  });

  protected readonly overlayPositions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -6,
    },
    {
      originX: 'end' as const,
      originY: 'bottom' as const,
      overlayX: 'end' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
  ];

  protected readonly scrollStrategy = this.scrollStrategies.reposition();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('triggerEl');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panelEl');

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: Date | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: Date | null): void {
    const normalised = value ? startOfDay(value) : null;
    this.value.set(normalised);
    if (normalised) {
      this.viewDate.set(startOfMonth(normalised));
      this.focusedDate.set(normalised);
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // Keep the roving focus on-screen: after the panel opens or the focus
    // target/view changes, move real DOM focus to the highlighted cell.
    effect(() => {
      if (!this.open()) {
        return;
      }
      // Touch the signals that should re-trigger focusing.
      this.view();
      this.focusedDate();
      this.focusedMonth();
      this.focusedYear();
      queueMicrotask(() => {
        const panel = this.panelRef()?.nativeElement;
        const target = panel?.querySelector<HTMLElement>('[data-focused="true"]');
        target?.focus();
      });
    });
  }

  // ---- Disabled-day helper -------------------------------------------------
  protected dayDisabled(date: Date): boolean {
    return isDayDisabled(date, this.min(), this.max(), this.isDateDisabled());
  }

  protected isSelected(date: Date): boolean {
    return isSameDay(date, this.value());
  }

  protected isToday(date: Date): boolean {
    return isSameDay(date, this.today);
  }

  protected isFocusedDay(date: Date): boolean {
    return isSameDay(date, this.focusedDate());
  }

  protected dayAriaLabel(date: Date): string {
    return this.fullDateFormatter().format(date);
  }

  // ---- Open / close --------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    if (this.open() || this.isDisabled()) {
      return;
    }
    const base = this.value() ?? this.today;
    this.view.set('days');
    this.viewDate.set(startOfMonth(base));
    this.focusedDate.set(base);
    this.focusedMonth.set(base.getMonth());
    this.focusedYear.set(base.getFullYear());
    this.open.set(true);
  }

  protected close(returnFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.onTouched();
    if (returnFocus) {
      this.triggerRef().nativeElement.focus();
    }
  }

  // ---- Selection -----------------------------------------------------------
  protected selectDate(date: Date): void {
    const normalised = startOfDay(date);
    if (this.dayDisabled(normalised)) {
      return;
    }
    this.value.set(normalised);
    this.onChange(normalised);
    this.viewDate.set(startOfMonth(normalised));
    this.focusedDate.set(normalised);
    if (this.closeOnSelect()) {
      this.close();
    }
  }

  protected selectToday(): void {
    this.selectDate(this.today);
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doClear();
  }

  private doClear(): void {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
  }

  // ---- Header navigation (prev / next / climb) -----------------------------
  protected goPrev(): void {
    this.step(-1);
  }

  protected goNext(): void {
    this.step(1);
  }

  private step(direction: 1 | -1): void {
    switch (this.view()) {
      case 'months':
        this.viewDate.update((d) => addYears(d, direction));
        break;
      case 'years':
        this.viewDate.update((d) => addYears(d, direction * YEARS_PER_PAGE));
        break;
      default:
        this.viewDate.update((d) => addMonths(d, direction));
        this.announceMonth();
    }
  }

  /** Header label button: climb one level (days → months → years). */
  protected climbView(): void {
    if (this.view() === 'days') {
      this.focusedMonth.set(this.viewDate().getMonth());
      this.view.set('months');
    } else if (this.view() === 'months') {
      this.focusedYear.set(this.viewDate().getFullYear());
      this.view.set('years');
    }
  }

  protected pickMonth(month: number): void {
    this.viewDate.update((d) => startOfMonth(new Date(d.getFullYear(), month, 1)));
    this.view.set('days');
    this.focusedDate.set(this.clampFocusToMonth());
    this.announceMonth();
  }

  protected pickYear(year: number): void {
    this.viewDate.update((d) => startOfMonth(new Date(year, d.getMonth(), 1)));
    this.view.set('months');
    this.focusedMonth.set(this.viewDate().getMonth());
  }

  /** Keeps the roving day inside the freshly-selected month. */
  private clampFocusToMonth(): Date {
    const vd = this.viewDate();
    const day = Math.min(
      this.focusedDate().getDate(),
      new Date(vd.getFullYear(), vd.getMonth() + 1, 0).getDate(),
    );
    return new Date(vd.getFullYear(), vd.getMonth(), day);
  }

  // ---- Keyboard: trigger ---------------------------------------------------
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const key = event.key;
    if (!this.open()) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openPanel();
      } else if ((key === 'Delete' || key === 'Backspace') && this.showClearButton()) {
        event.preventDefault();
        this.doClear();
      }
    }
  }

  protected onTriggerBlur(): void {
    if (!this.open()) {
      this.onTouched();
    }
  }

  // ---- Keyboard: panel -----------------------------------------------------
  protected onPanelKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (key === 'Tab') {
      // Non-modal: hand focus back to the trigger and close.
      event.preventDefault();
      this.close();
      return;
    }
    switch (this.view()) {
      case 'days':
        this.onDaysKeydown(event);
        break;
      case 'months':
        this.onMonthsKeydown(event);
        break;
      case 'years':
        this.onYearsKeydown(event);
        break;
    }
  }

  private onDaysKeydown(event: KeyboardEvent): void {
    const key = event.key;
    let handled = true;
    switch (key) {
      case 'ArrowLeft':
        this.moveFocusedDate(-1);
        break;
      case 'ArrowRight':
        this.moveFocusedDate(1);
        break;
      case 'ArrowUp':
        this.moveFocusedDate(-7);
        break;
      case 'ArrowDown':
        this.moveFocusedDate(7);
        break;
      case 'Home':
        this.moveFocusedDate(-((this.focusedDate().getDay() - this.resolvedFirstDay() + 7) % 7));
        break;
      case 'End':
        this.moveFocusedDate(6 - ((this.focusedDate().getDay() - this.resolvedFirstDay() + 7) % 7));
        break;
      case 'PageUp':
        this.shiftFocusedDate(
          event.shiftKey ? addYears(this.focusedDate(), -1) : addMonths(this.focusedDate(), -1),
        );
        break;
      case 'PageDown':
        this.shiftFocusedDate(
          event.shiftKey ? addYears(this.focusedDate(), 1) : addMonths(this.focusedDate(), 1),
        );
        break;
      case 'Enter':
      case ' ':
        this.selectDate(this.focusedDate());
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
    }
  }

  private moveFocusedDate(deltaDays: number): void {
    this.shiftFocusedDate(addDays(this.focusedDate(), deltaDays));
  }

  private shiftFocusedDate(next: Date): void {
    const normalised = startOfDay(next);
    this.focusedDate.set(normalised);
    if (!isSameMonth(normalised, this.viewDate())) {
      this.viewDate.set(startOfMonth(normalised));
      this.announceMonth();
    }
  }

  private onMonthsKeydown(event: KeyboardEvent): void {
    const key = event.key;
    let handled = true;
    switch (key) {
      case 'ArrowLeft':
        this.moveFocusedMonth(-1);
        break;
      case 'ArrowRight':
        this.moveFocusedMonth(1);
        break;
      case 'ArrowUp':
        this.moveFocusedMonth(-3);
        break;
      case 'ArrowDown':
        this.moveFocusedMonth(3);
        break;
      case 'Home':
        this.focusedMonth.set(0);
        break;
      case 'End':
        this.focusedMonth.set(11);
        break;
      case 'Enter':
      case ' ':
        this.pickMonth(this.focusedMonth());
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
    }
  }

  private moveFocusedMonth(delta: number): void {
    const next = this.focusedMonth() + delta;
    if (next < 0 || next > 11) {
      // Cross the year boundary and follow with the header.
      const target = addMonths(
        new Date(this.viewDate().getFullYear(), this.focusedMonth(), 1),
        delta,
      );
      this.viewDate.set(startOfMonth(target));
      this.focusedMonth.set(target.getMonth());
    } else {
      this.focusedMonth.set(next);
    }
  }

  private onYearsKeydown(event: KeyboardEvent): void {
    const key = event.key;
    let handled = true;
    switch (key) {
      case 'ArrowLeft':
        this.moveFocusedYear(-1);
        break;
      case 'ArrowRight':
        this.moveFocusedYear(1);
        break;
      case 'ArrowUp':
        this.moveFocusedYear(-3);
        break;
      case 'ArrowDown':
        this.moveFocusedYear(3);
        break;
      case 'PageUp':
        this.moveFocusedYear(-YEARS_PER_PAGE);
        break;
      case 'PageDown':
        this.moveFocusedYear(YEARS_PER_PAGE);
        break;
      case 'Enter':
      case ' ':
        this.pickYear(this.focusedYear());
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
    }
  }

  private moveFocusedYear(delta: number): void {
    const next = this.focusedYear() + delta;
    this.focusedYear.set(next);
    // Page the window when focus leaves the visible decade.
    const years = this.yearCells();
    if (next < years[0] || next > years[years.length - 1]) {
      this.viewDate.update((d) => startOfMonth(new Date(next, d.getMonth(), 1)));
    }
  }

  protected isFocusedMonth(index: number): boolean {
    return this.view() === 'months' && index === this.focusedMonth();
  }

  protected isFocusedYear(year: number): boolean {
    return this.view() === 'years' && year === this.focusedYear();
  }

  protected isCurrentMonth(index: number): boolean {
    return (
      this.viewDate().getFullYear() === this.value()?.getFullYear() &&
      index === this.value()?.getMonth()
    );
  }

  protected isCurrentYear(year: number): boolean {
    return year === this.value()?.getFullYear();
  }

  private announceMonth(): void {
    this.liveMessage.set(this.monthYearFormatter().format(this.viewDate()));
  }
}
