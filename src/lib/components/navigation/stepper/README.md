# Stepper (`dm-stepper` + `dm-step`)

Guides a user through an ordered sequence of steps, one panel at a time. It is a
**navigational list of steps** — not a tablist: each header is a `<button>`, the
active one carries `aria-current="step"`, and each connects to its own panel via
`aria-controls` / `aria-labelledby`. No Angular Material dependency.

## Usage

```ts
import { DmStepperComponent, DmStepComponent } from '@dmaster/ui';
```

```html
<dm-stepper [(activeStep)]="step" color="primary">
  <dm-step label="Account">
    <!-- panel body for step 1 -->
  </dm-step>
  <dm-step label="Shipping" [completed]="shippingDone()">…</dm-step>
  <dm-step label="Payment" optional>…</dm-step>
</dm-stepper>
```

### Linear mode

In `linear` mode a step ahead of the active one is selectable only once every
prior step is `completed`. Going back is always allowed.

```html
<dm-stepper [(activeStep)]="step" linear>
  <dm-step label="Details" [completed]="form.valid">…</dm-step>
  <dm-step label="Review">…</dm-step>
</dm-stepper>
```

Drive progression from your own buttons with `next()` / `previous()`:

```html
<dm-stepper #s [(activeStep)]="step" linear>…</dm-stepper>
<dm-button (click)="s.previous()">Back</dm-button>
<dm-button (click)="s.next()">Continue</dm-button>
```

### Vertical

```html
<dm-stepper orientation="vertical" [(activeStep)]="step">
  <dm-step label="Order placed" completed>…</dm-step>
  <dm-step label="Out for delivery">…</dm-step>
  <dm-step label="Delivered">…</dm-step>
</dm-stepper>
```

### Custom indicator

Project a single `ng-template[dmStepIndicator]` into the stepper to replace the
indicator's inner content (the number / check / error glyph) in **every** step
header. The indicator circle, its state styling and the header button semantics
are kept — the template only swaps what is drawn inside.

```ts
import { DmStepIndicatorDirective } from '@dmaster/ui';
```

```html
<dm-stepper [(activeStep)]="step">
  <ng-template dmStepIndicator let-index="index" let-completed="completed" let-error="error">
    @if (error) { ! } @else if (completed) {
    <dm-icon size="1em">check_circle</dm-icon>
    } @else { {{ index + 1 }} }
  </ng-template>
  <dm-step label="Account">…</dm-step>
  <dm-step label="Shipping">…</dm-step>
</dm-stepper>
```

The context (`DmStepIndicatorContext`) exposes `index`, `active`, `completed`
and `error` for the step being rendered.

## API — `dm-stepper`

| Input / Output                 | Type                                                                          | Default        | Description                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `activeStep`                   | `number` (two-way)                                                            | `0`            | Zero-based index of the active step. `[(activeStep)]`.                                          |
| `orientation`                  | `'horizontal' \| 'vertical'`                                                  | `'horizontal'` | Layout direction.                                                                               |
| `linear`                       | `boolean` (attribute)                                                         | `false`        | Block jumping ahead past an incomplete step.                                                    |
| `color`                        | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'`    | Accent of the active / completed indicators.                                                    |
| `size`                         | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`         | Indicator diameter + type scale.                                                                |
| `ariaLabel`                    | `string`                                                                      | `''`           | Accessible label for the step list.                                                             |
| `completed`                    | `output<void>`                                                                | —              | Fires when `next()` runs on the last reachable step.                                            |
| `ng-template[dmStepIndicator]` | projected template                                                            | —              | Custom indicator content for every step header. Context: `{ index, active, completed, error }`. |
| `next()` / `previous()`        | method                                                                        | —              | Move to the next reachable / previous enabled step.                                             |

## API — `dm-step`

| Input           | Type                  | Default      | Description                                                  |
| --------------- | --------------------- | ------------ | ------------------------------------------------------------ |
| `label`         | `string`              | `''`         | Short label shown in the header.                             |
| `optional`      | `boolean` (attribute) | `false`      | Renders the `optionalLabel` hint under the label.            |
| `optionalLabel` | `string`              | `'Optional'` | Copy for the optional hint (localise from the consumer).     |
| `completed`     | `boolean` (attribute) | `false`      | Shows the check glyph; unlocks later steps in `linear` mode. |
| `error`         | `boolean` (attribute) | `false`      | Warning glyph + danger accent.                               |
| `disabled`      | `boolean` (attribute) | `false`      | Not selectable; keyboard navigation skips it.                |

The projected content of each `<dm-step>` is its panel body, rendered only while
that step is active.

## Global defaults

```ts
providers: [provideStepperDefaults({ orientation: 'vertical', color: 'success' })];
```

Or provide `STEPPER_DEFAULTS` directly.

## Theming

CSS variables set on the container and consumed by the steps:

- `--dm-stepper-accent` / `--dm-stepper-accent-fg` — solid indicator fill + its glyph color.
- `--dm-stepper-accent-soft` — halo behind the active indicator.
- `--dm-stepper-line` — connector rail (turns accent for completed segments).
- `--dm-stepper-ind` / `--dm-stepper-ind-fs` — indicator diameter + number size.

## Accessibility

- Container is `role="list"`; each step is `role="listitem"` with a `<button>` header.
- The active header carries `aria-current="step"`; each header wires `aria-controls`
  to its `role="region"` panel, which is `aria-labelledby` the header.
- Arrow keys (Left/Right, or Up/Down when vertical) move focus between headers;
  `Home` / `End` jump to the first / last enabled step; `Enter` / `Space` activate.
- `disabled` steps use the native disabled button; linear-locked steps expose
  `aria-disabled="true"` while staying focusable.
- Indicator glyphs are `aria-hidden`; state is conveyed by the visible label.
- Motion honors `prefers-reduced-motion`.

## Design tokens

Public CSS custom properties, consumed with local fallbacks — override them at any scope (globally, per theme, or on a subtree) without touching the SCSS. Active / completed indicator fills keep following the semantic accent (the `color` input).

| Token                                  | Default                                       | Description                                                 |
| -------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `--dm-stepper-indicator-bg`            | `var(--dm-bg-muted)`                          | Fill of an upcoming (resting) step indicator.               |
| `--dm-stepper-indicator-fg`            | `var(--dm-fg-muted)`                          | Number / glyph color inside a resting indicator.            |
| `--dm-stepper-indicator-border`        | `var(--dm-border-strong)`                     | Border color of a resting indicator.                        |
| `--dm-stepper-indicator-radius`        | `var(--dm-radius-full)`                       | Indicator corner radius (circle by default).                |
| `--dm-stepper-indicator-shadow-active` | `0 0 0 0.25rem var(--dm-stepper-accent-soft)` | Halo behind the active indicator (set `none` to remove it). |
| `--dm-stepper-label-fg`                | `var(--dm-fg-muted)`                          | Label color of an inactive step.                            |
| `--dm-stepper-label-fg-active`         | `var(--dm-fg)`                                | Label color of the active step.                             |
