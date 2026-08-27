# Switch (`dm-switch`)

Toggle switch (`role="switch"`). Works standalone with `[(checked)]` and with Angular forms via `ControlValueAccessor`.

```html
<dm-switch [(checked)]="notifications">Notifications</dm-switch>
<dm-switch [formControl]="control" ariaLabel="Dark mode" />
<dm-switch size="sm" [disabled]="true">Beta features</dm-switch>
```

## API

| Input       | Type             | Default | Description                                            |
| ----------- | ---------------- | ------- | ------------------------------------------------------ |
| `checked`   | `model<boolean>` | `false` | Two-way state (`[(checked)]` / `(checkedChange)`).     |
| `disabled`  | `boolean`        | `false` | Combined with the forms `disabled` state.              |
| `size`      | `'sm' \| 'md'`   | `'md'`  | Size scale.                                            |
| `inputId`   | `string`         | `''`    | Id of the internal button, for external `<label for>`. |
| `ariaLabel` | `string`         | `''`    | Accessible name when no label content is projected.    |

Global defaults: `provideSwitchDefaults({...})` / `SWITCH_DEFAULTS`.

## Accessibility

- `role="switch"` + `aria-checked`; projected content becomes the label (`aria-labelledby`).
- Without projected label, pass `ariaLabel`.
- ≥44px touch target on the control; thumb motion honors reduced-motion via the duration tokens.

## Design tokens

| Token                                | Default                                                   | Description                          |
| ------------------------------------ | --------------------------------------------------------- | ------------------------------------ |
| `--dm-switch-track-bg`               | `var(--dm-default)`                                       | Track fill when unchecked.           |
| `--dm-switch-track-bg-hover`         | `color-mix(in srgb, var(--dm-fg) 18%, var(--dm-default))` | Track fill on hover while unchecked. |
| `--dm-switch-track-bg-checked`       | `var(--dm-primary)`                                       | Track fill when checked.             |
| `--dm-switch-track-bg-checked-hover` | `var(--dm-primary-hover)`                                 | Track fill on hover while checked.   |
| `--dm-switch-thumb-bg`               | `var(--dm-bg-elevated)`                                   | Thumb fill.                          |
| `--dm-switch-label-fg`               | `var(--dm-fg)`                                            | Color of the projected label text.   |
