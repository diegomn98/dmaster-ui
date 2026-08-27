# Table (`dm-table`)

A premium, data-driven table with a declarative column API. Out of the box it **searches, sorts, selects and paginates** — all internally, all controllable through two-way models. It renders native `<table>` / `<caption>` / `<thead>` / `<tbody>` / `<th scope="col">` markup and exposes `aria-sort`, `aria-selected` and `aria-busy`, so assistive tech gets the real thing. Selection composes `dm-checkbox`; the loading state composes `dm-skeleton`.

`data` is always the **full dataset** — the table derives the visible rows via a `filter → sort → paginate` pipeline. For server-side data set `[manualProcessing]="true"` and feed already filtered/sorted/paged rows in; the table then only renders and emits events.

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

| Input              | Type                                       | Default         | Description                                              |
| ------------------ | ------------------------------------------ | --------------- | -------------------------------------------------------- |
| `columns`          | `DmTableColumn<T>[]` _(required)_          | —               | Column definitions.                                      |
| `data`             | `T[]` _(required)_                         | —               | The **full** dataset — the table derives visible rows.   |
| `rowKey`           | `(row: T, i: number) => string \| number`  | `index`         | Row identity for `trackBy` and selection.                |
| `searchable`       | `boolean`                                  | `false`         | Show the search box and filter rows by the term.         |
| `searchTerm`       | `model<string>`                            | `''`            | Two-way search term.                                     |
| `selectionMode`    | `'none' \| 'single' \| 'multiple'`         | `'none'`        | Row-selection behaviour.                                 |
| `selectedKeys`     | `model<(string \| number)[]>`              | `[]`            | Two-way array of selected row keys.                      |
| `pageSize`         | `model<number>`                            | `0`             | Rows per page; `0` disables pagination.                  |
| `page`             | `model<number>`                            | `1`             | 1-indexed current page (two-way).                        |
| `pageSizeOptions`  | `number[]`                                 | `[10, 25, 50]`  | Options for the rows-per-page selector.                  |
| `loading`          | `boolean`                                  | `false`         | Show a skeleton loading state.                           |
| `density`          | `'compact' \| 'comfortable' \| 'spacious'` | `'comfortable'` | Cell padding scale.                                      |
| `variant`          | `'default' \| 'striped' \| 'bordered'`     | `'default'`     | Visual variant.                                          |
| `hover`            | `boolean`                                  | `true`          | Highlight the row under the pointer.                     |
| `sticky`           | `boolean`                                  | `false`         | Pin the header while the body scrolls.                   |
| `virtualScroll`    | `boolean`                                  | `false`         | Virtualize rows (see [Virtual scroll](#virtual-scroll)). |
| `rowHeight`        | `number`                                   | `44`            | Fixed row height (px) used as the viewport `itemSize`.   |
| `viewportHeight`   | `string`                                   | `'24rem'`       | CSS height of the scroll viewport in virtual mode.       |
| `caption`          | `string`                                   | `''`            | Rendered as `<caption>`.                                 |
| `ariaLabel`        | `string`                                   | `''`            | Applied to the `<table>`.                                |
| `sortState`        | `model<DmTableSortState \| null>`          | `null`          | Two-way sort state.                                      |
| `manualProcessing` | `boolean`                                  | `false`         | Disable internal filter/sort/paginate (server-side).     |
| `totalItems`       | `number \| null`                           | `null`          | Total count for the footer in manual mode.               |

Copy inputs (the library ships no baked-in text — override for i18n): `searchPlaceholder`, `emptyText`, `noResultsText`, `rangeLabel`, `pageLabel`, `selectedLabel`, `rowsPerPageLabel`, `clearSelectionLabel`, `selectRowLabel`, `selectAllLabel`, `firstPageLabel`, `prevPageLabel`, `nextPageLabel`, `lastPageLabel`.

| Output            | Payload                     | When                                      |
| ----------------- | --------------------------- | ----------------------------------------- |
| `rowClick`        | `{ row: T; index: number }` | A body row is clicked (not its checkbox). |
| `selectionChange` | `T[]`                       | The selection changes (the actual rows).  |
| `sortChange`      | `DmTableSortState \| null`  | The sort changes.                         |
| `pageChange`      | `DmTablePageState`          | The page or page size changes.            |
| `searchChange`    | `string`                    | The search term changes.                  |

Content projection: place any element with the `dmTableActions` attribute to render it on the right of the toolbar (e.g. an “Export” or “Invite” button).

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
| `hidden?`     | `boolean`                              | Skip rendering the column entirely.               |

## Global defaults

```ts
providers: [
  provideTableDefaults({ density: 'compact', pageSize: 10, pageSizeOptions: [10, 25, 50] }),
];
```

Or provide `TABLE_DEFAULTS` directly.

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

- Native `<table>` / `<thead>` / `<tbody>` markup (`role="table"` div-grid in `virtualScroll` mode), `<th scope="col">` for column headers, `<caption>` announced first.
- Sortable columns expose `aria-sort`; selected rows expose `aria-selected`; the table sets `aria-busy` while loading.
- The search box is a real `<input type="search">`; selection checkboxes and pager buttons carry descriptive, overridable ARIA labels.
- All controls are real `<button>` / `<input>` elements — keyboard-activatable with focus rings.

## Design tokens

Public CSS custom properties. Set them on `dm-table` (or any ancestor) to re-skin the table; every token falls back to the default shown.

| Token                        | Default                                            | Description                                                    |
| ---------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `--dm-table-bg`              | `var(--dm-bg)`                                     | Background of the table card wrapper.                          |
| `--dm-table-fg`              | `var(--dm-fg)`                                     | Body cell text color.                                          |
| `--dm-table-border`          | `var(--dm-border)`                                 | Outer border and every internal divider (rows, toolbar, footer). |
| `--dm-table-radius`          | `var(--dm-radius-lg)`                              | Corner radius of the card wrapper.                             |
| `--dm-table-header-bg`       | `var(--dm-bg-subtle)`                              | Header row background (native and virtual-scroll modes).       |
| `--dm-table-header-fg`       | `var(--dm-fg-muted)`                               | Header label color.                                            |
| `--dm-table-row-bg-hover`    | `var(--dm-bg-subtle)` (`var(--dm-bg-muted)` striped) | Row background under the pointer when `hover` is on.           |
| `--dm-table-stripe-bg`       | `var(--dm-bg-subtle)`                              | Even-row background of the `striped` variant.                  |
| `--dm-table-row-bg-selected` | `var(--dm-primary-subtle)`                         | Background of selected rows.                                   |
