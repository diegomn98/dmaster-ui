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
