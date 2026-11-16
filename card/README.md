# Card (`dm-card`)

Surface primitive. Declares `container-type: inline-size` so its content can use container queries against the card instead of the viewport.

```html
<dm-card>…</dm-card>
<dm-card appearance="outlined" padding="lg">…</dm-card>
<dm-card appearance="flat" padding="sm">…</dm-card>
<dm-card [interactive]="true">…</dm-card>
```

## API

| Input         | Type                                 | Default      | Description                     |
| ------------- | ------------------------------------ | ------------ | ------------------------------- |
| `appearance`  | `'elevated' \| 'outlined' \| 'flat'` | `'elevated'` | Surface treatment.              |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg'`     | `'md'`       | Inner padding scale.            |
| `interactive` | `boolean`                            | `false`      | Hover lift for clickable cards. |

Global defaults: `provideCardDefaults({...})` / `CARD_DEFAULTS`.

## Design tokens

Public CSS custom properties (all optional — every one falls back to the built-in value):

| Token               | Default                                                                                     | Description                                   |
| ------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `--dm-card-bg`      | `var(--dm-bg-elevated)` (elevated/outlined) / `var(--dm-bg-muted)` (flat)                   | Card surface color.                           |
| `--dm-card-border`  | `var(--dm-border-strong)`                                                                   | Border color of the `outlined` appearance.    |
| `--dm-card-radius`  | `var(--dm-radius-xl)`                                                                       | Corner rounding.                              |
| `--dm-card-padding` | per `padding` input (`0` / `var(--dm-space-3)` / `var(--dm-space-5)` / `var(--dm-space-8)`) | Inner padding, wins over the `padding` input. |
