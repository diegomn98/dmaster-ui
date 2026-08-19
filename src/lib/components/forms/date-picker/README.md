# DmDatePicker

Single-date **or date-range** calendar picker with a color × variant API. Reads
as a sibling of the rest of the field family (`dmInput`, `dm-select`,
`dm-search-field`) and is fully keyboard- and screen-reader-driven.

```html
<!-- Single date -->
<dm-date-picker label="Start date" [(value)]="start" [min]="today" />

<!-- Date range (opt-in; single mode is unchanged) -->
<dm-date-picker range label="Stay" [(rangeValue)]="stay" />
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

## Range mode

Add the `range` attribute to switch the picker into date-range selection. The
selection then flows through a **separate** two-way model, `rangeValue`, so
single mode stays 100% backward-compatible (same pattern as `dm-select`'s
`multiple` + `values`).

```html
<dm-date-picker range [(rangeValue)]="stay" />
```

`rangeValue` is a `DmDateRange | null`:

```ts
interface DmDateRange {
  start: Date | null; // inclusive first day (local midnight)
  end: Date | null; // inclusive last day, null while only a start is chosen
}
```

Interaction, on a single-month calendar (navigate months between the two clicks):

- **First click** sets `{ start, end: null }` and keeps the panel open.
- **Second click on/after the start** completes `{ start, end }` and closes
  (honouring `closeOnSelect`). A click **before** the start restarts the range.
- **Hovering** (or roving keyboard focus, via Enter/Space + arrows) **previews**
  the tentative band between the chosen start and the hovered day.
- `min` / `max` / `isDateDisabled` apply in both modes; disabled days can't be
  endpoints and are excluded from the band.
- The trigger shows `"{start} – {end}"` (or `"{start} – …"` while picking),
  formatted with the same `displayFormat` / locale as single mode.

Day cells expose these state attributes for styling: `data-range-start`,
`data-range-end`, `data-in-range`, and `data-in-range-preview`.

## Inputs (selection)

| Input             | Type                          | Default   | Notes                                               |
| ----------------- | ----------------------------- | --------- | --------------------------------------------------- |
| `value`           | `Date \| null` (model)        | `null`    | Two-way selected date (single mode).                |
| `range`           | `boolean` (attribute)         | `false`   | Switch to date-range mode.                          |
| `rangeValue`      | `DmDateRange \| null` (model) | `null`    | Two-way selected range (range mode).                |
| `min` / `max`     | `Date \| null`                | `null`    | Inclusive selectable bounds (both modes).           |
| `isDateDisabled`  | `(date: Date) => boolean`     | `null`    | Disable arbitrary days (both modes).                |
| `firstDayOfWeek`  | `0…6 \| 'auto'`               | `'auto'`  | Leftmost column; `'auto'` follows the locale.       |
| `locale`          | `string`                      | runtime   | BCP-47 locale for all names/formatting.             |
| `displayFormat`   | `Intl.DateTimeFormatOptions`  | `{y,m,d}` | How the trigger renders each date.                  |
| `weekdayFormat`   | `'narrow' \| 'short'`         | `'short'` | Weekday header length.                              |
| `showTodayButton` | `boolean`                     | `true`    | "Today" quick-jump in the footer.                   |
| `closeOnSelect`   | `boolean`                     | `true`    | Close after picking (a day, or completing a range). |

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
