# DmError

A validation error line for form fields — the standalone,
A projected, accessible validation-error line for form fields.

```html
<dm-error>Email is required</dm-error>
```

## Behaviour

- Renders in danger color with a subtle entrance animation (off under
  `prefers-reduced-motion`).
- Host carries `role="alert"`, so screen readers announce it the moment it is
  inserted — render it conditionally (`@if`) when validation fails.
- The content is **fully projected**, so it accepts plain text, rich markup,
  or your own icon. `dm-error` carries **no icon of its own** — add one when
  you want one:

  ```html
  <dm-error><dm-icon name="warning" size="sm" />Email is required</dm-error>
  ```

  The host is `display: flex` with a small gap, so whatever you project lines
  up naturally; size the icon yourself (`dm-icon`'s `size` input, or plain CSS
  on a projected `<svg>`).

- The host `id` can be referenced from a control's `aria-describedby`.

## Inside `dm-form-field`

Drop it in and the field positions it under the control and wires
`aria-describedby` / the invalid state automatically:

```html
<dm-form-field label="Email">
  <input dmInput [formControl]="email" />
  @if (email.touched && email.hasError('required')) {
  <dm-error>Email is required</dm-error>
  }
</dm-form-field>
```

## Inputs

| Input  | Type           | Default | Notes                 |
| ------ | -------------- | ------- | --------------------- |
| `size` | `'sm' \| 'md'` | `'sm'`  | Text scale (xs / sm). |

## Defaults

```ts
providers: [provideErrorDefaults({ size: 'md' })];
```

## Design tokens

| Token                    | Default                                      | Description                            |
| ------------------------ | -------------------------------------------- | -------------------------------------- |
| `--dm-error-fg`          | `var(--dm-danger-text)`                      | Text color of the error message.       |
| `--dm-error-gap`         | `0.3em`                                      | Gap between a projected icon and text. |
| `--dm-error-font-size`   | `var(--dm-text-xs)` (`var(--dm-text-sm)` md) | Font size per size variant.            |
| `--dm-error-font-weight` | `var(--dm-font-medium)`                      | Font weight of the error message.      |
