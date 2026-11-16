# DmColorPicker

Rich color picker with a saturation/value plane, a hue rail, an optional alpha
rail, a hex field and preset swatches — all wrapped in a
color × variant trigger that reads as a sibling of the rest of the field family
(`dmInput`, `dm-select`, `dm-date-picker`).

```html
<dm-color-picker label="Brand" [(value)]="brand" [showAlpha]="true" />
```

## Highlights

- **Hex in, hex out.** The value is a plain string, so it drops straight into
  reactive forms and templates. Wired as a `ControlValueAccessor`, so
  `[(ngModel)]` and `[formControl]` both work. `format` switches the emitted
  string to `rgb()` or `hsl()` if hex is not what your API wants.
- **No color library.** The HSV↔RGB↔hex math is a small, pure, dependency-free
  module (`color-utils.ts`). Nothing touches `window`/`document`, so it works
  under SSR/prerender.
- **Fully keyboard-driven.** The SV plane, hue rail and alpha rail are all
  `role="slider"` and respond to the arrow keys (Shift for a larger step,
  Home/End on the rails). Escape closes and returns focus to the trigger.
- **Alpha, opt-in.** `showAlpha` adds the alpha rail and switches the emitted
  value to an 8-digit `#rrggbbaa` hex.

## Value

`value` is a string, normalised to the configured `format` on write. By default
that is a hex string (`#rrggbb`, or `#rrggbbaa` when `showAlpha` is on). `null`
means "no color chosen" and renders the placeholder.

## Output format

`format` picks how the committed value (the model, the CVA `onChange`, and the
trigger text) is serialized:

| `format` | Without alpha  | With `showAlpha`   |
| -------- | -------------- | ------------------ |
| `'hex'`  | `#rrggbb`      | `#rrggbbaa`        |
| `'rgb'`  | `rgb(r g b)`   | `rgb(r g b / a)`   |
| `'hsl'`  | `hsl(h s% l%)` | `hsl(h s% l% / a)` |

```html
<dm-color-picker label="Fill" [(value)]="fill" format="rgb" />
<!-- fill() === 'rgb(120 87 255)' -->
```

`writeValue` (i.e. `[formControl]` / `[(ngModel)]` seeding) accepts **any** of
the three notations regardless of `format` — hex, `rgb()`/`rgba()` and
`hsl()`/`hsla()`, in both legacy comma and modern space/slash syntax — and
re-serializes into the configured `format`. The in-panel hex field always edits
hex, whatever the output `format`.

## Inputs (color specific)

| Input       | Type                      | Default          | Notes                                                 |
| ----------- | ------------------------- | ---------------- | ----------------------------------------------------- |
| `value`     | `string \| null` (model)  | `null`           | Two-way value, serialized in the configured `format`. |
| `showAlpha` | `boolean`                 | `false`          | Adds the alpha rail; appends the alpha part.          |
| `format`    | `'hex' \| 'rgb' \| 'hsl'` | `'hex'`          | Committed serialization — see Output format above.    |
| `swatches`  | `string[]`                | 10-color palette | Preset chips shown in the panel's swatch grid (hex).  |

## Inputs (field family)

`label`, `placeholder`, `description`, `error`, `disabled`, `required`,
`ariaLabel`, `clearable`, `clearAriaLabel`, `color`, `variant`, `size`,
`radius` — identical contract to `dm-select` / `dm-date-picker`.

## Accessibility

- Trigger is a button with `aria-haspopup="dialog"`, `aria-expanded`, and the
  usual label/description/invalid wiring. A swatch chip previews the current
  color (on a checkerboard when it carries alpha).
- Panel is `role="dialog"`; the SV plane, hue rail and alpha rail are each
  `role="slider"` with a descriptive `aria-valuetext`
  (`"Saturation X%, brightness Y%"`, `"Hue N degrees"`, `"Alpha N percent"`).
- A polite live region announces the hex on every change. Escape closes and
  returns focus to the trigger.

## Requirements

Load the CDK structural styles once per app (the overlay panel needs them):

```json
"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", "src/styles.scss"]
```

## Defaults

Override app- or route-wide with the token helper:

```ts
providers: [
  provideColorPickerDefaults({
    showAlpha: true,
    variant: 'bordered',
    swatches: ['#0072f5', '#17c964', '#f31260'],
  }),
];
```

## Design tokens

| Token                              | Default                    | Description                                                   |
| ---------------------------------- | -------------------------- | ------------------------------------------------------------- |
| `--dm-color-picker-trigger-bg`     | `var(--dm-bg-muted)`       | Trigger surface background (default and `faded` variants).    |
| `--dm-color-picker-trigger-fg`     | `var(--dm-fg)`             | Trigger text color.                                           |
| `--dm-color-picker-trigger-radius` | `var(--dm-radius-md)`      | Trigger corner radius (applies at the default `md` radius).   |
| `--dm-color-picker-height`         | `2rem` / `2.5rem` / `3rem` | Trigger height, overriding the `sm` / `md` / `lg` size scale. |
| `--dm-color-picker-panel-bg`       | `var(--dm-bg-elevated)`    | Picker panel background.                                      |
| `--dm-color-picker-panel-width`    | `15rem`                    | Picker panel width.                                           |
| `--dm-color-picker-panel-padding`  | `var(--dm-space-3)`        | Picker panel inner padding.                                   |
| `--dm-color-picker-panel-border`   | `var(--dm-border)`         | Picker panel border color.                                    |
| `--dm-color-picker-panel-radius`   | `var(--dm-radius-lg)`      | Picker panel corner radius.                                   |
| `--dm-color-picker-sv-height`      | `9rem`                     | Height of the saturation/value plane.                         |
