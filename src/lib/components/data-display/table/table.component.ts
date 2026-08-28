import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  TemplateRef,
  untracked,
  viewChild,
} from '@angular/core';

import { DmCheckboxComponent } from '../../forms/checkbox';
import { DmSkeletonComponent } from '../../primitives/skeleton';
import { DmTableCellContext, DmTableCellDirective } from './table-cell.directive';
import { DmTableEmptyDirective } from './table-empty.directive';
import { TABLE_DEFAULTS } from './table.tokens';
import {
  DmTableColumn,
  DmTableDensity,
  DmTableKey,
  DmTablePageState,
  DmTableRowClickEvent,
  DmTableRowKey,
  DmTableSelectionMode,
  DmTableSortState,
  DmTableVariant,
} from './table.types';

/**
 * Premium data table with a declarative column API. Out of the box it filters
 * (global search), sorts and paginates its data internally — everything is
 * controllable through two-way models (`searchTerm`, `sortState`, `page`,
 * `pageSize`, `selectedKeys`). Renders semantic `<table>` markup with
 * `aria-sort`, `aria-selected` and a search landmark, so assistive tech gets
 * the real thing.
 *
 * ```html
 * <dm-table
 *   [columns]="columns"
 *   [data]="users()"
 *   [rowKey]="byId"
 *   selectionMode="multiple"
 *   [searchable]="true"
 *   [pageSize]="10"
 *   [(selectedKeys)]="selected"
 *   caption="Team roster" />
 * ```
 *
 * The `data` input is always the FULL dataset — the table derives the visible
 * rows. For server-side data set `[manualProcessing]="true"` and feed already
 * filtered/sorted/paged rows in; the table then only renders and emits events.
 */
let nextCaptionId = 0;

@Component({
  selector: 'dm-table',
  imports: [DmCheckboxComponent, DmSkeletonComponent, NgTemplateOutlet, ScrollingModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmTableComponent<T = unknown> {
  private readonly defaults = inject(TABLE_DEFAULTS);

  /** The CDK viewport instance (present only in virtual-scroll mode). */
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  /**
   * The CDK virtual-scroll viewport schedules its range recomputation +
   * re-render through `NgZone.onStable`, which NEVER emits in a zoneless app —
   * so on scroll the rendered range is stuck at its initial window and rows
   * never advance (they render once and freeze). `checkViewportSize()` is the
   * one public CDK API that recomputes the rendered range *synchronously*
   * (it re-measures and re-runs the scroll strategy) instead of deferring to
   * `onStable`. Routing the viewport's `(scroll)` through it makes virtual
   * scroll work under zoneless change detection.
   */
  protected onViewportScroll(): void {
    this.viewport()?.checkViewportSize();
  }

  // ---- Data ----------------------------------------------------------------
  /** Column definitions. */
  readonly columns = input.required<DmTableColumn<T>[]>();

  /** The full dataset. The table filters/sorts/paginates it internally. */
  readonly data = input.required<T[]>();

  /** Row identity function used as `trackBy` and for selection. */
  readonly rowKey = input<DmTableRowKey<T>>((_row, index) => index);

  // ---- Appearance ----------------------------------------------------------
  /** Cell padding scale. */
  readonly density = input<DmTableDensity>(this.defaults.density);

  /** Visual variant. */
  readonly variant = input<DmTableVariant>(this.defaults.variant);

  /** Highlight the row under the pointer. */
  readonly hover = input(this.defaults.hover, { transform: booleanAttribute });

  /** Pin the header to the top of the container while scrolling. */
  readonly sticky = input(this.defaults.sticky, { transform: booleanAttribute });

  // ---- Virtual scroll ------------------------------------------------------
  /**
   * Render the rows inside a `cdk-virtual-scroll-viewport` so only the visible
   * window of rows exists in the DOM — the way to render thousands of rows
   * without bloating it. In this mode the table is drawn as a CSS-grid of
   * `<div>`s (with full `role="table"` semantics) instead of a native
   * `<table>`, because the CDK viewport wrapper is not a valid table child.
   * Requires a fixed `rowHeight`; works best with pagination off (`pageSize=0`)
   * or a large page size so the viewport holds the full filtered set.
   */
  readonly virtualScroll = input(false, { transform: booleanAttribute });

  /**
   * Fixed row height in px used as the viewport's `itemSize` when
   * `virtualScroll` is on. The default (`44`) matches the comfortable-density
   * row height; bump it for `spacious` / lower it for `compact`.
   */
  readonly rowHeight = input<number>(44);

  /** CSS height of the scroll viewport when `virtualScroll` is on. */
  readonly viewportHeight = input<string>('24rem');

  /** Accessible caption — rendered as `<caption>`. */
  readonly caption = input<string>('');

  /** ARIA label applied to the `<table>`. */
  readonly ariaLabel = input<string>('');

  // ---- Search --------------------------------------------------------------
  /** Show the search box in the toolbar and filter rows by the term. */
  readonly searchable = input(false, { transform: booleanAttribute });

  /** Placeholder for the search box. */
  readonly searchPlaceholder = input<string>('Search…');

  /** Two-way bound search term. */
  readonly searchTerm = model<string>('');

  // ---- Selection -----------------------------------------------------------
  /** Row-selection behaviour: none, single or multiple. */
  readonly selectionMode = input<DmTableSelectionMode>('none');

  /** Two-way bound array of selected row keys. */
  readonly selectedKeys = model<DmTableKey[]>([]);

  /** ARIA label for the per-row selection checkbox. */
  readonly selectRowLabel = input<string>('Select row');

  /** ARIA label for the select-all checkbox. */
  readonly selectAllLabel = input<string>('Select all rows');

  // ---- Pagination ----------------------------------------------------------
  /** Rows per page. `0` disables pagination (a single page with every row). */
  readonly pageSize = model<number>(this.defaults.pageSize);

  /** 1-indexed current page. */
  readonly page = model<number>(1);

  /** Options offered by the rows-per-page selector. Empty hides the selector. */
  readonly pageSizeOptions = input<number[]>(this.defaults.pageSizeOptions);

  // ---- States --------------------------------------------------------------
  /** Show a skeleton loading state instead of rows. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Number of skeleton rows rendered while loading. */
  readonly loadingRows = input<number>(5);

  /** Message shown when there are no rows at all. */
  readonly emptyText = input<string>('No data');

  /** Message shown when the search filters every row out. */
  readonly noResultsText = input<string>('No results found');

  // ---- Copy (the library ships no baked-in text; override for i18n) ---------
  /** Footer range summary, e.g. `1–10 of 42`. */
  readonly rangeLabel = input<(start: number, end: number, total: number) => string>(
    (start, end, total) => `${start}–${end} of ${total}`,
  );

  /** Page indicator, e.g. `Page 2 of 5`. */
  readonly pageLabel = input<(page: number, count: number) => string>(
    (page, count) => `Page ${page} of ${count}`,
  );

  /** Selected-count chip, e.g. `3 selected`. */
  readonly selectedLabel = input<(count: number) => string>((count) => `${count} selected`);

  /** Label for the rows-per-page selector. */
  readonly rowsPerPageLabel = input<string>('Rows per page');

  /** Clear-selection button label. */
  readonly clearSelectionLabel = input<string>('Clear');

  /** ARIA labels for the pager buttons. */
  readonly firstPageLabel = input<string>('First page');
  readonly prevPageLabel = input<string>('Previous page');
  readonly nextPageLabel = input<string>('Next page');
  readonly lastPageLabel = input<string>('Last page');

  // ---- Server-side ---------------------------------------------------------
  /**
   * Disable internal filter/sort/paginate. `data` is rendered as-is and the
   * table only emits `searchChange`/`sortChange`/`pageChange` for you to react
   * to. Use `totalItems` to drive the footer counts.
   */
  readonly manualProcessing = input(false, { transform: booleanAttribute });

  /** Total row count for the footer when `manualProcessing` is on. */
  readonly totalItems = input<number | null>(null);

  // ---- Outputs -------------------------------------------------------------
  /** Fires whenever the sort state changes (asc → desc → null). */
  readonly sortChange = output<DmTableSortState | null>();

  /** Fires when a body row is clicked (not when its checkbox is toggled). */
  readonly rowClick = output<DmTableRowClickEvent<T>>();

  /** Fires with the selected rows whenever the selection changes. */
  readonly selectionChange = output<T[]>();

  /** Fires when the page or page size changes. */
  readonly pageChange = output<DmTablePageState>();

  /** Fires when the search term changes. */
  readonly searchChange = output<string>();

  // ---- Two-way sort --------------------------------------------------------
  /** Two-way bound sort state. `null` means unsorted. */
  readonly sortState = model<DmTableSortState | null>(null);

  constructor() {
    // Searching resets to the first page — otherwise you can land on an empty
    // page. Only reacts to term changes, never clobbers an initial `[page]`.
    let firstRun = true;
    effect(() => {
      this.searchTerm();
      if (firstRun) {
        firstRun = false;
        return;
      }
      untracked(() => this.page.set(1));
    });
  }

  // ---- Content templates ---------------------------------------------------
  /** Projected `ng-template[dmTableCell]`s, one per templated column. */
  private readonly cellTemplates = contentChildren<DmTableCellDirective<T>>(DmTableCellDirective);

  /** Optional projected `ng-template[dmTableEmpty]` replacing the empty block. */
  private readonly emptyDirective = contentChild(DmTableEmptyDirective);

  /** Column key → custom cell template. */
  private readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<DmTableCellContext<T>>>();
    for (const tpl of this.cellTemplates()) {
      map.set(tpl.dmTableCell(), tpl.templateRef);
    }
    return map;
  });

  /** The custom template for a column, or `null` to render the plain value. */
  protected cellTemplateFor(col: DmTableColumn<T>): TemplateRef<DmTableCellContext<T>> | null {
    return this.cellTemplateMap().get(col.key) ?? null;
  }

  protected readonly emptyTemplate = computed(() => this.emptyDirective()?.templateRef ?? null);

  /** Context builder for a templated cell. */
  protected cellContext(row: T, index: number, column: DmTableColumn<T>): DmTableCellContext<T> {
    return { $implicit: row, index, column };
  }

  // ---- Derived columns -----------------------------------------------------
  protected readonly visibleColumns = computed(() => this.columns().filter((col) => !col.hidden));

  protected readonly searchableColumns = computed(() =>
    this.visibleColumns().filter((col) => col.searchable !== false),
  );

  protected readonly hasSelection = computed(() => this.selectionMode() !== 'none');
  protected readonly showSelectAll = computed(() => this.selectionMode() === 'multiple');

  protected readonly colspan = computed(
    () => this.visibleColumns().length + (this.hasSelection() ? 1 : 0),
  );

  /**
   * `grid-template-columns` string shared by the sticky header row and every
   * virtualized body row (via the `--dm-table-cols` custom property) so their
   * columns stay aligned. The optional selection column is a `min-content`
   * track; each data column honors its `width` or falls back to a flexible
   * `minmax(0, 1fr)` track.
   */
  protected readonly gridTemplate = computed(() => {
    const tracks: string[] = [];
    if (this.hasSelection()) tracks.push('min-content');
    for (const col of this.visibleColumns()) {
      tracks.push(col.width ? col.width : 'minmax(0, 1fr)');
    }
    return tracks.join(' ');
  });

  /** Stable id wiring the virtual-mode caption to the `role="table"` element. */
  protected readonly captionId = `dm-table-caption-${nextCaptionId++}`;

  // ---- Processing pipeline: filter → sort → paginate -----------------------
  /** Filtered + sorted rows across ALL pages (empty in manual mode). */
  protected readonly processedRows = computed<T[]>(() => {
    if (this.manualProcessing()) return this.data();
    const filtered = this.data().filter((row) => this.matchesSearch(row));
    return this.sortRows(filtered);
  });

  protected readonly totalRows = computed(() => {
    if (this.manualProcessing()) {
      return this.totalItems() ?? this.data().length;
    }
    return this.processedRows().length;
  });

  protected readonly pageCount = computed(() => {
    const size = this.pageSize();
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(this.totalRows() / size));
  });

  protected readonly safePage = computed(() =>
    Math.min(Math.max(1, this.page()), this.pageCount()),
  );

  /** Rows actually rendered in the current page. */
  protected readonly pagedRows = computed<T[]>(() => {
    if (this.manualProcessing()) return this.data();
    const size = this.pageSize();
    const rows = this.processedRows();
    if (size <= 0) return rows;
    const start = (this.safePage() - 1) * size;
    return rows.slice(start, start + size);
  });

  // ---- Footer range --------------------------------------------------------
  protected readonly showPagination = computed(
    () => this.pageSize() > 0 && (this.manualProcessing() || this.totalRows() > 0),
  );

  protected readonly rangeStart = computed(() => {
    if (this.totalRows() === 0) return 0;
    if (this.pageSize() <= 0) return 1;
    return (this.safePage() - 1) * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() => {
    if (this.pageSize() <= 0) return this.totalRows();
    return Math.min(this.safePage() * this.pageSize(), this.totalRows());
  });

  /**
   * Windowed page list for the numbered pager: first, last, the current page
   * ±1, and `…` gaps in between. Collapses to a plain sequence at ≤7 pages.
   */
  protected readonly pageItems = computed<
    ({ kind: 'page'; page: number } | { kind: 'gap'; id: string })[]
  >(() => {
    const count = this.pageCount();
    const current = this.safePage();
    const items: ({ kind: 'page'; page: number } | { kind: 'gap'; id: string })[] = [];
    const page = (p: number) => items.push({ kind: 'page', page: p });
    if (count <= 7) {
      for (let p = 1; p <= count; p++) page(p);
      return items;
    }
    page(1);
    const left = Math.max(2, current - 1);
    const right = Math.min(count - 1, current + 1);
    if (left > 2) items.push({ kind: 'gap', id: 'gap-left' });
    for (let p = left; p <= right; p++) page(p);
    if (right < count - 1) items.push({ kind: 'gap', id: 'gap-right' });
    page(count);
    return items;
  });

  // ---- Selection state -----------------------------------------------------
  protected readonly selectedSet = computed<Set<DmTableKey>>(() => new Set(this.selectedKeys()));

  /** Keys of all rows in the current filtered result (all pages). */
  private readonly selectableKeys = computed<DmTableKey[]>(() =>
    (this.manualProcessing() ? this.data() : this.processedRows()).map((row, index) =>
      this.rowKey()(row, index),
    ),
  );

  protected readonly allSelected = computed(() => {
    const keys = this.selectableKeys();
    if (keys.length === 0) return false;
    const set = this.selectedSet();
    return keys.every((k) => set.has(k));
  });

  protected readonly someSelected = computed(() => {
    if (this.allSelected()) return false;
    const set = this.selectedSet();
    return this.selectableKeys().some((k) => set.has(k));
  });

  protected readonly selectedCount = computed(() => this.selectedKeys().length);

  // ---- State flags ---------------------------------------------------------
  protected readonly isEmpty = computed(() => !this.loading() && this.totalRows() === 0);
  protected readonly isFilteredEmpty = computed(
    () => this.isEmpty() && !this.manualProcessing() && this.searchTerm().trim().length > 0,
  );

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(1, this.loadingRows()) }, (_v, i) => i),
  );

  // ---- Row helpers ---------------------------------------------------------
  protected trackFn = (row: T, index: number): DmTableKey => this.rowKey()(row, index);

  /** `trackBy` for `*cdkVirtualFor` — note the `(index, row)` argument order. */
  protected vTrackBy = (index: number, row: T): DmTableKey => this.rowKey()(row, index);

  protected isSelected(row: T, index: number): boolean {
    return this.selectedSet().has(this.rowKey()(row, index));
  }

  protected getCellValue(row: T, col: DmTableColumn<T>): string | number | null {
    if (col.cell) return col.cell(row);
    const value = (row as Record<string, unknown>)[col.key];
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number') return value;
    return String(value);
  }

  // ---- Search --------------------------------------------------------------
  private matchesSearch(row: T): boolean {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return true;
    return this.searchableColumns().some((col) => {
      const value = col.sortValue ? col.sortValue(row) : this.getCellValue(row, col);
      return value !== null && value !== undefined && String(value).toLowerCase().includes(term);
    });
  }

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.searchChange.emit(value);
  }

  protected clearSearch(): void {
    this.onSearchInput('');
  }

  // ---- Sort ----------------------------------------------------------------
  private sortRows(rows: T[]): T[] {
    const state = this.sortState();
    if (!state) return rows;
    const col = this.columns().find((c) => c.key === state.column);
    if (!col) return rows;
    const dir = state.direction === 'asc' ? 1 : -1;
    const accessor = (row: T) => (col.sortValue ? col.sortValue(row) : this.getCellValue(row, col));
    return [...rows].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av === null || av === undefined) return bv === null || bv === undefined ? 0 : 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }

  protected onSort(col: DmTableColumn<T>): void {
    if (!col.sortable) return;
    const current = this.sortState();
    let next: DmTableSortState | null;
    if (!current || current.column !== col.key) {
      next = { column: col.key, direction: 'asc' };
    } else if (current.direction === 'asc') {
      next = { column: col.key, direction: 'desc' };
    } else {
      next = null;
    }
    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  protected ariaSortFor(col: DmTableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) return null;
    const s = this.sortState();
    if (!s || s.column !== col.key) return 'none';
    return s.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected sortDataAttr(col: DmTableColumn<T>): 'asc' | 'desc' | 'none' | null {
    if (!col.sortable) return null;
    const s = this.sortState();
    if (!s || s.column !== col.key) return 'none';
    return s.direction;
  }

  // ---- Selection -----------------------------------------------------------
  protected toggleRow(row: T, index: number): void {
    const key = this.rowKey()(row, index);
    if (this.selectionMode() === 'single') {
      const isSel = this.selectedSet().has(key);
      this.commitSelection(isSel ? [] : [key]);
      return;
    }
    const set = new Set(this.selectedKeys());
    if (set.has(key)) set.delete(key);
    else set.add(key);
    this.commitSelection([...set]);
  }

  protected toggleAll(): void {
    const keys = this.selectableKeys();
    if (this.allSelected()) {
      const remove = new Set(keys);
      this.commitSelection(this.selectedKeys().filter((k) => !remove.has(k)));
    } else {
      this.commitSelection([...new Set([...this.selectedKeys(), ...keys])]);
    }
  }

  protected clearSelection(): void {
    this.commitSelection([]);
  }

  private commitSelection(keys: DmTableKey[]): void {
    this.selectedKeys.set(keys);
    const set = new Set(keys);
    const rows = this.data().filter((row, index) => set.has(this.rowKey()(row, index)));
    this.selectionChange.emit(rows);
  }

  // ---- Pagination ----------------------------------------------------------
  protected setPage(next: number): void {
    const clamped = Math.min(Math.max(1, next), this.pageCount());
    if (clamped === this.page()) return;
    this.page.set(clamped);
    this.pageChange.emit({ page: clamped, pageSize: this.pageSize() });
  }

  protected firstPage(): void {
    this.setPage(1);
  }

  protected prevPage(): void {
    this.setPage(this.safePage() - 1);
  }

  protected nextPage(): void {
    this.setPage(this.safePage() + 1);
  }

  protected lastPage(): void {
    this.setPage(this.pageCount());
  }

  protected onPageSizeChange(value: string): void {
    const size = Number(value) || 0;
    this.pageSize.set(size);
    this.page.set(1);
    this.pageChange.emit({ page: 1, pageSize: size });
  }

  // ---- Row click -----------------------------------------------------------
  protected onRowClick(row: T, index: number): void {
    this.rowClick.emit({ row, index });
  }
}
