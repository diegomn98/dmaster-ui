# dm-button-group

Joins a row (or column) of `<dm-button>`s into one attached control: outer
corners keep the pill radius, inner corners flatten, and the group draws a
subtle 1px seam between segments (bordered buttons collapse their shared
border instead). The bar is rigid — a segment answers hover and press with its
fill, never by moving.

Appearance set on the group **cascades** to every button — `color`, `variant`,
`size`, `radius` and `disabled` — while each button's own inputs still win.

## Usage

```html
<!-- variant set once on the group; glyph-only segments take `iconOnly` (square) -->
<dm-button-group variant="bordered" ariaLabel="Text alignment">
  <dm-button iconOnly ariaLabel="Left"><dm-icon>format_align_left</dm-icon></dm-button>
  <dm-button iconOnly ariaLabel="Center"><dm-icon>format_align_center</dm-icon></dm-button>
  <dm-button iconOnly ariaLabel="Right"><dm-icon>format_align_right</dm-icon></dm-button>
</dm-button-group>
```

Per-button override — the cascade is a default, not a cage. Per-button state
works the same way: a pager disables its edge segments at the bounds.

```html
<dm-button-group variant="flat" ariaLabel="File actions">
  <dm-button>Rename</dm-button>
  <dm-button>Duplicate</dm-button>
  <dm-button color="danger">Delete</dm-button>
</dm-button-group>

<dm-button-group color="primary" ariaLabel="Pager">
  <dm-button iconOnly ariaLabel="Previous" [disabled]="page() === 1" (clicked)="go(-1)">
    <dm-icon>chevron_left</dm-icon>
  </dm-button>
  <dm-button>Page {{ page() }}</dm-button>
  <dm-button iconOnly ariaLabel="Next" [disabled]="page() === total" (clicked)="go(1)">
    <dm-icon>chevron_right</dm-icon>
  </dm-button>
</dm-button-group>
```

Set `orientation="vertical"` for a stacked column, `fullWidth` to stretch the
group so the buttons share the width equally.

### Split button

A split button is just a group of two — the main action plus an `iconOnly`
caret that opens a menu. With the cascade, the color lives on the group; the
main action can run the button's own `loading → success` state machine:

```html
<dm-button-group color="primary" ariaLabel="Save options">
  <dm-button [state]="saveState()" loadingLabel="Saving…" successLabel="Saved" (clicked)="save()">
    Save
  </dm-button>
  <dm-button iconOnly ariaLabel="More save options" [dmMenuTrigger]="saveMenu">
    <dm-icon>expand_more</dm-icon>
  </dm-button>
</dm-button-group>

<dm-menu #saveMenu ariaLabel="Save options">
  <dm-menu-item (selected)="saveAndClose()">Save and close</dm-menu-item>
  <dm-menu-item (selected)="saveAsCopy()">Save as copy…</dm-menu-item>
</dm-menu>
```

## API

| Input         | Type                                       | Default        | Description                               |
| ------------- | ------------------------------------------ | -------------- | ----------------------------------------- |
| `color`       | `DmButtonColor`                            | —              | Cascades to every button (overridable).   |
| `variant`     | `DmButtonVariant`                          | —              | Cascades to every button (overridable).   |
| `size`        | `'sm' \| 'md' \| 'lg'`                     | —              | Cascades to every button (overridable).   |
| `radius`      | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | —              | Outer-corner rounding; cascades.          |
| `disabled`    | `boolean` (attribute)                      | `false`        | Disables every button in the group.       |
| `orientation` | `'horizontal' \| 'vertical'`               | `'horizontal'` | Layout direction of the grouped buttons.  |
| `fullWidth`   | `boolean` (attribute)                      | `false`        | Stretch to fill; buttons share the width. |
| `ariaLabel`   | `string`                                   | `''`           | Accessible label for the set of actions.  |

## Defaults

```ts
providers: [provideButtonGroupDefaults({ orientation: 'vertical' })];
```

## Motion

Inside a group the standalone button's opacity dim and elastic scale are
replaced — the dim barely reads on a flat fill and the scale would deform the
bar — by feedback that keeps the silhouette still:

- **Hover** deepens the segment's fill one step per variant (`solid` → its
  `-hover` tone, `flat`/`faded` → a stronger tint, `bordered`/`light` → the
  subtle wash).
- **Press** deepens it one more step and dips only the label
  (`--dm-button-group-press-scale`, `0.94`), springing back on release.
- **Split-button caret**: a lone `dm-icon` in a segment that carries
  `dmMenuTrigger` rotates 180° while the menu is open, so the caret reports the
  state.

Everything runs on the `--dm-duration-*` / `--dm-ease-*` tokens, so it all
collapses to an instant change under `prefers-reduced-motion`.

## Accessibility

- The host is `role="group"`; pass `ariaLabel` so assistive tech announces what
  the set of buttons is for.
- Each button remains a normal, independently focusable `<button>` with its own
  accessible name — icon-only buttons still need their own `ariaLabel`.
- The focus ring is drawn **inside** the focused segment (`currentColor`, so it
  contrasts with every fill), never overlapping its neighbours. A hovered or
  focused bordered segment still rises above the adjacent one to show its full
  border.

## Note on encapsulation

The component uses `ViewEncapsulation.None` on purpose: it must reach the inner
`.dm-button` element of each **projected** button to flatten the appropriate
corners. Every rule is scoped under `.dm-button-group`, so nothing leaks to the
rest of the app.

## Design tokens

| Token                                 | Default                                             | Description                                      |
| ------------------------------------- | --------------------------------------------------- | ------------------------------------------------ |
| `--dm-button-group-divider`           | `color-mix(in srgb, var(--dm-fg) 15%, transparent)` | Color of the seam between non-bordered segments. |
| `--dm-button-group-divider-thickness` | `1px`                                               | Thickness of the seam.                           |
| `--dm-button-group-divider-inset`     | `15%`                                               | Seam inset from both ends of the segment edge.   |
| `--dm-button-group-ring`              | `currentColor`                                      | Focus ring color of a segment (drawn inset).     |
| `--dm-button-group-press-scale`       | `0.94`                                              | Label dip while a segment is pressed.            |

The buttons inside the group also honor the `--dm-button-*` tokens (see the button README).
