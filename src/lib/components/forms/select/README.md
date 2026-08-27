# Select (`dm-select`)

Dropdown with a **color × variant** API. Single or multiple selection with chips, an optional inline filter, option groups, and select-all / clear-all. Full keyboard support (arrows, Home/End, Enter, Escape, typeahead), CDK-anchored panel that matches the trigger width, and Reactive Forms via `ControlValueAccessor`. Provide a [`loadFn`](#server-driven-async-mode) instead of `items` and it becomes **server-driven** — paged loading, infinite scroll or a button, and a debounced server search.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
import { DmSelectComponent, DmSelectItem, DmSelectGroup } from '@dmaster/ui';

const pets: DmSelectItem<string>[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog', description: "Man's best friend" },
  { value: 'fish', label: 'Fish', disabled: true },
];
```

## Single select

```html
<dm-select label="Pet" placeholder="Choose one" [items]="pets" [(value)]="pet" />

<dm-select
  variant="bordered"
  color="primary"
  [items]="pets"
  [formControl]="petControl"
  [required]="true"
  description="Only these pets are covered by the insurance."
/>
```

## Multiple select (chips)

Set `multiple` and bind an array with `[(values)]`. The trigger grows with a chip
(reusing `dm-badge`) per selected value; each chip has a remove button and the
panel stays open while you pick. Single-mode `[(value)]` is untouched.

```html
<dm-select
  multiple
  label="Pets"
  placeholder="Pick some pets"
  [items]="pets"
  [(values)]="selectedPets"
  removeAriaLabel="Remove"
/>
```

## Inline filter

Add `filterable` for a search box inside the panel that narrows the options as
you type. `noResultsLabel` renders when nothing matches.

```html
<dm-select
  filterable
  label="Pet"
  [items]="pets"
  [(value)]="pet"
  filterPlaceholder="Search…"
  noResultsLabel="No matches"
/>
```

## Option groups

`items` accepts a mix of flat options and `DmSelectGroup` objects. A group is
rendered as a non-selectable header above its options; a disabled group disables
every option under it. A plain `DmSelectItem[]` remains valid — grouping is purely
additive.

```ts
import { DmSelectGroup } from '@dmaster/ui';

const grouped: DmSelectGroup<string>[] = [
  {
    label: 'Mammals',
    items: [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog' },
    ],
  },
  { label: 'Aquatic', items: [{ value: 'fish', label: 'Fish' }] },
];
```

```html
<dm-select label="Pet" [items]="grouped" [(value)]="pet" />
```

## Select all / clear all

In `multiple` mode, provide `selectAllLabel` and/or `clearAllLabel` to show the
bulk actions at the top of the panel. Select-all fills `values` with every
enabled option; clear-all empties it. Leaving a label empty hides that action.

```html
<dm-select
  multiple
  filterable
  [items]="pets"
  [(values)]="selectedPets"
  selectAllLabel="Select all"
  clearAllLabel="Clear"
/>
```

## Server-driven (async) mode

Provide a `loadFn` **instead of `items`** and `dm-select` loads its options in
pages. It fetches page 0 on first open, paginates with infinite scroll (default)
or a **Load more** button, and — with `filterable` — turns the inline filter into
a **debounced server search**. `loadFn` returns an `Observable`, so an in-flight
request is cancelled automatically whenever the query or page changes (via
Angular's `rxResource`). Works with single **and** `multiple` selection.

```ts
import { DmSelectComponent, DmSelectLoadFn, DmSelectLoadResult } from '@dmaster/ui';

// Works directly with HttpClient — no wrappers needed.
loadUsers: DmSelectLoadFn<string> = ({ page, pageSize, query }) =>
  this.http
    .get<{ data: User[]; total: number }>('/api/users', { params: { page, pageSize, query } })
    .pipe(
      map(
        (res) => ({ items: res.data.map(toItem), total: res.total }) as DmSelectLoadResult<string>,
      ),
    );
```

```html
<dm-select
  label="Assignee"
  filterable
  clearable
  [loadFn]="loadUsers"
  [(value)]="userId"
  filterPlaceholder="Search users…"
  loadingLabel="Loading…"
  noResultsLabel="No users found"
/>

<!-- explicit button instead of infinite scroll -->
<dm-select
  loadMoreMode="button"
  loadMoreLabel="Load more"
  [loadFn]="loadUsers"
  [(value)]="userId"
/>
```

`total` in the result is the full match count across all pages — the component
derives whether more pages remain. The component **caches every item it loads**,
so a selected value's label survives a later search that no longer returns it;
pass `selectedItems` only for a value that was never in any loaded page (e.g. a
persisted selection shown before the first fetch). A failed page never storms the
server: infinite mode stops auto-retrying, and `loadMoreMode="button"` keeps the
button so a click retries the failed page.

## API

| Input                  | Type                                                                          | Default     | Description                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `items`                | `DmSelectOptionOrGroup<T>[]`                                                  | `[]`        | Flat `{ value, label, description?, disabled? }` options or `{ label, items }` groups. Ignored when `loadFn` is set. |
| `multiple`             | `boolean`                                                                     | `false`     | Selects more than one value; chips replace the single-value label.                                                   |
| `value`                | `model<T \| null>`                                                            | `null`      | Two-way state for single mode: `[(value)]` / `(valueChange)`.                                                        |
| `values`               | `model<T[]>`                                                                  | `[]`        | Two-way array for multiple mode: `[(values)]` / `(valuesChange)`.                                                    |
| `filterable`           | `boolean`                                                                     | `false`     | Shows an inline search box in the panel that filters the options.                                                    |
| `filterPlaceholder`    | `string`                                                                      | `''`        | Placeholder for the inline filter input.                                                                             |
| `noResultsLabel`       | `string`                                                                      | `''`        | Message shown when the filter matches no options.                                                                    |
| `selectAllLabel`       | `string`                                                                      | `''`        | Label for the select-all action (multiple mode; hidden if empty).                                                    |
| `clearAllLabel`        | `string`                                                                      | `''`        | Label for the clear-all action (multiple mode; hidden if empty).                                                     |
| `label`                | `string`                                                                      | `''`        | Visible label above the trigger.                                                                                     |
| `placeholder`          | `string`                                                                      | `''`        | Shown while nothing is selected.                                                                                     |
| `description`          | `string`                                                                      | `''`        | Help text below the trigger.                                                                                         |
| `error`                | `string`                                                                      | `''`        | Non-empty activates the invalid state (`aria-invalid`, `role="alert"`).                                              |
| `disabled`             | `boolean`                                                                     | `false`     | Combined with the forms `disabled` state.                                                                            |
| `required`             | `boolean`                                                                     | `false`     | Shows the `*` marker on the label and sets `aria-required`.                                                          |
| `color`                | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Focus ring / selected item highlight.                                                                                |
| `variant`              | `'flat' \| 'bordered' \| 'faded' \| 'underlined'`                             | `'flat'`    | Trigger surface treatment.                                                                                           |
| `size`                 | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Trigger height (32 / 40 / 48px).                                                                                     |
| `radius`               | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`      | Corner rounding.                                                                                                     |
| `ariaLabel`            | `string`                                                                      | `''`        | Accessible name when no visible `label`.                                                                             |
| `clearable`            | `boolean`                                                                     | `false`     | Shows an × button to clear the selection. Keyboard: Delete / Backspace.                                              |
| `clearAriaLabel`       | `string`                                                                      | `'Clear'`   | ARIA label for the clear button.                                                                                     |
| `removeAriaLabel`      | `string`                                                                      | `'Remove'`  | ARIA label prefix for the per-chip remove buttons (multiple mode).                                                   |
| `filterClearAriaLabel` | `string`                                                                      | `'Clear'`   | ARIA label for the filter's clear (×) button.                                                                        |

### Server-driven (async) — set `loadFn` to enable

| Input              | Type                        | Default       | Description                                                                                                          |
| ------------------ | --------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `loadFn`           | `DmSelectLoadFn<T> \| null` | `null`        | Fetch fn `({ page, pageSize, query }) => Observable<DmSelectLoadResult<T>>`. Enables async mode; `items` is ignored. |
| `pageSize`         | `number`                    | `20`          | Items requested per page.                                                                                            |
| `searchDebounceMs` | `number`                    | `250`         | Quiet ms before the filter text reloads page 0 (with `filterable`).                                                  |
| `loadMoreMode`     | `'infinite' \| 'button'`    | `'infinite'`  | Infinite scroll (IntersectionObserver) or an explicit **Load more** button.                                          |
| `loadMoreLabel`    | `string`                    | `'Load more'` | Label of the Load-more button.                                                                                       |
| `loadingLabel`     | `string`                    | `'Loading…'`  | Label for the loading row and the polite live region.                                                                |
| `selectedItems`    | `DmSelectItem<T>[]`         | `[]`          | Known items to resolve labels for a value never loaded (e.g. a persisted selection).                                 |

Types: `DmSelectLoadFn<T>`, `DmSelectLoadResult<T>` (`{ items, total }`), `DmSelectLoadMoreMode`.

Global defaults: `provideSelectDefaults({...})` / `SELECT_DEFAULTS` (`pageSize`, `searchDebounceMs`, `loadMoreMode` included).

## Accessibility

- Trigger with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- Panel with `role="listbox"`; each option `role="option"` with `aria-selected` and `aria-disabled`. In multiple mode the listbox reports `aria-multiselectable`.
- Group headers are non-selectable and skipped by keyboard navigation.
- Full keyboard: **Enter/Space** open (or select while open), **ArrowUp/Down** move, **Home/End** jump, **Tab** leaves naturally, printable characters trigger typeahead (disabled while `filterable`, where typing filters instead). **Escape** closes; while a filter has text the first Escape clears it and the second closes.
- Error uses `role="alert"`; the trigger reflects `aria-invalid="true"` and links to the error text via `aria-describedby`.
- Disabled items are skipped by keyboard navigation and cannot be clicked.
- Each chip's remove button carries an `aria-label` derived from `removeAriaLabel` plus the option label.
- Async mode announces loading and empty-result states through a polite live region; in `loadMoreMode="button"` a keyboard user pages by pressing **ArrowDown** on the last loaded option.

## Design tokens

| Token                           | Default                                                   | Description                                                               |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `--dm-select-bg`                | `var(--dm-bg-muted)`                                      | Trigger surface background (flat and faded variants).                     |
| `--dm-select-bg-hover`          | `color-mix(in srgb, var(--dm-fg) 6%, var(--dm-bg-muted))` | Trigger background on hover.                                              |
| `--dm-select-bg-focus`          | `var(--dm-bg-elevated)`                                   | Trigger background while focused or open.                                 |
| `--dm-select-border`            | `var(--dm-border-strong)` (`var(--dm-border)` in faded)   | Border color of the bordered and faded variants.                          |
| `--dm-select-radius`            | `var(--dm-radius-md)`                                     | Corner radius of the trigger (applies to the default `radius="md"`).      |
| `--dm-select-height`            | `2.5rem`                                                  | Trigger height (min-height in multiple mode) for the default `size="md"`. |
| `--dm-select-placeholder-color` | `var(--dm-fg-subtle)`                                     | Placeholder text color while nothing is selected.                         |
| `--dm-select-chevron-color`     | `var(--dm-fg-muted)`                                      | Color of the trailing chevron icon.                                       |
