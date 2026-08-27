# Form Field (`dm-form-field`) + `dmInput`

Composite form field: label + projected native control + hint/error. The `dmInput` directive styles native `input`/`textarea`/`select`; the wrapper wires `id`, `for`, `aria-describedby` and `aria-invalid` automatically.

```html
<dm-form-field label="Email" hint="Work address preferred" [required]="true">
  <input dmInput type="email" [formControl]="email" />
</dm-form-field>

<dm-form-field label="Email" [error]="email.touched && email.invalid ? 'Invalid email' : ''">
  <input dmInput type="email" [formControl]="email" />
</dm-form-field>
```

## API — `dm-form-field`

| Input      | Type      | Default | Description                                             |
| ---------- | --------- | ------- | ------------------------------------------------------- |
| `label`    | `string`  | `''`    | Visible label, wired to the control with `for`.         |
| `hint`     | `string`  | `''`    | Help text (hidden while `error` is set).                |
| `error`    | `string`  | `''`    | Error text; non-empty activates the error state.        |
| `required` | `boolean` | `false` | Shows the `*` marker (set `required` on the input too). |

`dmInput` has no inputs: it applies the `.dm-input` class (styles live in the global stylesheet, since directives cannot carry styles) and exposes the element for the wiring.

## Notes

- Error display is intentionally dumb: the consumer decides when to show which message (v1). No `NgControl` introspection.
- Error messages use `role="alert"`; `aria-invalid` drives the visual error state of the input.

## Design tokens

| Token                             | Default                                              | Description                              |
| --------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| `--dm-form-field-gap`             | `var(--dm-space-1)`                                  | Vertical gap between label, control and messages. |
| `--dm-form-field-label-fg`        | `var(--dm-fg)`                                       | Color of the label text.                 |
| `--dm-form-field-label-font-size` | `var(--dm-text-sm)`                                  | Font size of the label.                  |
| `--dm-form-field-required-fg`     | `color-mix(in srgb, var(--dm-danger) 85%, var(--dm-fg))` | Color of the required `*` marker.    |
| `--dm-form-field-hint-fg`         | `var(--dm-fg-muted)`                                 | Color of the hint text.                  |
| `--dm-form-field-error-fg`        | `var(--dm-danger)`                                   | Color of the error text.                 |
