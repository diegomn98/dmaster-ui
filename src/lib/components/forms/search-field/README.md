# DmSearchField

A text field specialised for search: a leading magnifier icon, a trailing clear
button that appears once there is text, and search semantics (Escape clears,
Enter submits). A `color × variant` API, and a `ControlValueAccessor`
so it works with template- and reactive-driven forms.

```ts
import { DmSearchFieldComponent } from '@dmaster/ui';
```

## Usage

```html
<dm-search-field
  label="Search"
  placeholder="Search components…"
  [(value)]="query"
  (searchSubmit)="run($event)"
  (cleared)="reset()"
/>
```

Two-way binding via `[(value)]`, or wire it to a form:

```html
<dm-search-field [formControl]="queryControl" ariaLabel="Search" />
```

## Inputs

| Input            | Type                                                                          | Default          | Description                                                  |
| ---------------- | ----------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------ |
| `value`          | `string` (model)                                                              | `''`             | Two-way text value.                                          |
| `label`          | `string`                                                                      | `''`             | Visible label above the field.                               |
| `placeholder`    | `string`                                                                      | `''`             | Placeholder shown while empty.                               |
| `description`    | `string`                                                                      | `''`             | Help text below the field (hidden while `error` is set).     |
| `error`          | `string`                                                                      | `''`             | Error text; non-empty activates the invalid state.           |
| `disabled`       | `boolean`                                                                     | `false`          | Disables the field.                                          |
| `readOnly`       | `boolean`                                                                     | `false`          | Read-only (no clear button, not editable).                   |
| `required`       | `boolean`                                                                     | `false`          | Shows the required marker.                                   |
| `clearable`      | `boolean`                                                                     | `true`           | Shows the × button (and Escape-to-clear) once there is text. |
| `color`          | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'`      | Focus ring + caret color.                                    |
| `variant`        | `'flat' \| 'bordered' \| 'faded' \| 'underlined'`                             | `'flat'`         | Visual variant of the surface.                               |
| `size`           | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`           | Field height scale.                                          |
| `radius`         | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`           | Corner rounding (`full` = pill).                             |
| `name`           | `string`                                                                      | `''`             | `name` for the native input.                                 |
| `ariaLabel`      | `string`                                                                      | `''`             | ARIA label for fields without a visible `label`.             |
| `clearAriaLabel` | `string`                                                                      | `'Clear search'` | ARIA label for the clear button.                             |

## Outputs

| Output         | Payload  | Fires when                                 |
| -------------- | -------- | ------------------------------------------ |
| `searchSubmit` | `string` | The user presses Enter.                    |
| `cleared`      | `void`   | The field is cleared (× button or Escape). |

## Methods

- `focus()` — programmatically focus the input.

## Defaults

Override every `dm-search-field` app- or route-wide:

```ts
providers: [provideSearchFieldDefaults({ variant: 'bordered', radius: 'md' })];
```

## Accessibility

- The clear button carries an `aria-label` (`clearAriaLabel`) and is taken out of
  the tab order (`tabindex="-1"`) since **Escape** already clears from the input.
- With a visible `label` the input is wired via `aria-labelledby`; without one,
  pass `ariaLabel`.
- `error` sets `aria-invalid` on the input and links the message with
  `aria-describedby` (the message is `role="alert"`); `description` links the
  same way when there is no error.

## Design tokens

| Token                                 | Default                                                   | Description                                                        |
| ------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `--dm-search-field-bg`                | `var(--dm-bg-muted)`                                      | Field surface background (flat and faded variants).                |
| `--dm-search-field-bg-hover`          | `color-mix(in srgb, var(--dm-fg) 6%, var(--dm-bg-muted))` | Field background on hover.                                         |
| `--dm-search-field-bg-focus`          | `var(--dm-bg-elevated)`                                   | Field background while focused.                                    |
| `--dm-search-field-fg`                | `var(--dm-fg)`                                            | Text color of the field and its input.                             |
| `--dm-search-field-border`            | `var(--dm-border-strong)` (`var(--dm-border)` in faded)   | Border color of the bordered and faded variants.                   |
| `--dm-search-field-radius`            | `var(--dm-radius-md)`                                     | Corner radius of the field (applies to the default `radius="md"`). |
| `--dm-search-field-height`            | `2.5rem`                                                  | Field height for the default `size="md"`.                          |
| `--dm-search-field-placeholder-color` | `var(--dm-fg-subtle)`                                     | Placeholder text color.                                            |
| `--dm-search-field-icon-color`        | `var(--dm-fg-subtle)`                                     | Color of the leading magnifier icon.                               |
