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
| `indeterminate` | `boolean`        | `false` | Visual mixed state while not checked (`aria-checked="mixed"`). |
| `disabled`      | `boolean`        | `false` | Combined with the forms `disabled` state.                      |
| `inputId`       | `string`         | `''`    | Id of the native input, for external `<label for>`.            |
| `ariaLabel`     | `string`         | `''`    | Accessible name when no label content is projected.            |

## Accessibility

- Real native input: keyboard, focus and form semantics for free.
- Projected content is a real `<label>` wrapping the input.
- ≥44px touch target; check animation honors reduced-motion via the duration tokens.
