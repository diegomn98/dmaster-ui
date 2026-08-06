# Accordion (`dm-accordion` + `dm-accordion-item`)

Collapsible sections. The container (`dm-accordion`) owns the expansion state;
each `dm-accordion-item` reads it via DI and asks the parent to toggle when
its header is activated.

## Usage

```ts
import { DmAccordionComponent, DmAccordionItemComponent } from '@dmaster/ui';
```

```html
<!-- Single-open (default), light variant -->
<dm-accordion [(expandedValues)]="open">
  <dm-accordion-item value="a" title="Shipping" subtitle="US only">
    Free shipping on orders over $50.
  </dm-accordion-item>
  <dm-accordion-item value="b" title="Returns">
    30-day returns, no questions asked.
  </dm-accordion-item>
</dm-accordion>

<!-- Multiple items open, splitted cards -->
<dm-accordion selectionMode="multiple" variant="splitted">
  <dm-accordion-item value="q1" title="First question">…</dm-accordion-item>
  <dm-accordion-item value="q2" title="Second question">…</dm-accordion-item>
</dm-accordion>

<!-- Custom title markup -->
<dm-accordion-item value="c">
  <span dm-accordion-title>Custom <strong>markup</strong></span>
  …
</dm-accordion-item>

<!-- Leading icon slot (optional). Project an em-sized glyph: an icon font, or
     an SVG with width="1em" height="1em". It inherits color (muted, and full
     contrast when the item is open) and collapses to zero width when omitted. -->
<dm-accordion-item value="d" title="Billing">
  <svg dm-accordion-icon width="1em" height="1em" viewBox="0 0 24 24">…</svg>
  Manage your billing details.
</dm-accordion-item>
```

## Content slots

| Slot                   | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| _(default)_            | Panel body (collapsible content).                                     |
| `[dm-accordion-title]` | Rich title markup; replaces the plain-text `title`.                   |
| `[dm-accordion-icon]`  | Optional leading icon before the label. Size it in `em` (~`1.25rem`). |

## `dm-accordion` API

| Input            | Type                                              | Default    | Description                                    |
| ---------------- | ------------------------------------------------- | ---------- | ---------------------------------------------- |
| `selectionMode`  | `'single' \| 'multiple'`                          | `'single'` | Whether one or many items can be open at once. |
| `expandedValues` | `string[]` (two-way)                              | `[]`       | `value`s of currently expanded items.          |
| `variant`        | `'light' \| 'bordered' \| 'shadow' \| 'splitted'` | `'light'`  | Container surface treatment.                   |
| `disabled`       | `boolean`                                         | `false`    | Disables every child item.                     |
| `ariaLabel`      | `string`                                          | `''`       | ARIA label for the accordion region.           |

### Methods

- `isExpanded(value)` — is that item open right now.
- `toggle(value)` — open if closed, close if open (honors `selectionMode`).
- `expand(value)` — open the item.
- `collapse(value)` — close the item.

## `dm-accordion-item` API

| Input      | Type      | Default | Description                                                  |
| ---------- | --------- | ------- | ------------------------------------------------------------ |
| `value`    | `string`  | —       | **Required.** Stable id used by the parent to track state.   |
| `title`    | `string`  | `''`    | Plain-text title. Overridden by `[dm-accordion-title]` slot. |
| `subtitle` | `string`  | `''`    | Optional secondary line under the title.                     |
| `disabled` | `boolean` | `false` | Disables this item only.                                     |

## Global defaults

```ts
providers: [provideAccordionDefaults({ variant: 'bordered', selectionMode: 'multiple' })];
```

Or provide `ACCORDION_DEFAULTS` directly.

## Theming

Each item exposes CSS custom properties (all optional — every one falls back to
a semantic token, so the default look needs no configuration):

| Token                            | Falls back to         | Controls                         |
| -------------------------------- | --------------------- | -------------------------------- |
| `--dm-accordion-trigger-hover`   | `--dm-bg-subtle`      | Full-row hover wash.             |
| `--dm-accordion-expanded-bg`     | `--dm-bg-subtle`      | Open-row tint (framed variants). |
| `--dm-accordion-chevron-hover`   | `--dm-bg-muted`       | Chevron pill fill on hover.      |
| `--dm-accordion-chevron-open-bg` | `--dm-primary-subtle` | Chevron pill fill when open.     |
| `--dm-accordion-chevron-open-fg` | `--dm-primary`        | Chevron glyph color when open.   |
| `--dm-accordion-icon-open`       | `--dm-fg`             | Leading icon color when open.    |
| `--dm-accordion-icon-size`       | `1.25rem`             | Leading icon size (`font-size`). |
| `--dm-accordion-divider`         | `--dm-border`         | Header/body hairline.            |

## Accessibility

- Each header is a native `<button>` with `aria-expanded` and
  `aria-controls` pointing at its panel.
- Each panel has `role="region"` and `aria-labelledby` pointing back at its
  header, plus `aria-hidden` and `inert` when collapsed so hidden content is
  removed from the focus order and the accessibility tree.
- Keyboard: `Enter` / `Space` toggle the item; `ArrowDown` / `ArrowUp` move
  focus to the next / previous enabled header (wraps); `Home` / `End` jump to
  the first / last enabled header.
- Focus ring on `:focus-visible` uses the shared `focus-ring` mixin.
- `prefers-reduced-motion: reduce` disables the open/close animation.
