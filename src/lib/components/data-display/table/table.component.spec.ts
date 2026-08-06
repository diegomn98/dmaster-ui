import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTableComponent } from './table.component';
import { TABLE_DEFAULTS } from './table.tokens';
import { DmTableColumn, DmTableRowClickEvent, DmTableSortState } from './table.types';

interface Row {
  id: number;
  name: string;
  role: string;
}

const COLUMNS: DmTableColumn<Row>[] = [
  { key: 'id', header: 'Id', sortable: true, align: 'end', width: '60px' },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
];

const ROWS: Row[] = [
  { id: 1, name: 'Ada', role: 'Engineer' },
  { id: 2, name: 'Grace', role: 'Admiral' },
  { id: 3, name: 'Katherine', role: 'Mathematician' },
];

const byId = (row: Row) => row.id;

describe('DmTableComponent', () => {
  let fixture: ComponentFixture<DmTableComponent<Row>>;

  function create(overrides: Record<string, unknown> = {}): void {
    fixture = TestBed.createComponent(DmTableComponent<Row>);
    fixture.componentRef.setInput('columns', overrides['columns'] ?? COLUMNS);
    fixture.componentRef.setInput('data', overrides['data'] ?? ROWS);
    fixture.componentRef.setInput('rowKey', overrides['rowKey'] ?? byId);
    for (const [key, value] of Object.entries(overrides)) {
      if (key === 'columns' || key === 'data' || key === 'rowKey') continue;
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  const el = (sel: string): HTMLElement => fixture.nativeElement.querySelector(sel);
  const all = (sel: string): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll(sel));

  function wrapper(): HTMLElement {
    return el('.dm-table');
  }
  function tableEl(): HTMLTableElement {
    return el('.dm-table__table') as HTMLTableElement;
  }
  function dataThs(): HTMLElement[] {
    return all('.dm-table__th:not(.dm-table__th--select)');
  }
  function bodyRows(): HTMLElement[] {
    return all('.dm-table__body .dm-table__tr');
  }
  function tds(rowIndex: number): HTMLElement[] {
    return Array.from(
      bodyRows()[rowIndex].querySelectorAll('.dm-table__td:not(.dm-table__td--select)'),
    );
  }
  function nameCells(): string[] {
    return bodyRows().map((r) => {
      const cells = r.querySelectorAll('.dm-table__td:not(.dm-table__td--select)');
      return cells[1]?.textContent?.trim() ?? '';
    });
  }
  function rowCheckboxes(): HTMLInputElement[] {
    return all('.dm-table__td--select input[type="checkbox"]') as HTMLInputElement[];
  }
  function selectAllCheckbox(): HTMLInputElement {
    return el('.dm-table__th--select input[type="checkbox"]') as HTMLInputElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  // ---- Rendering -----------------------------------------------------------

  it('renders one <th scope="col"> per column and one row per data entry', () => {
    create();
    expect(dataThs().length).toBe(COLUMNS.length);
    for (const th of dataThs()) {
      expect(th.getAttribute('scope')).toBe('col');
      expect(th.tagName).toBe('TH');
    }
    expect(bodyRows().length).toBe(ROWS.length);
    expect(tds(0)[0].textContent?.trim()).toBe('1');
    expect(tds(0)[1].textContent?.trim()).toBe('Ada');
    expect(tds(2)[2].textContent?.trim()).toBe('Mathematician');
  });

  it('renders / omits the caption', () => {
    create({ caption: 'Team roster' });
    expect(el('caption')?.textContent?.trim()).toBe('Team roster');
    create();
    expect(fixture.nativeElement.querySelector('caption')).toBeNull();
  });

  it('skips hidden columns', () => {
    create({
      columns: [
        { key: 'id', header: 'Id' },
        { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role', hidden: true },
      ] satisfies DmTableColumn<Row>[],
    });
    expect(dataThs().map((th) => th.textContent?.trim())).toEqual(['Id', 'Name']);
    expect(tds(0).length).toBe(2);
  });

  it('uses cell() when provided instead of row[key]', () => {
    create({
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'label', header: 'Label', cell: (row: Row) => `#${row.id} — ${row.role}` },
      ] satisfies DmTableColumn<Row>[],
    });
    expect(tds(0)[1].textContent?.trim()).toBe('#1 — Engineer');
  });

  it('renders empty text when the extracted value is null / undefined', () => {
    create({ data: [{ id: 1, name: 'Ada', role: null as unknown as string }] });
    expect(tds(0)[2].textContent?.trim()).toBe('');
  });

  // ---- Row click -----------------------------------------------------------

  it('emits rowClick with the row and its index', () => {
    create();
    const received: DmTableRowClickEvent<Row>[] = [];
    fixture.componentInstance.rowClick.subscribe((e) => received.push(e));
    bodyRows()[1].click();
    expect(received).toEqual([{ row: ROWS[1], index: 1 }]);
  });

  // ---- Sort (internal) -----------------------------------------------------

  it('cycles sort asc → desc → null, reorders rows, and emits sortChange', () => {
    create();
    const emissions: (DmTableSortState | null)[] = [];
    fixture.componentInstance.sortChange.subscribe((s) => emissions.push(s));
    const sortBtn = () => dataThs()[1].querySelector('.dm-table__sort-btn') as HTMLButtonElement;

    sortBtn().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sortState()).toEqual({ column: 'name', direction: 'asc' });
    expect(nameCells()).toEqual(['Ada', 'Grace', 'Katherine']);

    sortBtn().click();
    fixture.detectChanges();
    expect(nameCells()).toEqual(['Katherine', 'Grace', 'Ada']);

    sortBtn().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sortState()).toBeNull();
    expect(nameCells()).toEqual(['Ada', 'Grace', 'Katherine']);

    expect(emissions).toEqual([
      { column: 'name', direction: 'asc' },
      { column: 'name', direction: 'desc' },
      null,
    ]);
  });

  it('exposes aria-sort on sortable columns and omits it on non-sortable ones', () => {
    create({ sortState: { column: 'id', direction: 'desc' } });
    expect(dataThs()[0].getAttribute('aria-sort')).toBe('descending');
    expect(dataThs()[1].getAttribute('aria-sort')).toBe('none');
    expect(dataThs()[2].hasAttribute('aria-sort')).toBe(false);
  });

  // ---- Search --------------------------------------------------------------

  it('filters rows by the search term across columns (case-insensitive)', () => {
    create({ searchable: true, searchTerm: 'admiral' });
    expect(bodyRows().length).toBe(1);
    expect(nameCells()).toEqual(['Grace']);

    fixture.componentRef.setInput('searchTerm', 'a');
    fixture.detectChanges();
    // 'a' matches Ada, Grace, Katherine, Engineer, Admiral, Mathematician → all 3
    expect(bodyRows().length).toBe(3);
  });

  it('typing in the search box updates searchTerm and emits searchChange', () => {
    create({ searchable: true });
    const emissions: string[] = [];
    fixture.componentInstance.searchChange.subscribe((v) => emissions.push(v));
    const input = el('.dm-table__search-input') as HTMLInputElement;
    input.value = 'grace';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.searchTerm()).toBe('grace');
    expect(emissions).toEqual(['grace']);
    expect(nameCells()).toEqual(['Grace']);
  });

  it('shows a no-results empty state when the search filters everything out', () => {
    create({ searchable: true, searchTerm: 'zzz', noResultsText: 'Nothing here' });
    expect(bodyRows().length).toBe(0);
    expect(el('.dm-table__empty-text')?.textContent?.trim()).toBe('Nothing here');
  });

  // ---- Selection -----------------------------------------------------------

  it('renders a checkbox column and toggles row selection, emitting the rows', () => {
    create({ selectionMode: 'multiple' });
    const emitted: Row[][] = [];
    fixture.componentInstance.selectionChange.subscribe((rows) => emitted.push(rows));

    expect(rowCheckboxes().length).toBe(3);
    rowCheckboxes()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedKeys()).toEqual([2]);
    expect(emitted.at(-1)).toEqual([ROWS[1]]);

    rowCheckboxes()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedKeys()).toEqual([]);
  });

  it('single selection keeps only one row selected', () => {
    create({ selectionMode: 'single' });
    rowCheckboxes()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedKeys()).toEqual([1]);
    rowCheckboxes()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedKeys()).toEqual([3]);
  });

  it('select-all toggles every filtered row and reflects indeterminate state', () => {
    create({ selectionMode: 'multiple' });

    // one selected → header is indeterminate
    rowCheckboxes()[0].click();
    fixture.detectChanges();
    expect(selectAllCheckbox().getAttribute('aria-checked')).toBe('mixed');

    // select-all → all keys selected
    selectAllCheckbox().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedKeys().sort()).toEqual([1, 2, 3]);
    expect(selectAllCheckbox().checked).toBe(true);

    // toggle again → cleared
    selectAllCheckbox().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedKeys()).toEqual([]);
  });

  it('marks selected rows with data-selected and aria-selected', () => {
    create({ selectionMode: 'multiple', selectedKeys: [2] });
    expect(bodyRows()[1].hasAttribute('data-selected')).toBe(true);
    expect(bodyRows()[1].getAttribute('aria-selected')).toBe('true');
    expect(bodyRows()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('does not emit rowClick when a selection checkbox is clicked', () => {
    create({ selectionMode: 'multiple' });
    const received: DmTableRowClickEvent<Row>[] = [];
    fixture.componentInstance.rowClick.subscribe((e) => received.push(e));
    rowCheckboxes()[0].click();
    fixture.detectChanges();
    expect(received).toEqual([]);
  });

  // ---- Pagination ----------------------------------------------------------

  it('paginates rows and navigates pages, updating the range summary', () => {
    create({ pageSize: 2 });
    expect(bodyRows().length).toBe(2);
    expect(nameCells()).toEqual(['Ada', 'Grace']);
    expect(el('.dm-table__footer-info').textContent).toContain('1–2 of 3');

    // Numbered pager: pages 1 and 2 render as buttons.
    (el('[aria-label="Page 2"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(2);
    expect(nameCells()).toEqual(['Katherine']);
    expect(el('.dm-table__footer-info').textContent).toContain('3–3 of 3');
    expect(el('[aria-label="Page 2"]').classList.contains('dm-table__page--active')).toBe(true);

    // Prev arrow goes back to page 1.
    (el('[aria-label="Previous page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(1);
  });

  it('changing page size resets to the first page and emits pageChange', () => {
    create({ pageSize: 2, page: 2 });
    const emissions: { page: number; pageSize: number }[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emissions.push(p));
    const select = el('.dm-table__page-size-select') as HTMLSelectElement;
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(1);
    expect(fixture.componentInstance.pageSize()).toBe(10);
    expect(emissions.at(-1)).toEqual({ page: 1, pageSize: 10 });
  });

  it('resets to page 1 when the search term changes', () => {
    create({ pageSize: 2, page: 2, searchable: true });
    expect(fixture.componentInstance.page()).toBe(2);
    fixture.componentRef.setInput('searchTerm', 'a');
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(1);
  });

  // ---- States --------------------------------------------------------------

  it('renders the empty state and colspan when there is no data', () => {
    create({ data: [], emptyText: 'Nothing yet' });
    expect(el('.dm-table__empty-text')?.textContent?.trim()).toBe('Nothing yet');
    const cell = el('.dm-table__empty-cell');
    expect(cell.getAttribute('colspan')).toBe(String(COLUMNS.length));
  });

  it('renders skeleton rows and aria-busy while loading', () => {
    create({ loading: true, loadingRows: 4 });
    expect(all('.dm-table__tr--skeleton').length).toBe(4);
    expect(tableEl().getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('.dm-table__empty')).toBeNull();
  });

  // ---- Appearance / defaults ----------------------------------------------

  it('reflects density, variant, hover and sticky on the DOM', () => {
    create({ density: 'compact', variant: 'striped', hover: false, sticky: true });
    expect(wrapper().getAttribute('data-density')).toBe('compact');
    expect(wrapper().getAttribute('data-variant')).toBe('striped');
    expect(wrapper().hasAttribute('data-hover')).toBe(false);
    expect(el('.dm-table__scroll').classList.contains('dm-table__scroll--sticky')).toBe(true);
  });

  it('honors defaults injected via TABLE_DEFAULTS', () => {
    TestBed.overrideProvider(TABLE_DEFAULTS, {
      useValue: {
        density: 'spacious',
        variant: 'bordered',
        hover: false,
        sticky: false,
        pageSize: 0,
        pageSizeOptions: [10, 25, 50],
      },
    });
    create();
    expect(wrapper().getAttribute('data-density')).toBe('spacious');
    expect(wrapper().getAttribute('data-variant')).toBe('bordered');
    expect(wrapper().hasAttribute('data-hover')).toBe(false);
  });
});
