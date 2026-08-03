# Skeleton (`dm-skeleton`)

Loading placeholder that mirrors the shape of the content it replaces. No Angular Material dependency.

## Usage

```ts
import { DmSkeletonComponent } from 'ngx-dmaster-ui';
```

```html
<!-- Text line, pulse animation, full container width -->
<dm-skeleton />

<!-- Avatar -->
<dm-skeleton variant="circular" [width]="48" [height]="48" />

<!-- Card image with wave animation -->
<dm-skeleton variant="rounded" rounded="lg" height="8rem" animation="wave" />

<!-- Paragraph: 3 lines, shorter last line automatically -->
<dm-skeleton [count]="3" />
```

## API

| Input       | Type                                                 | Default   | Description                                                      |
| ----------- | ---------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| `variant`   | `'text' \| 'rectangular' \| 'circular' \| 'rounded'` | `'text'`  | Shape of the placeholder.                                        |
| `width`     | `string \| number \| null`                           | `null`    | Number → px, string verbatim. Defaults to 100% of the container. |
| `height`    | `string \| number \| null`                           | `null`    | Number → px, string verbatim. Per-variant default when unset.    |
| `animation` | `'pulse' \| 'wave' \| 'none'`                        | `'pulse'` | Loading animation.                                               |
| `rounded`   | `'sm' \| 'md' \| 'lg' \| 'full'`                     | `'md'`    | Radius scale, meaningful with `variant="rounded"`.               |
| `count`     | `number`                                             | `1`       | Number of lines/blocks (min 1).                                  |

## Global defaults

```ts
providers: [provideSkeletonDefaults({ animation: 'wave', rounded: 'lg' })];
```

Or provide `SKELETON_DEFAULTS` directly.

## Theming

CSS variables (inherit from the global tokens, overridable at any scope):

- `--dm-skeleton-bg` — base surface (defaults to `--dm-bg-muted`).
- `--dm-skeleton-highlight` — wave highlight (theme-aware).
- `--dm-skeleton-duration` — animation cycle (default `1.6s`).

## Accessibility

- Host exposes `role="status"`, `aria-busy="true"`, `aria-live="polite"`.
- `prefers-reduced-motion: reduce` disables both animations (static placeholder).
- Sizes accept fluid values (`%`, `clamp()`, `vw`) for responsive layouts; with no explicit size it fills its container.
