# Pagination (`dm-pagination`)

Page navigation with a windowed list of page numbers: boundary pages at the extremes, siblings around the current page and ellipses in between. `dm-table` composes it internally for its footer pager.

## Usage

```ts
import { DmPaginationComponent } from '@dmaster/ui';
```

```html
<!-- Two-way current page -->
<dm-pagination [totalPages]="10" [(page)]="page" />

<!-- Wider window, small items, semantic color -->
<dm-pagination
  [totalPages]="42"
  [siblingCount]="2"
  [boundaryCount]="2"
  size="sm"
  color="secondary"
  [(page)]="page"
/>

<!-- Numbers only -->
<dm-pagination [totalPages]="8" [showControls]="false" [(page)]="page" />
```

## API

| Input           | Type                                                                          | Default                      | Description                                                   |
| --------------- | ----------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `page`          | `model<number>`                                                               | `1`                          | Two-way current page (1-based). Navigation clamps into range. |
| `totalPages`    | `number`                                                                      | — (required)                 | Total number of pages.                                        |
| `siblingCount`  | `number`                                                                      | `1`                          | Pages shown on each side of the current page.                 |
| `boundaryCount` | `number`                                                                      | `1`                          | Pages always shown at the start and end.                      |
| `showControls`  | `boolean`                                                                     | `true`                       | Previous/next chevron buttons (disabled at the extremes).     |
| `size`          | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`                       | Item size — 2 / 2.5 / 3rem (HeroUI scale).                    |
| `color`         | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'`                  | Semantic color of the active page (solid fill).               |
| `disabled`      | `boolean`                                                                     | `false`                      | Disables every control.                                       |
| `ariaLabel`     | `string`                                                                      | `'Pagination'`               | Accessible name of the `<nav>` landmark.                      |
| `prevLabel`     | `string`                                                                      | `'Previous page'`            | ARIA label of the previous button.                            |
| `nextLabel`     | `string`                                                                      | `'Next page'`                | ARIA label of the next button.                                |
| `pageAriaLabel` | `(page: number) => string`                                                    | `` page => `Page ${page}` `` | Builds the ARIA label of each page button.                    |

| Output       | Payload  | Description                          |
| ------------ | -------- | ------------------------------------ |
| `pageChange` | `number` | Emitted with the new page (`model`). |

## Global defaults

Every default — including the accessible labels — can be swapped app-wide, which is the recommended place to localize them:

```ts
providers: [
  providePaginationDefaults({
    size: 'sm',
    ariaLabel: 'Paginación',
    prevLabel: 'Página anterior',
    nextLabel: 'Página siguiente',
    pageAriaLabel: (page) => `Página ${page}`,
  }),
];
```

Or provide `PAGINATION_DEFAULTS` directly.

## Theming

CSS variables (resolve with local fallbacks, overridable at any scope):

- `--dm-pagination-gap` — gap between items (defaults to `--dm-space-1`).
- `--dm-pagination-radius` — item radius (defaults to `--dm-radius-lg`, the HeroUI rounded square; set `--dm-radius-full` for circles).
- `--dm-pagination-fg` — idle item color (defaults to `--dm-fg-muted`).
- `--dm-pagination-hover-bg` — hover wash (defaults to `--dm-bg-muted`).

## Accessibility

- Semantic structure: a `<nav>` landmark wrapping a real `<ul>`/`<li>`/`<button>` list; the current page carries `aria-current="page"`.
- Every control has a descriptive ARIA label (`ariaLabel`, `prevLabel`, `nextLabel`, `pageAriaLabel`) — overridable per instance or via `providePaginationDefaults()`.
- Ellipses are presentational (`aria-hidden`) spans.
- Touch targets stay ≥44px via the shared `touch-target` mixin; the elastic press honors `prefers-reduced-motion`.
- Below the `sm` breakpoint, off-window pages collapse so the pager fits narrow layouts — first/last and the current page always remain visible and reachable.
