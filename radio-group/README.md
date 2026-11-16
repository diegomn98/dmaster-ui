# Radio group (`dm-radio-group` + `dm-radio`)

Single-choice radio group with a color × size API. The group is the
`ControlValueAccessor` — items just declare their `value`. Keyboard navigation
follows the WAI-ARIA roving-tabindex pattern (only the selected radio is a tab
stop; arrows move focus AND selection).

```html
<dm-radio-group name="plan" [(value)]="plan" ariaLabel="Pricing plan">
  <dm-radio value="free">Free</dm-radio>
  <dm-radio value="pro">Pro</dm-radio>
  <dm-radio value="team" [disabled]="true">Team</dm-radio>
</dm-radio-group>

<dm-radio-group name="theme" [formControl]="theme" color="secondary" size="lg">
  <dm-radio value="light">Light</dm-radio>
  <dm-radio value="dark">Dark</dm-radio>
</dm-radio-group>
```

## API — `dm-radio-group`

| Input         | Type                                                                          | Default      | Description                                                                                              |
| ------------- | ----------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                                                      | auto id      | Attribute `name` of a hidden input for plain `<form>` submission. Optional — defaults to a generated id. |
| `value`       | `model<unknown>`                                                              | `null`       | Two-way selected value (`[(value)]` / `(valueChange)`).                                                  |
| `disabled`    | `boolean`                                                                     | `false`      | Disables every radio (combined with the forms `disabled`).                                               |
| `color`       | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'`  | Semantic color applied to every child radio.                                                             |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`       | Size applied to every child radio.                                                                       |
| `orientation` | `'vertical' \| 'horizontal'`                                                  | `'vertical'` | Layout direction of the radio items.                                                                     |
| `ariaLabel`   | `string`                                                                      | `''`         | Accessible label when there's no visible caption.                                                        |

Global defaults: `provideRadioDefaults({...})` / `RADIO_DEFAULTS`.

## API — `dm-radio`

| Input      | Type                 | Default | Description                                                            |
| ---------- | -------------------- | ------- | ---------------------------------------------------------------------- |
| `value`    | `unknown` (required) | —       | Value this radio contributes when selected.                            |
| `disabled` | `boolean`            | `false` | Disables just this option (combined with the group's).                 |
| `inputId`  | `string`             | `''`    | Id exposed for external `<label for>` (falls back to a generated one). |

## Accessibility

- Group renders with `role="radiogroup"` + `aria-orientation`; pass `ariaLabel`
  when there's no visible label.
- Each item is `role="radio"` with `aria-checked` and roving tabindex — only the
  selected radio (or the first enabled one when nothing is selected) is
  focusable via Tab.
- Arrow keys (`ArrowDown` / `ArrowRight` / `ArrowUp` / `ArrowLeft`) move focus
  AND select; `Home` / `End` jump to the first / last enabled radio;
  `Space` / `Enter` (re)select the focused radio.
- ≥44px touch target on each radio; dot animation honors reduced-motion via the
  duration tokens.

## Design tokens

| Token                  | Default                                              | Description                            |
| ---------------------- | ---------------------------------------------------- | -------------------------------------- |
| `--dm-radio-group-gap` | `var(--dm-space-3)` (`var(--dm-space-4)` horizontal) | Gap between the radios in the group.   |
| `--dm-radio-size`      | `1rem` / `1.25rem` / `1.5rem` (sm / md / lg)         | Diameter of the radio control circle.  |
| `--dm-radio-dot-size`  | `0.5rem` / `0.625rem` / `0.75rem` (sm / md / lg)     | Diameter of the inner selected dot.    |
| `--dm-radio-border`    | `var(--dm-border-strong)`                            | Border color of the unchecked control. |
| `--dm-radio-label-fg`  | `var(--dm-fg)`                                       | Color of the projected label text.     |
