/**
 * Semantic color, shared with the rest of the field family.
 * Drives the focus ring and the selected-day fill.
 */
export type DmDatePickerColor =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Visual variant of the trigger surface (matches `dm-select`). */
export type DmDatePickerVariant = 'flat' | 'bordered' | 'faded' | 'underlined';

/** Corner rounding of the trigger. `full` is pill-shaped. */
export type DmDatePickerRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/** Which grid the calendar panel is currently showing. */
export type DmCalendarView = 'days' | 'months' | 'years';

/** Weekday header label length. */
export type DmWeekdayFormat = 'narrow' | 'short';

/**
 * Leftmost calendar column: an explicit weekday (0 = Sunday … 6 = Saturday) or
 * `'auto'` to derive it from the active locale (Monday in Spain/France,
 * Sunday in the US, Saturday in much of MENA…).
 */
export type DmFirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 'auto';

/**
 * Predicate marking individual days as unselectable — e.g. weekends or a list
 * of holidays. Receives a local-midnight `Date`. Return `true` to disable.
 */
export type DmDateDisabledFn = (date: Date) => boolean;
