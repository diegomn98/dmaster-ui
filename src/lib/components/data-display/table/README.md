# Table (`dm-table`)

A premium, data-driven table with a declarative column API. Out of the box it **searches, sorts, selects and paginates** — all internally, all controllable through two-way models. It renders native `<table>` / `<caption>` / `<thead>` / `<tbody>` / `<th scope="col">` markup and exposes `aria-sort`, `aria-selected` and `aria-busy`, so assistive tech gets the real thing. Selection composes `dm-checkbox`; the loading state composes `dm-skeleton`.

`data` is always the **full dataset** — the table derives the visible rows via a `filter → sort → paginate` pipeline. For server-side data give it a **`loadFn`** instead (see [Server-side pagination](#server-side-pagination-loadfn)): the table asks the server for one page at a time. `manualProcessing` remains as the low-level escape hatch — feed already filtered/sorted/paged rows in and the table only renders and emits events.

## Usage

```ts
import { DmTableComponent, DmTableColumn } from '@dmaster/ui';
```

```ts
interface User { id: number; name: string; email: string; role: string; }

readonly users = signal<User[]>([...]);
readonly selected = signal<(string | number)[]>([]);
readonly byId = (u: User) => u.id;

readonly columns: DmTableColumn<User>[] = [
  { key: 'name',  header: 'Name',  sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role',  header: 'Role',  sortable: true, align: 'center' },
];
```

```html
<dm-table
  [columns]="columns"
  [data]="users()"
  [rowKey]="byId"
  selectionMode="multiple"
  [searchable]="true"
  [pageSize]="10"
  [(selectedKeys)]="selected"
  caption="Team members"
/>
```

> **Selection needs a stable `rowKey`.** The default `rowKey` is the row index, which is fine for static tables but breaks selection across sorting/paging. Provide a field-based key (e.g. `(row) => row.id`) whenever you enable selection.

## API

| Input              | Type                                       | Default                 | Description                                                                   |
| ------------------ | ------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------- |
| `columns`          | `DmTableColumn<T>[]` _(required)_          | —                       | Column definitions.                                                           |
| `data`             | `T[]`                                      | `[]`                    | The **full** dataset — the table derives visible rows. Ignored with `loadFn`. |
| `rowKey`           | `(row: T, i: number) => string \| number`  | `index`                 | Row identity for `trackBy` and selection.                                     |
| `searchable`       | `boolean`                                  | `false`                 | Show the search box and filter rows by the term.                              |
| `searchTerm`       | `model<string>`                            | `''`                    | Two-way search term.                                                          |
| `selectionMode`    | `'none' \| 'single' \| 'multiple'`         | `'none'`                | Row-selection behaviour.                                                      |
| `selectedKeys`     | `model<(string \| number)[]>`              | `[]`                    | Two-way array of selected row keys.                                           |
| `pageSize`         | `model<number>`                            | `0`                     | Rows per page; `0` disables pagination.                                       |
| `page`             | `model<number>`                            | `1`                     | 1-indexed current page (two-way).                                             |
| `pageSizeOptions`  | `number[]`                                 | `[10, 25, 50]`          | Options for the rows-per-page selector.                                       |
| `loading`          | `boolean`                                  | `false`                 | Show a skeleton loading state.                                                |
| `density`          | `'compact' \| 'comfortable' \| 'spacious'` | `'comfortable'`         | Cell padding scale.                                                           |
| `variant`          | `'default' \| 'striped' \| 'bordered'`     | `'default'`             | Visual variant.                                                               |
| `hover`            | `boolean`                                  | `true`                  | Highlight the row under the pointer.                                          |
| `sticky`           | `boolean`                                  | `false`                 | Pin the header; the body scrolls inside `--dm-table-max-height`.              |
| `virtualScroll`    | `boolean`                                  | `false`                 | Virtualize rows (see [Virtual scroll](#virtual-scroll)).                      |
| `rowHeight`        | `number`                                   | `44`                    | Fixed row height (px) used as the viewport `itemSize`.                        |
| `viewportHeight`   | `string`                                   | `'24rem'`               | CSS height of the scroll viewport in virtual mode.                            |
| `caption`          | `string`                                   | `''`                    | Table title: shown in the toolbar, exposed as the `<caption>`.                |
| `ariaLabel`        | `string`                                   | `''`                    | Applied to the `<table>`.                                                     |
| `sortState`        | `model<DmTableSortState \| null>`          | `null`                  | Two-way sort state.                                                           |
| `manualProcessing` | `boolean`                                  | `false`                 | Disable internal filter/sort/paginate (server-side).                          |
| `totalItems`       | `number \| null`                           | `null`                  | Total count for the footer in manual mode.                                    |
| `loadFn`           | `DmTableLoadFn<T> \| null`                 | `null`                  | Server-side mode: fetch one page (see below). `data` is ignored.              |
| `searchDebounceMs` | `number`                                   | `250`                   | Async: quiet ms before the search term is sent to the server.                 |
| `loadErrorText`    | `string`                                   | `'Could not load rows'` | Async: message of the error state.                                            |
| `retryLabel`       | `string`                                   | `'Retry'`               | Async: label of the retry button.                                             |

Methods: `reload()` — async mode: fetch the current page again (after a mutation, or to retry a failed request).

Copy inputs (the library ships no baked-in text — override for i18n): `searchPlaceholder`, `emptyText`, `noResultsText`, `rangeLabel`, `pageLabel`, `selectedLabel`, `rowsPerPageLabel`, `clearSelectionLabel`, `selectRowLabel`, `selectAllLabel`, `firstPageLabel`, `prevPageLabel`, `nextPageLabel`, `lastPageLabel`.

| Output            | Payload                     | When                                      |
| ----------------- | --------------------------- | ----------------------------------------- |
| `rowClick`        | `{ row: T; index: number }` | A body row is clicked (not its checkbox). |
| `selectionChange` | `T[]`                       | The selection changes (the actual rows).  |
| `sortChange`      | `DmTableSortState \| null`  | The sort changes.                         |
| `pageChange`      | `DmTablePageState`          | The page or page size changes.            |
| `searchChange`    | `string`                    | The search term changes.                  |
| `loadError`       | `unknown`                   | A page request failed (async mode).       |

Types: `DmTableColumn<T>`, `DmTableSortState`, `DmTablePageState`, `DmTableLoadFn<T>`, `DmTableLoadParams`, `DmTableLoadResult<T>` (`{ items, total }`).

Content projection: place any element with the `dmTableActions` attribute to render it on the right of the toolbar (e.g. an “Export” or “Invite” button).

### Custom cell templates (`dmTableCell`)

A column's `cell` mapper can only return `string | number`. For rich cells —
badges, avatars, buttons, links — project an `ng-template[dmTableCell]` matched
by column `key`. Works in both render modes (native `<table>` and
`virtualScroll`); non-templated columns keep the plain value path.

```html
<dm-table [columns]="columns" [data]="users()">
  <ng-template dmTableCell="status" let-row let-i="index" let-col="column">
    <dm-badge [color]="row.active ? 'success' : 'default'" variant="flat">
      {{ row.status }}
    </dm-badge>
  </ng-template>
</dm-table>
```

Context: `$implicit` (the row, `let-row`), `index` and `column`. The template
controls **rendering only** — search and sort still read the column's
`cell` / `sortValue` / `key`, so keep those for sortable/searchable templated
columns.

### Custom empty state (`dmTableEmpty`)

Replace the built-in icon + `emptyText` block, e.g. with `dm-empty-state`. The
`filtered` context flag is `true` when the emptiness comes from the search
filtering every row out:

```html
<dm-table [columns]="columns" [data]="users()">
  <ng-template dmTableEmpty let-filtered="filtered">
    <dm-empty-state
      [title]="filtered ? 'No matches' : 'No users yet'"
      description="Invite your first teammate to get started."
    />
  </ng-template>
</dm-table>
```

### `DmTableColumn<T>`

| Field         | Type                                   | Description                                       |
| ------------- | -------------------------------------- | ------------------------------------------------- |
| `key`         | `string`                               | Identifier — also the default cell extractor key. |
| `header`      | `string`                               | Header text.                                      |
| `cell?`       | `(row: T) => string \| number \| null` | Custom extractor. Defaults to `row[key]`.         |
| `sortable?`   | `boolean`                              | Renders a sort button (asc → desc → null).        |
| `sortValue?`  | `(row: T) => string \| number \| null` | Custom value used for sorting/search.             |
| `searchable?` | `boolean`                              | Set `false` to exclude the column from search.    |
| `align?`      | `'start' \| 'center' \| 'end'`         | Alignment for both header and body cells.         |
| `width?`      | `string`                               | Column width — any CSS length.                    |
| `nowrap?`     | `boolean`                              | Keep cells on one line (dates, ids, amounts).     |
| `hidden?`     | `boolean`                              | Skip rendering the column entirely.               |

## Global defaults

```ts
providers: [
  provideTableDefaults({ density: 'compact', pageSize: 10, pageSizeOptions: [10, 25, 50] }),
];
```

Or provide `TABLE_DEFAULTS` directly.

## Server-side pagination (`loadFn`)

Give the table a `loadFn` instead of `data` and it becomes **server-driven**: search, sort, page and page size all round-trip to your API, one page at a time. The function receives `{ page, pageSize, query, sort }` (`page` is 1-indexed, like `[(page)]`) and returns an `Observable<{ items, total }>` — so it works directly with `HttpClient`. Under the hood it is Angular's `rxResource`: a request superseded by typing, paging or sorting is cancelled, never raced. Same contract as `dm-select`'s async mode.

```ts
import { DmTableLoadFn } from '@dmaster/ui';

loadUsers: DmTableLoadFn<User> = ({ page, pageSize, query, sort }) =>
  this.http
    .get<{ data: User[]; total: number }>('/api/users', {
      params: { page, pageSize, q: query, sort: sort ? `${sort.column}:${sort.direction}` : '' },
    })
    .pipe(map((res) => ({ items: res.data, total: res.total })));
```

```html
<dm-table
  #users
  [loadFn]="loadUsers"
  [columns]="columns"
  [rowKey]="byId"
  [pageSize]="20"
  [searchable]="true"
  selectionMode="multiple"
  [(selectedKeys)]="selected"
  (loadError)="toast.danger('Could not load users')"
/>

<dm-button (clicked)="users.reload()">Refresh</dm-button>
```

What the table does for you:

- **Search** is debounced (`searchDebounceMs`, 250 ms) and sent as `query`; the page resets to 1 in the same request, so a keystroke never fetches the old query. Clearing the box refetches immediately.
- **Sort** and **page size** changes reset to page 1 too, so you never land past the end.
- **No flashing**: the skeleton shows only for the first fetch. Later pages keep the current rows on screen — dimmed after a 150 ms grace period, so a fast server never flickers — until the new page lands (`aria-busy` throughout).
- **Errors** replace the body with an error state (`role="alert"`, `loadErrorText`) and a **retry** button (`retryLabel`) that calls `reload()`; `(loadError)` fires with the error so you can toast it. A failed request never auto-retries.
- **Selection** works across pages: select-all covers the loaded page, and `selectionChange` resolves rows selected on earlier pages (the table remembers every row it has loaded, by `rowKey` — so give it a stable one).
- `reload()` re-fetches the current page — call it after a mutation.

`total` is the full match count across every page; it drives the footer range and the page count. `manualProcessing` is still there for the fully manual variant (you own the fetching and hand the table the current page plus `totalItems`).

## Layout

The table is one quiet card: an optional **toolbar** (title · search · selection chip on the left, projected `dmTableActions` on the right), the scrollable table, and a **footer** (range summary, rows-per-page field, `dm-pagination`). Rows sit on a fixed rhythm — **44px** comfortable, **36px** compact, **52px** spacious — so a plain text row and a row holding a 24px avatar or a badge land on the same line; only taller content grows a row. Cells get 12px of inner padding and 16px at the outer edges, matching the toolbar and footer. Column headers are sentence case, medium weight and muted: told apart from the body by tone, not by a band.

The search box and the rows-per-page field follow the library's field contract (flat muted surface, elevates with a primary ring on focus, 32px tall), and the pager _is_ `dm-pagination` (size `sm`), so `providePaginationDefaults()` localizes its page-button labels app-wide.

To embed the table flush inside another card — one that already has a header and a frame — drop the table's own frame and radius:

```html
<dm-card padding="none">
  <div class="card-header">…</div>
  <dm-table
    style="--dm-table-frame-border: 0; --dm-table-radius: 0"
    [columns]="columns"
    [data]="rows()"
  />
</dm-card>
```

## Sticky header

`sticky` pins the header row while the body scrolls. A pinned header needs a scroll container of **bounded height**, so in sticky mode the table body is capped at `--dm-table-max-height` (`28rem` by default) and scrolls inside it. Set the token per instance to fit the layout, and turn pagination off (`[pageSize]="0"`) so the whole dataset scrolls under the header:

```html
<dm-table
  sticky
  [pageSize]="0"
  style="--dm-table-max-height: 32rem"
  [columns]="columns"
  [data]="rows()"
/>
```

## Motion

Every animation is timed by the `--dm-duration-*` / `--dm-ease-*` tokens, so under `prefers-reduced-motion` it all collapses to a cut — and the row reveal is skipped entirely.

- **Sort**: one arrow per sortable header, reserved in the layout so nothing shifts. It appears on hover (previewing ascending), turns solid when the column is the active sort and flips over for descending; a 2px accent underline grows from the centre of the sorted header and shrinks back when another column takes over.
- **Reveal after loading**: rows that replace the skeleton rise in with a short stagger (capped at 8 rows, 30 ms apart). The initial render, paging, sorting and searching never animate — only a `loading → data` transition does.
- **Selection chip** (a dismissible pill; its × carries `clearSelectionLabel`) and the search **clear** button pop in when they appear; the empty state fades in.

## Virtual scroll

For thousands of rows, set `[virtualScroll]="true"` so only the visible window of rows lives in the DOM:

```html
<dm-table
  [columns]="columns"
  [data]="millionRows()"
  [rowKey]="byId"
  [virtualScroll]="true"
  [rowHeight]="44"
  viewportHeight="32rem"
  [pageSize]="0"
/>
```

### Why the markup changes in this mode

`cdk-virtual-scroll-viewport` wraps its content in a `.cdk-virtual-scroll-content-wrapper` `<div>`, which is **not** a valid child of `<table>`/`<tbody>`. So virtual mode renders the table as a **CSS-grid of `<div>`s** with full ARIA semantics (`role="table"`/`rowgroup"`/`row"`/`columnheader"`/`cell"`) instead of a native `<table>`. Everything else — the search toolbar, sticky header (it sits _above_ the viewport), sort, row selection + hover, zebra/bordered variants, density and the footer/pagination — works exactly as in the native path.

- **Column alignment.** The header row and every virtualized body row share **one** `grid-template-columns` string, computed from the visible columns (plus the selection column when selectable) and applied via the `--dm-table-cols` custom property on the grid wrapper. Each column honors its `width`; columns without one get a flexible `minmax(0, 1fr)` track. This keeps the sticky header and the scrolled rows in lockstep.
- **Fixed `rowHeight` is required.** The CDK viewport needs a fixed item size. The default `44` matches the comfortable-density row height — lower it for `compact`, raise it for `spacious`. Cells are single-line (ellipsis-truncated) so rows never exceed `rowHeight`.
- **Turn pagination off (or use a huge `pageSize`).** Virtual scroll virtualizes whatever `pagedRows()` yields, so set `[pageSize]="0"` (all rows on one page) to let the viewport hold the full filtered set. The `search → sort → paginate` pipeline is otherwise unchanged, so search and sort still narrow/re-order the whole dataset before it is virtualized.

### Required styles

Virtual mode needs the CDK **scrolling** structural styles. These ship **inside the `CdkVirtualScrollViewport` component itself** (they are baked into `@angular/cdk`, not a separate stylesheet) — so **no extra global CSS import is required**: importing the component (which the library does) pulls them in automatically. This is on top of the `node_modules/@angular/cdk/overlay-prebuilt.css` the library already asks consumers to load for its overlay components; virtual scroll adds no new global CSS requirement.

## Accessibility

- Native `<table>` / `<thead>` / `<tbody>` markup (`role="table"` div-grid in `virtualScroll` mode), `<th scope="col">` for column headers. The `<caption>` is the table's accessible name; it is visually hidden and its text is drawn as the toolbar title instead.
- Sortable columns expose `aria-sort`; selected rows expose `aria-selected`; the table sets `aria-busy` while loading.
- The search box is a real `<input type="search">`; selection checkboxes and pager buttons carry descriptive, overridable ARIA labels.
- All controls are real `<button>` / `<input>` elements — keyboard-activatable with focus rings.
- Async mode: the table is `aria-busy` while a request is in flight, and a failed request renders a `role="alert"` block with a real retry button.

## Design tokens

Public CSS custom properties. Set them on `dm-table` (or any ancestor) to re-skin the table; every token falls back to the default shown.

| Token                        | Default                                              | Description                                                       |
| ---------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `--dm-table-bg`              | `var(--dm-bg)`                                       | Background of the table card wrapper.                             |
| `--dm-table-fg`              | `var(--dm-fg)`                                       | Body cell text color.                                             |
| `--dm-table-border`          | `var(--dm-border)`                                   | Every internal divider (rows, toolbar, footer) and the frame.     |
| `--dm-table-frame-border`    | `1px solid var(--dm-table-border)`                   | The outer frame. Set `0` to embed the table flush in a card.      |
| `--dm-table-radius`          | `var(--dm-radius-lg)`                                | Corner radius of the card wrapper.                                |
| `--dm-table-row-height`      | `2.75rem` (`2.25rem` compact, `3.25rem` spacious)    | Minimum body row height; taller content grows the row.            |
| `--dm-table-header-height`   | `2.5rem` (`2rem` compact, `3rem` spacious)           | Header row height.                                                |
| `--dm-table-max-height`      | `28rem`                                              | Height of the scroll container in `sticky` mode.                  |
| `--dm-table-caption-fg`      | `var(--dm-fg)`                                       | Toolbar title color.                                              |
| `--dm-table-header-bg`       | `transparent` (`--dm-table-bg` when `sticky`)        | Header row background (native and virtual-scroll modes).          |
| `--dm-table-header-fg`       | `var(--dm-fg-muted)`                                 | Header label color.                                               |
| `--dm-table-row-bg-hover`    | `color-mix(in srgb, var(--dm-fg) 4%, transparent)`   | Row background under the pointer when `hover` is on (6% striped). |
| `--dm-table-stripe-bg`       | `color-mix(in srgb, var(--dm-fg) 2.5%, transparent)` | Even-row background of the `striped` variant.                     |
| `--dm-table-row-bg-selected` | `var(--dm-primary-subtle)`                           | Background of selected rows.                                      |
