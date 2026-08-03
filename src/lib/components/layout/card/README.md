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
