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

| Input              | Type                                       | Default         | Description                                            |
| ------------------ | ------------------------------------------ | --------------- | ------------------------------------------------------ |
| `columns`          | `DmTableColumn<T>[]` _(required)_          | —               | Column definitions.                                    |
| `data`             | `T[]` _(required)_                         | —               | The **full** dataset — the table derives visible rows. |
| `rowKey`           | `(row: T, i: number) => string \| number`  | `index`         | Row identity for `trackBy` and selection.              |
| `searchable`       | `boolean`                                  | `false`         | Show the search box and filter rows by the term.       |
| `searchTerm`       | `model<string>`                            | `''`            | Two-way search term.                                   |
| `selectionMode`    | `'none' \| 'single' \| 'multiple'`         | `'none'`        | Row-selection behaviour.                               |
| `selectedKeys`     | `model<(string \| number)[]>`              | `[]`            | Two-way array of selected row keys.                    |
| `pageSize`         | `model<number>`                            | `0`             | Rows per page; `0` disables pagination.                |
| `page`             | `model<number>`                            | `1`             | 1-indexed current page (two-way).                      |
| `pageSizeOptions`  | `number[]`                                 | `[10, 25, 50]`  | Options for the rows-per-page selector.                |
| `loading`          | `boolean`                                  | `false`         | Show a skeleton loading state.                         |
| `density`          | `'compact' \| 'comfortable' \| 'spacious'` | `'comfortable'` | Cell padding scale.                                    |
| `variant`          | `'default' \| 'striped' \| 'bordered'`     | `'default'`     | Visual variant.                                        |
| `hover`            | `boolean`                                  | `true`          | Highlight the row under the pointer.                   |
| `sticky`           | `boolean`                                  | `false`         | Pin the header while the body scrolls.                 |
| `caption`          | `string`                                   | `''`            | Rendered as `<caption>`.                               |
| `ariaLabel`        | `string`                                   | `''`            | Applied to the `<table>`.                              |
| `sortState`        | `model<DmTableSortState \| null>`          | `null`          | Two-way sort state.                                    |
| `manualProcessing` | `boolean`                                  | `false`         | Disable internal filter/sort/paginate (server-side).   |
| `totalItems`       | `number \| null`                           | `null`          | Total count for the footer in manual mode.             |

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

## Accessibility

- Native `<table>` / `<thead>` / `<tbody>` markup, `<th scope="col">` for column headers, `<caption>` announced first.
- Sortable columns expose `aria-sort`; selected rows expose `aria-selected`; the table sets `aria-busy` while loading.
- The search box is a real `<input type="search">`; selection checkboxes and pager buttons carry descriptive, overridable ARIA labels.
- All controls are real `<button>` / `<input>` elements — keyboard-activatable with focus rings.
