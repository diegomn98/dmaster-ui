# Popover (`dm-popover` + `dmPopoverTrigger`)

Rich floating panel anchored to a trigger, built on the CDK Overlay — the
tooltip's bigger sibling. It opens on **click**, holds arbitrary interactive
content (headings, inputs, buttons…), flips to fit, closes on outside click /
Escape, and returns focus to the trigger.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`

```html
<dm-button [dmPopoverTrigger]="info" variant="bordered">Details</dm-button>

<dm-popover #info placement="bottom" ariaLabel="Account details">
  <h3>Ada Lovelace</h3>
  <p>ada@analytical.engine</p>
</dm-popover>
```

The trigger can be any element — a plain `<button>` or a `<dm-button>`.

## Popover vs. tooltip

| Use `dmTooltip`                 | Use `dm-popover`                          |
| ------------------------------- | ----------------------------------------- |
| A short **text** hint           | **Rich** content: markup, forms, actions  |
| Shows on **hover** / focus      | Opens on **click** (toggle)               |
| `role="tooltip"`, non-focusable | `role="dialog"`, focusable, manages focus |

## API

### `dm-popover`

| Input       | Type                                                                                                   | Default    | Description                                |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------ |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `'bottom'` | Preferred placement (auto-flips).          |
| `showArrow` | `boolean`                                                                                              | `true`     | Renders the arrow pointing at the trigger. |
| `offset`    | `number`                                                                                               | `8`        | Gap between trigger and panel, in pixels.  |
| `trapFocus` | `boolean`                                                                                              | `false`    | Traps focus inside the panel while open.   |
| `ariaLabel` | `string`                                                                                               | —          | Accessible name when there is no heading.  |

| Output   | Description                     |
| -------- | ------------------------------- |
| `opened` | Emitted after the panel opens.  |
| `closed` | Emitted after the panel closes. |

### `dmPopoverTrigger`

| Input              | Type                 | Description                                    |
| ------------------ | -------------------- | ---------------------------------------------- |
| `dmPopoverTrigger` | `DmPopoverComponent` | The popover this element opens (template ref). |

Global defaults (placement, showArrow, offset): `providePopoverDefaults({...})` / `POPOVER_DEFAULTS`.

## Accessibility

- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` while open.
- Panel: `role="dialog"`, `aria-modal="false"`, `tabindex="-1"`; focused on open.
- Escape closes and returns focus to the trigger; outside click closes.
- `trapFocus` uses the CDK focus trap (`cdkTrapFocus`) for menu-like content.
- The entrance animation honors reduced-motion via the duration tokens.

## Design tokens

| Token                     | Default               | Description                             |
| ------------------------- | --------------------- | --------------------------------------- |
| `--dm-popover-bg`         | `var(--dm-bg)`        | Panel and arrow background surface.     |
| `--dm-popover-fg`         | `var(--dm-fg)`        | Panel text color.                       |
| `--dm-popover-border`     | `var(--dm-border)`    | Panel and arrow border color.           |
| `--dm-popover-radius`     | `var(--dm-radius-lg)` | Panel corner radius.                    |
| `--dm-popover-shadow`     | `var(--dm-shadow-lg)` | Panel elevation shadow.                 |
| `--dm-popover-padding`    | `1rem`                | Inner padding of the panel.             |
| `--dm-popover-max-width`  | `20rem`               | Maximum panel width.                    |
| `--dm-popover-arrow-size` | `0.625rem`            | Size of the arrow square.               |
