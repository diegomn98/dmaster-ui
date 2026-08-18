# DmColorPicker

Rich color picker with a saturation/value plane, a hue rail, an optional alpha
rail, a hex field and preset swatches — all wrapped in a HeroUI-style
color × variant trigger that reads as a sibling of the rest of the field family
(`dmInput`, `dm-select`, `dm-date-picker`).

```html
<dm-color-picker label="Brand" [(value)]="brand" [showAlpha]="true" />
```

## Highlights

- **Hex in, hex out.** The value is a plain string, so it drops straight into
  reactive forms and templates. Wired as a `ControlValueAccessor`, so
  `[(ngModel)]` and `[formControl]` both work.
- **No color library.** The HSV↔RGB↔hex math is a small, pure, dependency-free
  module (`color-utils.ts`). Nothing touches `window`/`document`, so it works
  under SSR/prerender.
- **Fully keyboard-driven.** The SV plane, hue rail and alpha rail are all
  `role="slider"` and respond to the arrow keys (Shift for a larger step,
  Home/End on the rails). Escape closes and returns focus to the trigger.
- **Alpha, opt-in.** `showAlpha` adds the alpha rail and switches the emitted
  value to an 8-digit `#rrggbbaa` hex.

## Value

`value` is a hex string (`#rrggbb`, or `#rrggbbaa` when `showAlpha` is on),
normalised (lowercase, canonical form) on write. `null` means "no color chosen"
and renders the placeholder.

## Inputs (color specific)

| Input       | Type                     | Default          | Notes                                                |
| ----------- | ------------------------ | ---------------- | ---------------------------------------------------- |
| `value`     | `string \| null` (model) | `null`           | Two-way hex value.                                   |
| `showAlpha` | `boolean`                | `false`          | Adds the alpha rail; emits `#rrggbbaa`.              |
| `swatches`  | `string[]`               | 10-color palette | Preset chips shown in the panel's swatch grid (hex). |

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
