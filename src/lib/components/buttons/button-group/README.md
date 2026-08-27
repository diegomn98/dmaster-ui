# dm-button-group

Joins a row (or column) of `<dm-button>`s into one attached control: outer
corners keep the pill radius, inner corners flatten, and the group draws a
subtle 1px seam between segments (bordered buttons collapse their shared
border instead). The elastic per-button press is disabled inside the bar so
the group stays rigid.

Appearance set on the group **cascades** to every button — `color`, `variant`,
`size`, `radius` and `disabled` — while each button's own inputs still win.

## Usage

```html
<!-- variant set once on the group; each button stays clean -->
<dm-button-group variant="bordered" ariaLabel="Text alignment">
  <dm-button ariaLabel="Left"><dm-icon>format_align_left</dm-icon></dm-button>
  <dm-button ariaLabel="Center"><dm-icon>format_align_center</dm-icon></dm-button>
  <dm-button ariaLabel="Right"><dm-icon>format_align_right</dm-icon></dm-button>
</dm-button-group>
```

Per-button override — the cascade is a default, not a cage:

```html
<dm-button-group variant="flat" ariaLabel="File actions">
  <dm-button>Rename</dm-button>
  <dm-button>Duplicate</dm-button>
  <dm-button color="danger">Delete</dm-button>
</dm-button-group>
```

Set `orientation="vertical"` for a stacked column, `fullWidth` to stretch the
group so the buttons share the width equally.

### Split button

A split button is just a group of two — the main action plus a caret that opens
a menu. With the cascade, the color lives on the group:

```html
<dm-button-group color="primary" ariaLabel="Save options">
  <dm-button (clicked)="save()">Save</dm-button>
  <dm-button ariaLabel="More save options" [dmMenuTrigger]="saveMenu">
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

## Accessibility

- The host is `role="group"`; pass `ariaLabel` so assistive tech announces what
  the set of buttons is for.
- Each button remains a normal, independently focusable `<button>` with its own
  accessible name — icon-only buttons still need their own `ariaLabel`.
- The hovered / focused button rises above its neighbours so its border and
  focus ring are never clipped by the adjacent one.

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

The buttons inside the group also honor the `--dm-button-*` tokens (see the button README).
