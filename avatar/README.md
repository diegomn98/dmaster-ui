# Avatar (`dm-avatar`)

Avatar with automatic fallback chain: image → initials → custom fallback (`[dmAvatarFallback]`) → generic icon. A failed image load falls back silently; changing `src` retries.

```html
<dm-avatar src="/u/diego.png" alt="Diego Maestro" initials="DM" />
<dm-avatar initials="DM" size="lg" />
<dm-avatar shape="square" [size]="64" />
```

## API

| Input      | Type                                                                          | Default     | Description                                      |
| ---------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `src`      | `string \| null`                                                              | `null`      | Image URL.                                       |
| `alt`      | `string`                                                                      | `''`        | Alt for the image / label for the fallback.      |
| `initials` | `string`                                                                      | `''`        | Shown when there is no (working) image.          |
| `size`     | `'sm' \| 'md' \| 'lg' \| number \| string`                                    | `'md'`      | 2rem / 2.5rem / 3rem, px (number) or CSS length. |
| `shape`    | `'circle' \| 'square'`                                                        | `'circle'`  | Shape.                                           |
| `color`    | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Semantic color of the initials tint.             |

Global defaults: `provideAvatarDefaults({...})` / `AVATAR_DEFAULTS`.

### Content slots

- `<ng-content select="[dmAvatarFallback]" />` — custom fallback: replaces the generic person icon when there is no (working) image and no initials (requires importing `DmAvatarFallbackDirective`).

## Custom fallback (`[dmAvatarFallback]`)

Project any element with the `dmAvatarFallback` attribute (import `DmAvatarFallbackDirective` alongside the component) to replace the generic icon at the end of the chain:

```html
<dm-avatar alt="Engineering team">
  <dm-icon dmAvatarFallback size="1.25rem">groups</dm-icon>
</dm-avatar>
```

Image and initials still win: the custom fallback only renders when neither is available. Size the projected element yourself (the built-in 55% sizing only applies to the internal SVG).

## Accessibility

- With image: standard `<img alt>`.
- Fallbacks expose `role="img"` + `aria-label` (`alt` → `initials`).

## Design tokens

| Token                    | Default                                         | Description                                      |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| `--dm-avatar-bg`         | `var(--dm-primary-subtle)`                      | Fallback surface behind initials / generic icon. |
| `--dm-avatar-fg`         | `var(--dm-primary-text)`                        | Initials text color.                             |
| `--dm-avatar-border`     | `var(--dm-border)`                              | 1px border color.                                |
| `--dm-avatar-radius`     | `var(--dm-radius-full)` / `var(--dm-radius-md)` | Corner rounding (per `shape`: circle / square).  |
| `--dm-avatar-icon-color` | `var(--dm-fg-subtle)`                           | Color of the generic fallback icon.              |
