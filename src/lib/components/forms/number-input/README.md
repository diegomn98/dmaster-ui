# DmNumberInput

A numeric spinbutton field: a text input (`role="spinbutton"`,
`inputmode="decimal"`) flanked by −/+ buttons, with the full keyboard map
(arrows, Shift+arrows, PageUp/PageDown, Home/End), clamping to `min`/`max`,
precision rounding and optional `Intl.NumberFormat` display while blurred. A
`color × variant` API shared with the rest of the field family, and a
`ControlValueAccessor` so it works with template- and reactive-driven forms.

```ts
import { DmNumberInputComponent } from '@dmaster/ui';
```

## Usage

```html
<dm-number-input label="Quantity" [(value)]="qty" [min]="0" [max]="99" />
```

Two-way binding via `[(value)]`, or wire it to a form:

```html
<dm-number-input
  [formControl]="price"
  label="Price"
  [step]="0.5"
  [formatOptions]="{ style: 'currency', currency: 'EUR' }"
  locale="es-ES"
/>
```

The model always holds the raw number (`number | null`); `formatOptions` only
affects what is displayed while the field is not focused.

## Inputs

| Input             | Type                                                                          | Default      | Description                                                                                       |
| ----------------- | ----------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `value`           | `number \| null` (model)                                                      | `null`       | Two-way numeric value. `null` while empty.                                                        |
| `min`             | `number \| null`                                                              | `null`       | Lower bound (inclusive).                                                                          |
| `max`             | `number \| null`                                                              | `null`       | Upper bound (inclusive).                                                                          |
| `step`            | `number`                                                                      | `1`          | Amount added/removed by the buttons and arrow keys (×10 with Shift / PageUp / PageDown).          |
| `precision`       | `number \| null`                                                              | `null`       | Decimal places the committed value is rounded to. Defaults to the decimals in `step` (and `min`). |
| `label`           | `string`                                                                      | `''`         | Visible label above the field.                                                                    |
| `placeholder`     | `string`                                                                      | `''`         | Placeholder shown while empty.                                                                    |
| `description`     | `string`                                                                      | `''`         | Help text below the field (hidden while `error` is set).                                          |
| `error`           | `string`                                                                      | `''`         | Error text; non-empty activates the invalid state.                                                |
| `disabled`        | `boolean`                                                                     | `false`      | Disables the field (combined with the forms `disabled` state).                                    |
| `readonly`        | `boolean`                                                                     | `false`      | Read-only: value visible, buttons and stepping off.                                               |
| `required`        | `boolean`                                                                     | `false`      | Shows the required marker and sets `aria-required`.                                               |
| `hideControls`    | `boolean`                                                                     | `false`      | Hides the −/+ buttons. Keyboard stepping keeps working.                                           |
| `color`           | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'`  | Focus ring + caret color.                                                                         |
| `variant`         | `'flat' \| 'bordered' \| 'faded' \| 'underlined'`                             | `'flat'`     | Visual variant of the surface.                                                                    |
| `size`            | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`       | Field height scale (32 / 40 / 48px).                                                              |
| `radius`          | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`       | Corner rounding (`full` = pill).                                                                  |
| `formatOptions`   | `Intl.NumberFormatOptions \| null`                                            | `null`       | Display format while blurred (e.g. currency, percent, unit).                                      |
| `locale`          | `string \| undefined`                                                         | `undefined`  | BCP-47 locale for `formatOptions`; runtime default when omitted.                                  |
| `name`            | `string`                                                                      | `''`         | `name` for the native input.                                                                      |
| `ariaLabel`       | `string`                                                                      | `''`         | ARIA label for fields without a visible `label`.                                                  |
| `ariaDescribedby` | `string`                                                                      | `''`         | Extra `aria-describedby` id(s), e.g. an external `<dm-error>`.                                    |
| `decrementLabel`  | `string`                                                                      | `'Decrease'` | ARIA label of the − button.                                                                       |
| `incrementLabel`  | `string`                                                                      | `'Increase'` | ARIA label of the + button.                                                                       |

## Outputs

| Output        | Payload          | Fires when                                                        |
| ------------- | ---------------- | ----------------------------------------------------------------- |
| `valueCommit` | `number \| null` | A value is committed (blur, Enter or a step) — also fires `null`. |

## Methods

- `focus()` — programmatically focus the input.

## Behaviour

- Typing is free-form; the text is parsed, clamped to `min`/`max` and rounded
  to `precision` on **blur**, **Enter** or when stepping. `.` and `,` are both
  accepted as decimal separators. Unparsable text reverts to the previous
  value; an empty field commits `null`. **Escape** reverts uncommitted typing.
- **ArrowUp/ArrowDown** step by `step`; **Shift+Arrow** and **PageUp/PageDown**
  step by `step × 10`; **Home/End** jump to `min`/`max` when set.
- Press-and-hold on a −/+ button repeats the step.

## Defaults

Override every `dm-number-input` app- or route-wide:

```ts
providers: [
  provideNumberInputDefaults({
    variant: 'bordered',
    decrementLabel: 'Disminuir',
    incrementLabel: 'Aumentar',
  }),
];
```

## Accessibility

- The input is `role="spinbutton"` with `aria-valuemin`/`aria-valuemax`/
  `aria-valuenow` (and `aria-valuetext` when `formatOptions` is set).
- The −/+ buttons carry `aria-label`s (`decrementLabel`/`incrementLabel`) and
  are out of the tab order (`tabindex="-1"`) since the keyboard already steps
  from the input; they disable themselves at the bounds.
- With a visible `label` the input is wired via `aria-labelledby`; without one,
  pass `ariaLabel`.
- `error` sets `aria-invalid` and links the message with `aria-describedby`
  (the message is `role="alert"`); `description` links the same way when there
  is no error.

## Design tokens

CSS variables, overridable at any scope (global, theme or a subtree). Each one
falls back to the default shown, so nothing changes until you set it:

| Token                             | Default                                             | Description                                   |
| --------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `--dm-number-input-bg`            | `var(--dm-bg-muted)`                                | Field surface (flat and faded variants).      |
| `--dm-number-input-fg`            | `var(--dm-fg)`                                      | Field text color.                             |
| `--dm-number-input-border`        | `var(--dm-border-strong)`                           | Border color of the bordered variant.         |
| `--dm-number-input-radius`        | `var(--dm-radius-md)`                               | Corner rounding at the default `radius="md"`. |
| `--dm-number-input-bg-focus`      | `var(--dm-bg-elevated)`                             | Field surface while focused.                  |
| `--dm-number-input-step-bg`       | `color-mix(in srgb, var(--dm-fg) 8%, transparent)`  | Fill of the −/+ step buttons.                 |
| `--dm-number-input-step-fg`       | `var(--dm-fg-muted)`                                | Glyph color of the −/+ step buttons.          |
| `--dm-number-input-step-hover-bg` | `color-mix(in srgb, var(--dm-fg) 16%, transparent)` | Fill of the −/+ step buttons on hover.        |
