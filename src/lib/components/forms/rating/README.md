# Rating (`dm-rating`)

Star rating control. Hover to preview, click to commit, or drive it entirely from the keyboard. Supports half-star precision, a `readonly` display mode that renders fractional averages (e.g. `3.7`), and a custom glyph. Works standalone with `[(value)]` and with Angular forms via `ControlValueAccessor`. No Angular Material dependency.

## Usage

```ts
import { DmRatingComponent } from '@dmaster/ui';
```

```html
<!-- Two-way binding -->
<dm-rating [(value)]="score" ariaLabel="Rate this product" />

<!-- Half-star precision and a larger scale -->
<dm-rating [(value)]="score" allowHalf [max]="5" size="lg" ariaLabel="Quality" />

<!-- Read-only average (renders a fractional fill) -->
<dm-rating [value]="3.7" readonly ariaLabel="Average rating: 3.7 of 5" />

<!-- Reactive forms -->
<dm-rating [formControl]="score" [max]="10" allowHalf />

<!-- Custom glyph -->
<dm-rating [(value)]="love" character="❤" color="danger" ariaLabel="Favourite" />
```

## API

| Input       | Type                                                                          | Default     | Description                                                                 |
| ----------- | ----------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `value`     | `number`                                                                      | `0`         | Current rating. Two-way (`[(value)]`) and the forms model.                  |
| `max`       | `number`                                                                      | `5`         | Number of stars rendered (the maximum value).                               |
| `allowHalf` | `boolean`                                                                     | `false`     | Enables half-star precision on hover and the keyboard (step becomes `0.5`). |
| `readonly`  | `boolean`                                                                     | `false`     | Display-only: renders fractional fills, no pointer/keyboard interaction.    |
| `disabled`  | `boolean`                                                                     | `false`     | Disables the control (combined with the forms `disabled` state).            |
| `size`      | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Star size scale.                                                            |
| `color`     | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'warning'` | Semantic color of the filled stars.                                         |
| `ariaLabel` | `string`                                                                      | `''`        | Accessible label of the rating.                                             |
| `character` | `string`                                                                      | `''`        | Custom glyph to render instead of the default star (e.g. `'★'`, `'❤'`).     |

| Output       | Type     | Description                                                    |
| ------------ | -------- | -------------------------------------------------------------- |
| `rateChange` | `number` | Emitted when a new rating is committed by pointer or keyboard. |

Two-way `value` also emits `valueChange` for `[(value)]`.

Clicking the currently selected value again clears the rating to `0` (a common toggle-off gesture).

## Global defaults

```ts
providers: [provideRatingDefaults({ max: 10, color: 'primary', allowHalf: true })];
```

Or provide `RATING_DEFAULTS` directly. Each `dm-rating` reads `max`, `size`, `color` and `allowHalf` from it.

## Theming

Every visual knob is exposed as a `--dm-rating-*` CSS variable — see the
[Design tokens](#design-tokens) table below. The filled color also follows the
`color` input via the internal `--dm-rating-color` variable.

## Accessibility

- The host is the focusable control: `role="slider"`, `aria-orientation="horizontal"`, `tabindex` `0` (or `-1` when `readonly`/`disabled`), and `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext` (`"3 of 5 stars"`) / `aria-readonly` / `aria-disabled`.
- Keyboard: `ArrowRight` / `ArrowUp` and `ArrowLeft` / `ArrowDown` move by one step (`0.5` with `allowHalf`, otherwise `1`); `Home` jumps to `0` and `End` to `max`. Handled keys call `preventDefault`.
- Pass `ariaLabel` (or an external `aria-labelledby`) so the control is announced.
- Interactive stars are padded to at least 44×44px for touch.
- The star glyphs are `aria-hidden`; the value is conveyed entirely through the slider aria attributes.
- `prefers-reduced-motion: reduce` drops the fill and press transitions.

## Non-goals (v1)

- No per-star tooltips or labels.
- No RTL-specific handling.
- No clear button (clicking the current value toggles the rating off instead).

## Design tokens

CSS variables, overridable at any scope (global, theme or a subtree). Each one
falls back to the default shown, so nothing changes until you set it:

| Token                     | Default               | Description                                 |
| ------------------------- | --------------------- | ------------------------------------------- |
| `--dm-rating-star-size`   | `1.5rem`              | Star glyph size at the default `size="md"`. |
| `--dm-rating-star-gap`    | `var(--dm-space-1)`   | Gap between stars.                          |
| `--dm-rating-fill`        | `var(--dm-warning)`   | Filled-star color base.                     |
| `--dm-rating-empty-color` | `var(--dm-fg-subtle)` | Empty-star color.                           |
