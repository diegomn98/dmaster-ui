# Tooltip (`dmTooltip`)

Text tooltip on any element, built on the CDK Overlay. Shows on hover (with delay) and keyboard focus (immediate); Escape closes it. Flips to the opposite side when there is no room.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```html
<button dmTooltip="Copy to clipboard">Copy</button>
<button dmTooltip="Delete" dmTooltipPosition="right">Delete</button>
```

## API

| Input                | Type                                     | Default | Description                                                    |
| -------------------- | ---------------------------------------- | ------- | -------------------------------------------------------------- |
| `dmTooltip`          | `string` (required)                      | —       | Tooltip text. Empty → never shown.                             |
| `dmTooltipPosition`  | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred placement (auto-flips).                              |
| `dmTooltipShowDelay` | `number \| null`                         | `null`  | Hover delay before showing, in ms. `null` → global default.    |
| `dmTooltipHideDelay` | `number \| null`                         | `null`  | Delay before hiding, in ms. `null` → global default.           |
| `dmTooltipDisabled`  | `boolean`                                | `false` | While `true` it never opens; flipping it closes an open panel. |

Global defaults (position, `showDelay` 300ms, `hideDelay` 100ms): `provideTooltipDefaults({...})` / `TOOLTIP_DEFAULTS`. The per-instance delay inputs override them per trigger.

### Per-instance delays & disabled

```html
<!-- Instant tooltip on this trigger only; the rest of the app keeps the defaults -->
<button dmTooltip="Send" [dmTooltipShowDelay]="0">Send</button>

<!-- Suppressed while the action is unavailable; an open panel closes and
     aria-describedby is removed -->
<button dmTooltip="Share this item" [dmTooltipDisabled]="!canShare()">Share</button>
```

## Accessibility

- Panel with `role="tooltip"`, referenced from the trigger via `aria-describedby` while visible.
- Keyboard: shows on focus, hides on blur and Escape.
- The entrance animation honors reduced-motion via the duration tokens.

## Design tokens

| Token                    | Default               | Description                                         |
| ------------------------ | --------------------- | --------------------------------------------------- |
| `--dm-tooltip-bg`        | `var(--dm-fg)`        | Tooltip background (inverted surface, theme-aware). |
| `--dm-tooltip-fg`        | `var(--dm-bg)`        | Tooltip text color.                                 |
| `--dm-tooltip-radius`    | `var(--dm-radius-md)` | Tooltip corner radius.                              |
| `--dm-tooltip-padding`   | `0.375rem 0.625rem`   | Inner padding of the tooltip pill.                  |
| `--dm-tooltip-max-width` | `16rem`               | Maximum tooltip width.                              |
| `--dm-tooltip-shadow`    | `var(--dm-shadow-md)` | Tooltip elevation shadow.                           |
