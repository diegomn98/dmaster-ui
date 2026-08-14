# Progress (`dm-progress`)

Linear progress bar with an optional label row, determinate and indeterminate modes, semantic colors and a striped fill. No Angular Material dependency.

## Usage

```ts
import { DmProgressComponent } from '@dmaster/ui';
```

```html
<!-- Determinate with label and value -->
<dm-progress [value]="64" label="Uploading assets" [showValueLabel]="true" />

<!-- Colors and sizes -->
<dm-progress [value]="30" color="success" size="lg" />

<!-- Indeterminate: omit value (or pass null) -->
<dm-progress label="Syncing" ariaLabel="Syncing your library" />

<!-- Striped fill -->
<dm-progress [value]="70" color="warning" [striped]="true" />

<!-- Custom value formatting (also announced via aria-valuetext) -->
<dm-progress [value]="48" [max]="64" [showValueLabel]="true" [formatValue]="gbFormat" />
```

```ts
protected readonly gbFormat = (value: number, max: number): string => `${value} GB of ${max} GB`;
```

## API

| Input            | Type                                                                          | Default            | Description                                                     |
| ---------------- | ----------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| `value`          | `number \| null`                                                              | `null`             | Current value, clamped to `[0, max]`. `null` = indeterminate.   |
| `max`            | `number`                                                                      | `100`              | Upper bound of the range (lower bound is always 0).             |
| `color`          | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'`        | Semantic color of the fill.                                     |
| `size`           | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`             | Track thickness (0.25 / 0.5 / 0.75 rem).                        |
| `label`          | `string`                                                                      | `''`               | Text shown above the bar.                                       |
| `showValueLabel` | `boolean`                                                                     | `false`            | Shows the formatted value at the end of the label row.          |
| `formatValue`    | `(value: number, max: number) => string`                                      | rounded percentage | Formats the value label (`73%`).                                |
| `striped`        | `boolean`                                                                     | `false`            | Diagonal stripes over the fill (theme-derived, no hard colors). |
| `ariaLabel`      | `string`                                                                      | `''`               | Accessible name. Falls back to `label`.                         |

The radius is always full (pill track and fill) — the HeroUI signature.

## Global defaults

```ts
providers: [provideProgressDefaults({ color: 'success', size: 'lg' })];
```

Or provide `PROGRESS_DEFAULTS` directly.

## Theming

CSS variables (inherit from the global tokens, overridable at any scope):

- `--dm-progress-track` — track surface (defaults to `--dm-bg-muted`).
- `--dm-progress-color` — fill color, mapped from `data-color` (override to use an arbitrary color).

`color="default"` maps the fill to `--dm-fg-subtle` (the neutral surface color would vanish against the muted track).

## Accessibility

- Host is `role="progressbar"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow`.
- While indeterminate, `aria-valuenow` and `aria-valuetext` are omitted, per the ARIA spec.
- `aria-valuetext` mirrors the formatted value, so custom formats (`48 GB of 64 GB`) are announced as written.
- Accessible name comes from `ariaLabel`, falling back to `label`.
- `prefers-reduced-motion: reduce` disables the indeterminate sweep entirely (consistent with `dm-skeleton`): the fill renders as a static, softened full-width bar (55% opacity), which reads as an active tinted track rather than a completed one. Determinate width changes use the global duration tokens, which the theme zeroes under reduced motion.
