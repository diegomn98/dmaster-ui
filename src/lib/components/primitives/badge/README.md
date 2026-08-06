# Badge / Chip (`dm-badge`)

Status label / chip with a HeroUI-style **color × variant** API. No logic, pure theming.

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
| `size`    | `'sm' \| 'md'`                                                                | `'md'`      | Size scale.                               |
| `radius`  | `'sm' \| 'md' \| 'lg' \| 'full'`                                              | `'full'`    | Corner rounding. `full` is pill-shaped.   |

Global defaults: `provideBadgeDefaults({...})` / `BADGE_DEFAULTS`.
