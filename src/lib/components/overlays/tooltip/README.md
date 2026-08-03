# Tooltip (`dmTooltip`)

Text tooltip on any element, built on the CDK Overlay. Shows on hover (with delay) and keyboard focus (immediate); Escape closes it. Flips to the opposite side when there is no room.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```html
<button dmTooltip="Copy to clipboard">Copy</button>
<button dmTooltip="Delete" dmTooltipPosition="right">Delete</button>
```

## API

| Input               | Type                                     | Default | Description                        |
| ------------------- | ---------------------------------------- | ------- | ---------------------------------- |
| `dmTooltip`         | `string` (required)                      | —       | Tooltip text. Empty → never shown. |
| `dmTooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred placement (auto-flips).  |

Global defaults (position, `showDelay` 300ms, `hideDelay` 100ms): `provideTooltipDefaults({...})` / `TOOLTIP_DEFAULTS`.

## Theming

`--dm-tooltip-bg` / `--dm-tooltip-fg` (inverted surface by default, theme-aware).

## Accessibility

- Panel with `role="tooltip"`, referenced from the trigger via `aria-describedby` while visible.
- Keyboard: shows on focus, hides on blur and Escape.
- The entrance animation honors reduced-motion via the duration tokens.
