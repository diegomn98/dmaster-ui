import { Observable } from 'rxjs';

/** Sort direction cycled by clicking a sortable column header. */
export type DmTableSortDirection = 'asc' | 'desc';

/** Current sort state exposed by `[(sortState)]` and `sortChange`. */
export interface DmTableSortState {
  column: string;
  direction: DmTableSortDirection;
}

/** Density scale applied to cell padding. */
export type DmTableDensity = 'compact' | 'comfortable' | 'spacious';

/** Visual variant of the table body. */
export type DmTableVariant = 'default' | 'striped' | 'bordered';

/** Alignment applied to both the header cell and body cell of a column. */
export type DmTableColumnAlign = 'start' | 'center' | 'end';

/** Row-selection behaviour. */
export type DmTableSelectionMode = 'none' | 'single' | 'multiple';

/** Stable identifier for a row (string or number). */
export type DmTableKey = string | number;

/**
 * Declarative column definition. Data-driven: the table renders one `<th>`
 * per column in `columns` and one `<td>` per row/column intersection.
 */
export interface DmTableColumn<T = unknown> {
  /** Unique identifier — also used as the default cell extractor key. */
  key: string;
  /** Human-readable header text (rendered inside `<th>`). */
  header: string;
  /**
   * Cell value extractor. Called for every row.
   * Defaults to `row[key]` when omitted.
   */
  cell?: (row: T) => string | number | null;
  /** Renders a sort button in the header that cycles asc → desc → unsorted. */
  sortable?: boolean;
  /**
   * Custom value used when sorting this column. Falls back to the cell value.
   * Useful when the displayed text differs from the sort key (formatted dates,
   * currency, etc.).
   */
  sortValue?: (row: T) => string | number | null;
  /**
   * Exclude this column from the global search. By default every column with a
   * string/number value is searched.
   */
  searchable?: boolean;
  /** Alignment applied to both header and body cells for this column. */
  align?: DmTableColumnAlign;
  /** Optional column width — any CSS length (`'120px'`, `'20%'`, …). */
  width?: string;
  /** Keep this column's cells on one line (dates, ids, amounts) instead of wrapping. */
  nowrap?: boolean;
  /** Skip rendering this column entirely (both header and cells). */
  hidden?: boolean;
}

/** Payload emitted by `(rowClick)`. */
export interface DmTableRowClickEvent<T = unknown> {
  row: T;
  index: number;
}

/** Payload emitted by `(pageChange)`. */
export interface DmTablePageState {
  /** 1-indexed current page. */
  page: number;
  /** Rows per page (`0` = all rows on a single page). */
  pageSize: number;
}

/** `trackBy`-style row identity used by the `@for` block and by selection. */
export type DmTableRowKey<T = unknown> = (row: T, index: number) => DmTableKey;

// ---------------------------------------------------------------------------
// Server-driven (async) mode — the table loads one page at a time via `loadFn`.
// ---------------------------------------------------------------------------

/** One page as answered by the server. */
export interface DmTableLoadResult<T = unknown> {
  /** The rows of the requested page. */
  items: T[];
  /** Matching rows across every page — drives the footer range and the page count. */
  total: number;
}

/** What the table asks the server for. `page` is 1-indexed, like `[(page)]`. */
export interface DmTableLoadParams {
  page: number;
  pageSize: number;
  /** The debounced search term (`''` when the box is empty). */
  query: string;
  sort: DmTableSortState | null;
}

/**
 * Fetches one page. Returns an Observable so `rxResource` can cancel a request
 * superseded by typing, paging or sorting — works directly with `HttpClient`.
 *
 * ```ts
 * loadUsers: DmTableLoadFn<User> = ({ page, pageSize, query, sort }) =>
 *   this.http
 *     .get<{ data: User[]; total: number }>('/api/users', { params: { page, pageSize, query } })
 *     .pipe(map((res) => ({ items: res.data, total: res.total })));
 * ```
 */
export type DmTableLoadFn<T = unknown> = (
  params: DmTableLoadParams,
) => Observable<DmTableLoadResult<T>>;
