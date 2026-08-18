# DmDatePicker

Single-date calendar picker with a HeroUI-style color × variant API. Reads as a
sibling of the rest of the field family (`dmInput`, `dm-select`,
`dm-search-field`) and is fully keyboard- and screen-reader-driven.

```html
<dm-date-picker label="Start date" [(value)]="start" [min]="today" />
```

## Highlights

- **No date library.** Calendar math is a small, pure, timezone-safe module;
  all month/weekday names and the trigger text come from `Intl.DateTimeFormat`.
  Nothing touches `window`/`document`, so it works under SSR/prerender.
- **Speaks the user's language.** Pass `locale` (BCP-47) and the whole calendar
  follows it: weekday headers, month names, the selected-date text, the day
  digits (native numerals for `ar`/`fa`…), **and the week convention** —
  `firstDayOfWeek` defaults to `'auto'`, so Spain/France start on Monday, the
  US on Sunday, and much of MENA on Saturday, straight from CLDR week data
  (`Intl.Locale` week info, with a compact built-in fallback).
- **Layered navigation.** Click the header to climb **day → month → year**;
  arrows roam each grid, PageUp/Down change month, Shift+PageUp/Down change year.
- **Constraints.** `min` / `max` and an arbitrary `isDateDisabled` predicate
  (weekends, holidays…) block selection while still letting the user browse.

## Value

`value` is a native `Date | null`, normalised to **local midnight** (time
stripped) so it round-trips cleanly through reactive forms. Wired as a
`ControlValueAccessor`, so `[(ngModel)]` and `[formControl]` both work.

## Inputs (selection)

| Input             | Type                          | Default   | Notes                                             |
| ----------------- | ----------------------------- | --------- | ------------------------------------------------- |
| `value`           | `Date \| null` (model)        | `null`    | Two-way selected date.                            |
| `min` / `max`     | `Date \| null`                | `null`    | Inclusive selectable bounds.                      |
| `isDateDisabled`  | `(date: Date) => boolean`     | `null`    | Disable arbitrary days.                           |
| `firstDayOfWeek`  | `0…6 \| 'auto'`               | `'auto'`  | Leftmost column; `'auto'` follows the locale.     |
| `locale`          | `string`                      | runtime   | BCP-47 locale for all names/formatting.           |
| `displayFormat`   | `Intl.DateTimeFormatOptions`  | `{y,m,d}` | How the trigger renders the selected date.        |
| `weekdayFormat`   | `'narrow' \| 'short'`         | `'short'` | Weekday header length.                            |
| `showTodayButton` | `boolean`                     | `true`    | "Today" quick-jump in the footer.                 |
| `closeOnSelect`   | `boolean`                     | `true`    | Close the panel right after picking a day.        |

## Inputs (field family)

`label`, `placeholder`, `description`, `error`, `disabled`, `required`,
`ariaLabel`, `clearable`, `clearAriaLabel`, `color`, `variant`, `size`,
`radius` — identical contract to `dm-select`.

## Accessibility

- Trigger is a button with `aria-haspopup="dialog"`, `aria-expanded`, and the
  usual label/description/invalid wiring.
- Panel is `role="dialog"`; the calendar is a `role="grid"` with `columnheader`
  weekdays and `gridcell` days carrying a localised full-date `aria-label`,
  `aria-selected`, `aria-disabled`, and `aria-current="date"` for today.
- Roving-tabindex focus follows the arrow keys; Escape closes and returns focus
  to the trigger. A polite live region announces month changes.

## Requirements

Load the CDK structural styles once per app (the overlay panel needs them):

```json
"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", "src/styles.scss"]
```

## Global locale (multi-language apps)

The reactive analogue of Material's `MAT_DATE_LOCALE`. Provide `DM_DATE_LOCALE`
once and every `dm-date-picker` follows it — no per-instance `locale`:

```ts
// Static:
providers: [provideDateLocale('es')];

// Reactive — pass a Signal<string> and all pickers re-render live when the
// app language changes (names, digits, trigger text AND week convention):
providers: [provideDateLocale(inject(MyI18nService).locale)];
```

A per-instance `locale` input still wins over the token when you need to pin one
picker to a fixed language.

## Defaults

Override app-wide with the token or helper (now also covers `displayFormat` and
`weekdayFormat`):

```ts
providers: [
  provideDatePickerDefaults({
    firstDayOfWeek: 1,
    variant: 'bordered',
    displayFormat: { dateStyle: 'long' },
  }),
];
```
