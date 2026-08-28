# Checkbox (`dm-checkbox`)

Checkbox built on a real native `<input type="checkbox">` (form semantics intact) with a custom box. Supports indeterminate and Angular forms via `ControlValueAccessor`.

```html
<dm-checkbox [(checked)]="accepted">Accept the terms</dm-checkbox>
<dm-checkbox [formControl]="control" [indeterminate]="someSelected">Select all</dm-checkbox>
```

## API

| Input           | Type             | Default | Description                                                    |
| --------------- | ---------------- | ------- | -------------------------------------------------------------- |
| `checked`       | `model<boolean>` | `false` | Two-way state (`[(checked)]` / `(checkedChange)`).             |
| `color`         | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Semantic color of the checked / indeterminate fill.           |
| `indeterminate` | `boolean`        | `false` | Visual mixed state while not checked (native `indeterminate`). |
| `disabled`      | `boolean`        | `false` | Combined with the forms `disabled` state.                      |
| `inputId`       | `string`         | `''`    | Id of the native input, for external `<label for>`.            |
| `ariaLabel`     | `string`         | `''`    | Accessible name when no label content is projected.            |

## Accessibility

- Real native input: keyboard, focus and form semantics for free.
- Projected content is a real `<label>` wrapping the input.
- ≥44px touch target; check animation honors reduced-motion via the duration tokens.

## Design tokens

| Token                          | Default                      | Description                           |
| ------------------------------ | ---------------------------- | ------------------------------------- |
| `--dm-checkbox-size`           | `1.125rem` (`0.875rem` sm)   | Width and height of the checkbox box. |
| `--dm-checkbox-radius`         | `0.4375rem` (`0.3125rem` sm) | Corner radius of the box.             |
| `--dm-checkbox-bg`             | `var(--dm-bg-elevated)`      | Background of the unchecked box.      |
| `--dm-checkbox-border`         | `var(--dm-border-strong)`    | Border color of the unchecked box.    |
| `--dm-checkbox-fg`             | `var(--dm-primary-fg)`       | Color of the check mark glyph.        |
| `--dm-checkbox-bg-checked`     | `var(--dm-primary)`          | Background fill of the checked box.   |
| `--dm-checkbox-border-checked` | `var(--dm-primary)`          | Border color of the checked box.      |
| `--dm-checkbox-label-fg`       | `var(--dm-fg)`               | Color of the projected label text.    |
