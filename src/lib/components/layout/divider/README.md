# Divider (`dm-divider`)

Thin rule that separates content, with an optional projected label. No Angular Material dependency.

## Usage

```ts
import { DmDividerComponent } from '@dmaster/ui';
```

```html
<!-- Plain horizontal rule -->
<dm-divider />

<!-- Labeled: the line splits around the projected content -->
<dm-divider>OR</dm-divider>
<dm-divider labelPlacement="start">Billing</dm-divider>
<dm-divider labelPlacement="end">More</dm-divider>

<!-- Vertical: stretches to the parent's cross size (flex row, set a height) -->
<div style="display: flex; align-items: center; height: 1.5rem; gap: 1rem">
  <span>Blog</span>
  <dm-divider orientation="vertical" />
  <span>Docs</span>
</div>
```

## API

| Input            | Type                           | Default        | Description                                            |
| ---------------- | ------------------------------ | -------------- | ------------------------------------------------------ |
| `orientation`    | `'horizontal' \| 'vertical'`   | `'horizontal'` | Direction of the line. Also drives `aria-orientation`. |
| `labelPlacement` | `'start' \| 'center' \| 'end'` | `'center'`     | Where the projected label sits along the line.         |
| `ng-content`     | —                              | —              | Optional label. Without it, a single continuous line.  |

## Global defaults

```ts
providers: [provideDividerDefaults({ labelPlacement: 'start' })];
```

Or provide `DIVIDER_DEFAULTS` directly.

## Accessibility

- Host exposes `role="separator"` with a reactive `aria-orientation`.
- The line halves are `aria-hidden`; only the projected label is exposed to assistive technology.
- Purely decorative and non-focusable: no tab stop, no pointer interaction.

## Design tokens

Public CSS custom properties (all optional — overridable at any scope):

| Token                      | Default                                                           | Description                                |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| `--dm-divider-color`       | `var(--dm-border)`                                                | Line color.                                |
| `--dm-divider-thickness`   | `1px`                                                             | Line thickness.                            |
| `--dm-divider-label-color` | `var(--dm-fg-muted)`                                              | Projected label color.                     |
| `--dm-divider-label-gap`   | `var(--dm-space-3)` (horizontal) / `var(--dm-space-2)` (vertical) | Gap between the label and the line halves. |
