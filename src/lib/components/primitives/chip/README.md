# Chip (`dm-chip`, `dm-chip-set`)

The interactive sibling of `dm-badge`. One `dm-chip` covers the three chip
archetypes; `dm-chip-set` groups them with wrapping layout, roving-tabindex
keyboard support and optional selection.

```html
<!-- Input / tag — removable, with keyboard removal (Delete / Backspace) -->
<dm-chip removable (removed)="drop('angular')">Angular</dm-chip>

<!-- Filter / choice — a toggle with an animated check -->
<dm-chip selectable [(selected)]="onSale" color="primary">On sale</dm-chip>

<!-- Action — a compact button -->
<dm-chip clickable (chipClick)="add()">
  <dm-icon dm-chip-leading name="plus" />Add tag
</dm-chip>
```

A **coordinated set** drives single- or multi-selection (and works with Angular
forms via `ControlValueAccessor`):

```html
<dm-chip-set selection="multiple" [(values)]="filters" ariaLabel="Filters">
  <dm-chip selectable value="new">New</dm-chip>
  <dm-chip selectable value="sale">On sale</dm-chip>
  <dm-chip selectable value="stock">In stock</dm-chip>
</dm-chip-set>
```

Project a leading icon or avatar with the `dm-chip-leading` attribute; on a
selected filter chip it is swapped for the check, keeping the width stable.

## `dm-chip` API

| Input         | Type                                                                          | Default     | Description                                            |
| ------------- | ----------------------------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| `color`       | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Semantic color.                                       |
| `variant`     | `'solid' \| 'flat' \| 'bordered' \| 'light' \| 'shadow'`                      | `'flat'`    | Unselected surface style.                             |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Size scale.                                           |
| `radius`      | `'sm' \| 'md' \| 'lg' \| 'full'`                                              | `'full'`    | Corner rounding. `full` is pill-shaped.               |
| `removable`   | `boolean`                                                                     | `false`     | Shows the trailing ✕ and enables `Delete`/`Backspace`.|
| `selectable`  | `boolean`                                                                     | `false`     | Toggle (filter/choice) behavior. Pair `[(selected)]`. |
| `clickable`   | `boolean`                                                                     | `false`     | Action behavior. Pair `(chipClick)`.                  |
| `selected`    | `boolean` (model)                                                             | `false`     | Two-way `[(selected)]` for a standalone toggle chip.  |
| `disabled`    | `boolean`                                                                     | `false`     | Disables the chip (also inherits the set's disabled). |
| `value`       | `unknown`                                                                     | `undefined` | Value used by a coordinated `dm-chip-set`.            |
| `ariaLabel`   | `string`                                                                      | `''`        | Accessible name for the body (icon-only action chips).|
| `removeLabel` | `string`                                                                      | `'Remove'`  | Accessible name for the ✕.                            |

| Output       | Payload      | Description                                          |
| ------------ | ------------ | --------------------------------------------------- |
| `removed`    | `void`       | Fired after the collapse animation completes.       |
| `chipClick`  | `MouseEvent` | Fired when a `clickable` chip is activated.         |
| `selectedChange` | `boolean` | From the `[(selected)]` model.                      |

Global defaults: `provideChipDefaults({...})` / `CHIP_DEFAULTS`.

## `dm-chip-set` API

| Input       | Type                             | Default  | Description                                                    |
| ----------- | -------------------------------- | -------- | ------------------------------------------------------------- |
| `selection` | `'none' \| 'single' \| 'multiple'` | `'none'` | `none` = layout + keyboard only; otherwise coordinates chips. |
| `value`     | `unknown` (model)                | `null`   | Selected value in `single` mode — `[(value)]`.               |
| `values`    | `unknown[]` (model)              | `[]`     | Selected values in `multiple` mode — `[(values)]`.           |
| `disabled`  | `boolean`                        | `false`  | Disables every chip in the set.                              |
| `ariaLabel` | `string`                         | `''`     | Accessible name for the group.                              |

## Accessibility

- The set is a `role="group"`; each interactive chip is a real `<button>`
  (`aria-pressed` for selectable chips), so nothing nests a button in a button.
- **Roving tabindex**: only one chip is a tab stop; `←`/`→` (`↑`/`↓`) move focus,
  `Home`/`End` jump to the ends.
- Removing a chip moves focus to its neighbour so the keyboard never gets stranded.
- `Delete`/`Backspace` removes a focused removable chip; the ✕ is labelled by
  `removeLabel`.
- Respects `prefers-reduced-motion` (no entrance/press/collapse motion; removal
  still emits immediately).

## Motion

Every animation marks a change to the set — nothing runs on a static render.

- **Enter** — a chip added to an already-rendered `dm-chip-set` grows in from
  where it was inserted (`scale(0.6) → 1`, `--dm-duration-base`). The initial
  render never pops.
- **Collapse** — a removed chip fades, then folds its width to zero and gives
  back the set gap (`--dm-chip-set-gap`), so neighbours slide instead of
  jumping. `(removed)` fires when the collapse finishes (immediately under
  reduced motion).
- **Select** — the check pops in with a small overshoot; the whole chip
  presses elastically (`scale(0.96)`, `--dm-ease-snappy`).

## Design tokens

Colors come from the semantic `color` × `variant` system — override `--dm-primary`,
`--dm-success-subtle`, … to re-color. The structural knobs are public tokens
(consumed with a verbatim fallback, so overriding one wins in any scope):

| Token                   | Default                                                | Description                                  |
| ----------------------- | ------------------------------------------------------ | -------------------------------------------- |
| `--dm-chip-radius`      | per `radius` input (`var(--dm-radius-full)` default)   | Corner rounding, wins over the `radius` input.|
| `--dm-chip-height`      | `1.75rem` (md) / `1.5rem` (sm) / `2rem` (lg)           | Chip height (border included).               |
| `--dm-chip-padding-x`   | `0.625rem` (md) / `0.5rem` (sm) / `0.75rem` (lg)       | Inline padding of the body.                  |
| `--dm-chip-font-size`   | `0.8125rem` (md) / `0.75rem` (sm) / `0.875rem` (lg)    | Label font size (check/✕/leading scale with it). |
| `--dm-chip-gap`         | `0.375rem` (md) / `0.3125rem` (sm) / `0.4375rem` (lg)  | Gap between the leading slot and the label.  |
| `--dm-chip-remove-size` | `1.25rem` (md) / `1.125rem` (sm) / `1.5rem` (lg)       | Diameter of the visible ✕ circle (the hit area spans the chip height). |
| `--dm-chip-set-gap`     | `0.5rem`                                               | Gap between chips in a `dm-chip-set`.        |
