# DmSearchField

A text field specialised for search: a leading magnifier icon, a trailing clear
button that appears once there is text, and search semantics (Escape clears,
Enter submits). HeroUI-style `color × variant` API, and a `ControlValueAccessor`
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
