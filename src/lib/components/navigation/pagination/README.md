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

### `length` + `pageSize`

Instead of pre-computing the page count, pass the total item count and the page size (Material-paginator style) and the component derives it as `Math.max(1, Math.ceil(length / pageSize))`:

```html
<!-- 123 items, 10 per page → 13 pages -->
<dm-pagination [length]="123" [pageSize]="10" [(page)]="page" />
```

An explicit `totalPages` always wins over the derivation; when neither resolves, the pager renders a single page.

## API

| Input           | Type                                                                          | Default                      | Description                                                   |
| --------------- | ----------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `page`          | `model<number>`                                                               | `1`                          | Two-way current page (1-based). Navigation clamps into range. |
| `totalPages`    | `number \| null`                                                              | `null`                       | Total number of pages. Wins over `length`/`pageSize`.         |
| `length`        | `number \| null`                                                              | `null`                       | Total item count; with `pageSize`, derives the page count.    |
| `pageSize`      | `number \| null`                                                              | `null`                       | Items per page; with `length`, derives the page count.        |
| `siblingCount`  | `number`                                                                      | `1`                          | Pages shown on each side of the current page.                 |
| `boundaryCount` | `number`                                                                      | `1`                          | Pages always shown at the start and end.                      |
| `showControls`  | `boolean`                                                                     | `true`                       | Previous/next chevron buttons (disabled at the extremes).     |
| `size`          | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`                       | Item size — 2 / 2.5 / 3rem.                                   |
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

## Accessibility

- Semantic structure: a `<nav>` landmark wrapping a real `<ul>`/`<li>`/`<button>` list; the current page carries `aria-current="page"`.
- Every control has a descriptive ARIA label (`ariaLabel`, `prevLabel`, `nextLabel`, `pageAriaLabel`) — overridable per instance or via `providePaginationDefaults()`.
- Ellipses are presentational (`aria-hidden`) spans.
- Touch targets stay ≥44px via the shared `touch-target` mixin; the elastic press honors `prefers-reduced-motion`.
- Below the `sm` breakpoint, off-window pages collapse so the pager fits narrow layouts — first/last and the current page always remain visible and reachable.

## Design tokens

Public CSS custom properties, consumed with local fallbacks — override them at any scope (globally, per theme, or on a subtree) without touching the SCSS.

| Token                           | Default                        | Description                                                               |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| `--dm-pagination-gap`           | `var(--dm-space-1)`            | Gap between items.                                                        |
| `--dm-pagination-radius`        | `var(--dm-radius-lg)`          | Item corner radius (set `var(--dm-radius-full)` for circles).             |
| `--dm-pagination-item-size`     | Size-scaled (`2 / 2.5 / 3rem`) | Item footprint (min-width + height; chevrons and ellipses scale with it). |
| `--dm-pagination-fg`            | `var(--dm-fg-muted)`           | Idle item text / chevron color.                                           |
| `--dm-pagination-fg-hover`      | `var(--dm-fg)`                 | Item text color on hover.                                                 |
| `--dm-pagination-hover-bg`      | `var(--dm-bg-muted)`           | Hover wash behind an item.                                                |
| `--dm-pagination-active-bg`     | Semantic color (from `color`)  | Solid fill of the active page.                                            |
| `--dm-pagination-active-fg`     | Semantic `-fg` (from `color`)  | Text color on the active page fill.                                       |
| `--dm-pagination-active-shadow` | Soft glow of the active fill   | Box shadow under the active page (set `none` to remove the glow).         |
