# Select (`dm-select`)

Dropdown with a **color × variant** API. Single or multiple selection with chips, an optional inline filter, option groups, and select-all / clear-all. Full keyboard support (arrows, Home/End, Enter, Escape, typeahead), CDK-anchored panel that matches the trigger width, and Reactive Forms via `ControlValueAccessor`.

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

## API

| Input               | Type                                                                          | Default     | Description                                                                            |
| ------------------- | ----------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `items`             | `DmSelectOptionOrGroup<T>[]`                                                  | `[]`        | Flat `{ value, label, description?, disabled? }` options or `{ label, items }` groups. |
| `multiple`          | `boolean`                                                                     | `false`     | Selects more than one value; chips replace the single-value label.                     |
| `value`             | `model<T \| null>`                                                            | `null`      | Two-way state for single mode: `[(value)]` / `(valueChange)`.                          |
| `values`            | `model<T[]>`                                                                  | `[]`        | Two-way array for multiple mode: `[(values)]` / `(valuesChange)`.                      |
| `filterable`        | `boolean`                                                                     | `false`     | Shows an inline search box in the panel that filters the options.                      |
| `filterPlaceholder` | `string`                                                                      | `''`        | Placeholder for the inline filter input.                                               |
| `noResultsLabel`    | `string`                                                                      | `''`        | Message shown when the filter matches no options.                                      |
| `selectAllLabel`    | `string`                                                                      | `''`        | Label for the select-all action (multiple mode; hidden if empty).                      |
| `clearAllLabel`     | `string`                                                                      | `''`        | Label for the clear-all action (multiple mode; hidden if empty).                       |
| `label`             | `string`                                                                      | `''`        | Visible label above the trigger.                                                       |
| `placeholder`       | `string`                                                                      | `''`        | Shown while nothing is selected.                                                       |
| `description`       | `string`                                                                      | `''`        | Help text below the trigger.                                                           |
| `error`             | `string`                                                                      | `''`        | Non-empty activates the invalid state (`aria-invalid`, `role="alert"`).                |
| `disabled`          | `boolean`                                                                     | `false`     | Combined with the forms `disabled` state.                                              |
| `required`          | `boolean`                                                                     | `false`     | Shows the `*` marker on the label and sets `aria-required`.                            |
| `color`             | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Focus ring / selected item highlight.                                                  |
| `variant`           | `'flat' \| 'bordered' \| 'faded' \| 'underlined'`                             | `'flat'`    | Trigger surface treatment.                                                             |
| `size`              | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Trigger height (32 / 40 / 48px).                                                       |
| `radius`            | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`      | Corner rounding.                                                                       |
| `ariaLabel`         | `string`                                                                      | `''`        | Accessible name when no visible `label`.                                               |
| `clearable`         | `boolean`                                                                     | `false`     | Shows an × button to clear the selection. Keyboard: Delete / Backspace.                |
| `clearAriaLabel`    | `string`                                                                      | `'Clear'`   | ARIA label for the clear button.                                                       |
| `removeAriaLabel`   | `string`                                                                      | `'Remove'`  | ARIA label prefix for the per-chip remove buttons (multiple mode).                     |

Global defaults: `provideSelectDefaults({...})` / `SELECT_DEFAULTS`.

## Accessibility

- Trigger with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- Panel with `role="listbox"`; each option `role="option"` with `aria-selected` and `aria-disabled`. In multiple mode the listbox reports `aria-multiselectable`.
- Group headers are non-selectable and skipped by keyboard navigation.
- Full keyboard: **Enter/Space** open (or select while open), **Escape** close, **ArrowUp/Down** move, **Home/End** jump, **Tab** leaves naturally, printable characters trigger typeahead (disabled while `filterable`, where typing filters instead).
- Error uses `role="alert"`; the trigger reflects `aria-invalid="true"` and links to the error text via `aria-describedby`.
- Disabled items are skipped by keyboard navigation and cannot be clicked.
- Each chip's remove button carries an `aria-label` derived from `removeAriaLabel` plus the option label.
