# Avatar (`dm-avatar`)

Avatar with automatic fallback chain: image → initials → generic icon. A failed image load falls back silently; changing `src` retries.

```html
<dm-avatar src="/u/diego.png" alt="Diego Maestro" initials="DM" />
<dm-avatar initials="DM" size="lg" />
<dm-avatar shape="square" [size]="64" />
```

## API

| Input      | Type                                       | Default    | Description                                      |
| ---------- | ------------------------------------------ | ---------- | ------------------------------------------------ |
| `src`      | `string \| null`                           | `null`     | Image URL.                                       |
| `alt`      | `string`                                   | `''`       | Alt for the image / label for the fallback.      |
| `initials` | `string`                                   | `''`       | Shown when there is no (working) image.          |
| `size`     | `'sm' \| 'md' \| 'lg' \| number \| string` | `'md'`     | 2rem / 2.5rem / 3rem, px (number) or CSS length. |
| `shape`    | `'circle' \| 'square'`                     | `'circle'` | Shape.                                           |

Global defaults: `provideAvatarDefaults({...})` / `AVATAR_DEFAULTS`.

## Accessibility

- With image: standard `<img alt>`.
- Fallbacks expose `role="img"` + `aria-label` (`alt` → `initials`).
