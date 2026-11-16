# Spinner (`dm-spinner`)

Indeterminate loading indicator. Inherits `currentColor`; `dm-button` uses it internally.

```html
<dm-spinner />
<dm-spinner size="lg" label="Loading results" />
<dm-spinner size="1em" [strokeWidth]="3" />
```

## API

| Input         | Type                                       | Default | Description                                                   |
| ------------- | ------------------------------------------ | ------- | ------------------------------------------------------------- |
| `size`        | `'sm' \| 'md' \| 'lg' \| number \| string` | `'md'`  | Named size (1rem / 1.5rem / 2rem), px (number) or CSS length. |
| `strokeWidth` | `number`                                   | `2.5`   | Stroke width in viewBox units (24).                           |
| `label`       | `string`                                   | `''`    | Accessible label. Empty → decorative (`aria-hidden`).         |

Global defaults: `provideSpinnerDefaults({...})` / `SPINNER_DEFAULTS`.

## Accessibility

- No `label`: `aria-hidden="true"` (decorative, the context announces loading).
- With `label`: `role="status"` + `aria-label`.
- `prefers-reduced-motion: reduce` stops the rotation (static arc).

## Design tokens

| Token                        | Default        | Description                            |
| ---------------------------- | -------------- | -------------------------------------- |
| `--dm-spinner-color`         | `currentcolor` | Stroke color of the track and the arc. |
| `--dm-spinner-duration`      | `2s`           | One full rotation of the spinner.      |
| `--dm-spinner-track-opacity` | `0.16`         | Opacity of the faint background track. |
