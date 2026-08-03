# Spinner (`dm-spinner`)

Indeterminate loading indicator. Inherits `currentColor`; `dm-loading-button` uses it internally.

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
