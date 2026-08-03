# Badge (`dm-badge`)

Status label built on the semantic status tokens. No logic, pure theming.

```html
<dm-badge>Draft</dm-badge>
<dm-badge variant="success" [dot]="true">Active</dm-badge>
<dm-badge variant="danger" appearance="solid">Blocked</dm-badge>
<dm-badge variant="primary" appearance="outline" [pill]="true">v0.1.0</dm-badge>
```

## API

| Input        | Type                                                           | Default     | Description                                   |
| ------------ | -------------------------------------------------------------- | ----------- | --------------------------------------------- |
| `variant`    | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Semantic color.                               |
| `appearance` | `'subtle' \| 'solid' \| 'outline'`                             | `'subtle'`  | Visual treatment.                             |
| `size`       | `'sm' \| 'md'`                                                 | `'md'`      | Size scale.                                   |
| `pill`       | `boolean`                                                      | `false`     | Fully rounded corners.                        |
| `dot`        | `boolean`                                                      | `false`     | Leading dot so color is not the only carrier. |

Global defaults: `provideBadgeDefaults({...})` / `BADGE_DEFAULTS`.
