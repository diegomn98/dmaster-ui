# Skeleton (`dm-skeleton`)

Loading placeholder that mirrors the shape of the content it replaces. No Angular Material dependency.

## Usage

```ts
import { DmSkeletonComponent } from '@dmaster/ui';
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

## Accessibility

- Host exposes `role="status"`, `aria-busy="true"`, `aria-live="polite"`.
- `prefers-reduced-motion: reduce` disables both animations (static placeholder).
- Sizes accept fluid values (`%`, `clamp()`, `vw`) for responsive layouts; with no explicit size it fills its container.

## Design tokens

| Token                     | Default                                     | Description                                          |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `--dm-skeleton-bg`        | `var(--dm-bg-muted)`                        | Base placeholder surface.                            |
| `--dm-skeleton-highlight` | theme-provided (`rgb(255 255 255 / 60%)` light) | Wave gradient highlight color.                   |
| `--dm-skeleton-duration`  | `1.6s`                                      | Animation cycle length (pulse and wave).             |
| `--dm-skeleton-radius`    | per variant (`var(--dm-radius-sm)` for text) | Corner rounding, wins over the per-variant default. |
| `--dm-skeleton-gap`       | `var(--dm-space-2)`                         | Gap between repeated lines/blocks (`count > 1`).     |
