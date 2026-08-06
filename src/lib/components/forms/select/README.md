# Select (`dm-select`)

Single-select dropdown with a HeroUI-style **color × variant** API. Full keyboard support (arrows, Home/End, Enter, Escape, typeahead), CDK-anchored panel that matches the trigger width, and Reactive Forms via `ControlValueAccessor`.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
import { DmSelectComponent, DmSelectItem } from '@dmaster/ui';

const pets: DmSelectItem<string>[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog', description: "Man's best friend" },
  { value: 'fish', label: 'Fish', disabled: true },
];
```

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

## API

| Input         | Type                                                                          | Default     | Description                                                             |
| ------------- | ----------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `items`       | `DmSelectItem<T>[]`                                                           | `[]`        | `{ value, label, description?, disabled? }[]`.                          |
| `value`       | `model<T \| null>`                                                            | `null`      | Two-way state: `[(value)]` / `(valueChange)`.                           |
| `label`       | `string`                                                                      | `''`        | Visible label above the trigger.                                        |
| `placeholder` | `string`                                                                      | `''`        | Shown while nothing is selected.                                        |
| `description` | `string`                                                                      | `''`        | Help text below the trigger.                                            |
| `error`       | `string`                                                                      | `''`        | Non-empty activates the invalid state (`aria-invalid`, `role="alert"`). |
| `disabled`    | `boolean`                                                                     | `false`     | Combined with the forms `disabled` state.                               |
| `required`    | `boolean`                                                                     | `false`     | Shows the `*` marker on the label and sets `aria-required`.             |
| `color`       | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Focus ring / selected item highlight.                                   |
| `variant`     | `'flat' \| 'bordered' \| 'faded' \| 'underlined'`                             | `'flat'`    | Trigger surface treatment.                                              |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Trigger height (32 / 40 / 48px).                                        |
| `radius`      | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`      | Corner rounding.                                                        |
| `ariaLabel`   | `string`                                                                      | `''`        | Accessible name when no visible `label`.                                |

Global defaults: `provideSelectDefaults({...})` / `SELECT_DEFAULTS`.

## Accessibility

- Trigger with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- Panel with `role="listbox"`; each option `role="option"` with `aria-selected` and `aria-disabled`.
- Full keyboard: **Enter/Space** open (or select while open), **Escape** close, **ArrowUp/Down** move, **Home/End** jump, **Tab** leaves naturally, printable characters trigger typeahead.
- Error uses `role="alert"`; the trigger reflects `aria-invalid="true"` and links to the error text via `aria-describedby`.
- Disabled items are skipped by keyboard navigation and cannot be clicked.
