# Badge / Chip (`dm-badge`)

Status label / chip with a **color × variant** API. No logic, pure theming.

```html
<dm-badge>Draft</dm-badge>
<dm-badge color="success" variant="dot">Active</dm-badge>
<dm-badge color="danger" variant="solid">Blocked</dm-badge>
<dm-badge color="primary" variant="bordered">v0.1.0</dm-badge>
<dm-badge color="secondary" variant="shadow">New</dm-badge>
```

## API

| Input     | Type                                                                          | Default     | Description                               |
| --------- | ----------------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| `color`   | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Semantic color.                           |
| `variant` | `'solid' \| 'flat' \| 'bordered' \| 'light' \| 'dot' \| 'shadow'`             | `'flat'`    | Visual variant. `dot` adds a leading dot. |
| `size`    | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Size scale.                               |
| `radius`  | `'sm' \| 'md' \| 'lg' \| 'full'`                                              | `'full'`    | Corner rounding. `full` is pill-shaped.   |

Global defaults: `provideBadgeDefaults({...})` / `BADGE_DEFAULTS`.

## Design tokens

Colors come from the semantic `color` × `variant` system (`--dm-primary`, `--dm-success-subtle`, …) — override those to re-color. The structural knobs are public tokens:

| Token                  | Default                                                 | Description                                    |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `--dm-badge-radius`    | per `radius` input (`var(--dm-radius-full)` by default) | Corner rounding, wins over the `radius` input. |
| `--dm-badge-padding`   | `0.1875rem 0.5625rem` (md) / `0.0625rem 0.4375rem` (sm) / `0.3125rem 0.6875rem` (lg) | Inner padding.                                 |
| `--dm-badge-font-size` | `var(--dm-text-xs)` (md) / `0.6875rem` (sm) / `var(--dm-text-sm)` (lg)               | Label font size.                               |
| `--dm-badge-gap`       | `0.375em`                                               | Gap between the leading dot and the label.     |
| `--dm-badge-dot-size`  | `0.5em`                                                 | Diameter of the leading dot (`variant="dot"`). |
