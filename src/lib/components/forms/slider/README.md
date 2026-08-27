# Slider (`dm-slider`)

Single-value range slider with an elastic thumb. Drag it, click anywhere on the track to jump, or drive it entirely from the keyboard. Works standalone with `[(value)]` and with Angular forms via `ControlValueAccessor`. No Angular Material dependency.

## Usage

```ts
import { DmSliderComponent } from '@dmaster/ui';
```

```html
<!-- Two-way binding -->
<dm-slider [(value)]="volume" ariaLabel="Volume" />

<!-- Bounds, granularity and a value bubble -->
<dm-slider [min]="0" [max]="500" [step]="10" [showValueLabel]="true" ariaLabel="Price" />

<!-- Ticks with labels -->
<dm-slider
  [(value)]="level"
  [step]="25"
  [marks]="[{ value: 0, label: 'Low' }, { value: 50 }, { value: 100, label: 'High' }]"
/>

<!-- Reactive forms -->
<dm-slider [formControl]="price" [min]="0" [max]="1000" [step]="50" />

<!-- Custom formatting for the bubble and aria-valuetext -->
<dm-slider
  [(value)]="budget"
  [showValueLabel]="true"
  [formatValue]="asCurrency"
  ariaLabel="Budget"
/>
```

## API

| Input            | Type                                                                          | Default     | Description                                                                             |
| ---------------- | ----------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `value`          | `number`                                                                      | `0`         | Current value. Two-way (`[(value)]`) and the forms model. Clamped and snapped on write. |
| `min`            | `number`                                                                      | `0`         | Lower bound of the range.                                                               |
| `max`            | `number`                                                                      | `100`       | Upper bound of the range.                                                               |
| `step`           | `number`                                                                      | `1`         | Granularity between values. Decimal steps (`0.1`) snap without float artifacts.         |
| `size`           | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Track height and thumb diameter.                                                        |
| `color`          | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Semantic color of the fill and thumb border.                                            |
| `disabled`       | `boolean`                                                                     | `false`     | Disables the control (combined with the forms `disabled` state).                        |
| `showValueLabel` | `boolean`                                                                     | `false`     | Shows a value bubble over the thumb while dragging, hovering or focused.                |
| `formatValue`    | `(value: number) => string`                                                   | `String`    | Formats the value for the bubble and `aria-valuetext`.                                  |
| `marks`          | `{ value: number; label?: string }[] \| null`                                 | `null`      | Dots on the track (active when `≤ value`), with optional labels below.                  |
| `ariaLabel`      | `string`                                                                      | `''`        | Accessible label of the slider.                                                         |

Two-way `value` also emits `valueChange` for `[(value)]`.

## Global defaults

```ts
providers: [provideSliderDefaults({ size: 'lg', color: 'success', showValueLabel: true })];
```

Or provide `SLIDER_DEFAULTS` directly. Each `dm-slider` reads `size`, `color` and `showValueLabel` from it.

## Theming

Every surface decision is exposed as a `--dm-slider-*` CSS variable — see the
[Design tokens](#design-tokens) table below. The fill and thumb border follow
the `color` input via internal `--dm-slider-color*` variables.

## Accessibility

- The thumb is the focusable control: `role="slider"`, `tabindex` `0` (or `-1` when disabled), and `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext` / `aria-orientation` / `aria-disabled`.
- Keyboard: `ArrowRight` / `ArrowUp` and `ArrowLeft` / `ArrowDown` move by one `step`; `PageUp` / `PageDown` by `(max − min) / 10`; `Home` / `End` jump to the bounds. Handled keys call `preventDefault`.
- Pass `ariaLabel` (or an external `aria-labelledby`) so the control is announced.
- The hit area is padded to at least 44×44px for touch, and `touch-action: none` keeps touch drags on the slider.
- `prefers-reduced-motion: reduce` drops the bubble transition; keyboard moves still glide via the shared motion tokens.

## Non-goals (v1)

- No dual-thumb / range selection.
- No vertical orientation.
- No RTL-specific handling.

## Design tokens

CSS variables, overridable at any scope (global, theme or a subtree). Each one
falls back to the default shown, so nothing changes until you set it:

| Token                           | Default                                                        | Description                             |
| ------------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| `--dm-slider-track-bg`          | `var(--dm-bg-muted)`                                           | Unfilled track surface.                 |
| `--dm-slider-track-radius`      | `var(--dm-radius-full)`                                        | Track (and fill) corner rounding.       |
| `--dm-slider-thumb-bg`          | `var(--dm-bg)`                                                 | Thumb surface.                          |
| `--dm-slider-thumb-border-width`| `2px`                                                          | Width of the thumb's colored border.    |
| `--dm-slider-mark-bg`           | `color-mix(in srgb, var(--dm-fg) 28%, transparent)`            | Inactive track mark dot.                |
| `--dm-slider-mark-bg-active`    | `color-mix(in srgb, var(--dm-slider-color-fg) 85%, transparent)`| Mark dot inside the filled range.      |
| `--dm-slider-bubble-bg`         | `var(--dm-fg)`                                                 | Value bubble surface.                   |
| `--dm-slider-bubble-fg`         | `var(--dm-bg)`                                                 | Value bubble text.                      |
| `--dm-slider-bubble-radius`     | `var(--dm-radius-md)`                                          | Value bubble corner rounding.           |
