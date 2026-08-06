import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';

import { DmPaginatedSelectComponent } from './paginated-select.component';
import { DmPaginatedSelectItem, DmPaginatedSelectResult } from './paginated-select.types';

const PAGE_1: DmPaginatedSelectItem<string>[] = [
  { value: 'u1', label: 'Ada Lovelace' },
  { value: 'u2', label: 'Alan Turing' },
  { value: 'u3', label: 'Grace Hopper', disabled: true },
  { value: 'u4', label: 'Linus Torvalds' },
];

const RESULT_PAGE_1: DmPaginatedSelectResult<string> = { items: PAGE_1, total: PAGE_1.length };

describe('DmPaginatedSelectComponent', () => {
  let overlayContainer: OverlayContainer;

  function create(
    loadFn = vi.fn().mockReturnValue(of(RESULT_PAGE_1)),
  ): ComponentFixture<DmPaginatedSelectComponent<string>> {
    const fixture = TestBed.createComponent(DmPaginatedSelectComponent<string>);
    fixture.componentRef.setInput('loadFn', loadFn);
    fixture.detectChanges();
    return fixture;
  }

  function trigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-select__trigger');
  }

  function panelOptions(): HTMLElement[] {
    return Array.from(
      overlayContainer.getContainerElement().querySelectorAll('.dm-select__option'),
    );
  }

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  /** Flush microtasks so rxResource can schedule state updates, then re-render. */
  async function flushLoad(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    tick();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('renders a combobox trigger with placeholder when nothing is selected', () => {
    const fixture = create();
    fixture.componentRef.setInput('placeholder', 'Pick a user');
    fixture.detectChanges();

    const btn = trigger(fixture);
    expect(btn.getAttribute('role')).toBe('combobox');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.textContent).toContain('Pick a user');
  });

  it('calls loadFn on first open and renders items after resolve', async () => {
    const loadFn = vi.fn().mockReturnValue(of(RESULT_PAGE_1));
    const fixture = create(loadFn);

    trigger(fixture).click();
    tick();

    expect(loadFn).toHaveBeenCalledOnce();
    expect(loadFn).toHaveBeenCalledWith({ page: 0, pageSize: 20, query: '' });

    await flushLoad();

    expect(panelOptions().length).toBe(PAGE_1.length);
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape after items are loaded', async () => {
    const fixture = create();
    trigger(fixture).click();
    tick();
    await flushLoad();

    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    tick();

    expect(panelOptions().length).toBe(0);
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('selects an item on click, closes the panel and updates the trigger label', async () => {
    const fixture = create();
    trigger(fixture).click();
    tick();
    await flushLoad();

    panelOptions()[1].click(); // Alan Turing
    tick();

    expect(fixture.componentInstance.value()).toBe('u2');
    expect(trigger(fixture).textContent).toContain('Alan Turing');
    expect(panelOptions().length).toBe(0);
  });

  it('skips disabled items with ArrowDown', async () => {
    const fixture = create();
    trigger(fixture).click();
    tick();
    await flushLoad();

    // First item active (Ada); ArrowDown twice should skip Grace (disabled) and land on Linus.
    trigger(fixture).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    trigger(fixture).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    tick();

    const active = panelOptions().find((el) => el.hasAttribute('data-active'));
    expect(active?.textContent).toContain('Linus Torvalds');
  });

  it('shows the empty label when loadFn returns 0 results', async () => {
    const fixture = create(vi.fn().mockReturnValue(of({ items: [], total: 0 })));
    fixture.componentRef.setInput('emptyLabel', 'No matches');
    fixture.detectChanges();

    trigger(fixture).click();
    tick();
    await flushLoad();

    const empty = overlayContainer
      .getContainerElement()
      .querySelector('.dm-paginated-select__empty');
    expect(empty?.textContent).toContain('No matches');
  });

  it('shows a loading spinner while loadFn is pending', () => {
    const fixture = create(vi.fn().mockReturnValue(NEVER));

    trigger(fixture).click();
    tick(); // _loading = true, panel opens

    const loading = overlayContainer
      .getContainerElement()
      .querySelector('.dm-paginated-select__loading');
    expect(loading).toBeTruthy();
  });

  it('shows Load more button in button mode when there are more pages', async () => {
    // total > items returned → hasMore = true
    const loadFn = vi.fn().mockReturnValue(of({ items: PAGE_1, total: 10 }));
    const fixture = create(loadFn);
    fixture.componentRef.setInput('loadMoreMode', 'button');
    fixture.detectChanges();

    trigger(fixture).click();
    tick();
    await flushLoad();

    const btn = overlayContainer
      .getContainerElement()
      .querySelector('.dm-paginated-select__load-more');
    expect(btn).toBeTruthy();
  });

  it('calls loadFn again when the Load more button is clicked', async () => {
    const loadFn = vi
      .fn()
      .mockReturnValueOnce(of({ items: PAGE_1, total: 10 }))
      .mockReturnValue(of({ items: [], total: 10 }));

    const fixture = create(loadFn);
    fixture.componentRef.setInput('loadMoreMode', 'button');
    fixture.detectChanges();

    trigger(fixture).click();
    tick();
    await flushLoad();

    const btn = overlayContainer
      .getContainerElement()
      .querySelector<HTMLButtonElement>('.dm-paginated-select__load-more');
    btn?.click();
    tick();

    expect(loadFn).toHaveBeenCalledTimes(2);
    expect(loadFn.mock.calls[1][0]).toMatchObject({ page: 1 });
  });

  it('debounces the search and calls loadFn with the new query', async () => {
    vi.useFakeTimers();
    try {
      const loadFn = vi.fn().mockReturnValue(of(RESULT_PAGE_1));
      const fixture = create(loadFn);
      fixture.componentRef.setInput('searchable', true);
      fixture.componentRef.setInput('searchDebounceMs', 200);
      fixture.detectChanges();

      trigger(fixture).click();
      tick();
      // Flush the initial page load so _loading is false before we simulate search.
      await flushLoad();

      const input = overlayContainer
        .getContainerElement()
        .querySelector<HTMLInputElement>('.dm-paginated-select__search-input');
      input!.value = 'ada';
      input!.dispatchEvent(new Event('input'));

      vi.advanceTimersByTime(100);
      expect(loadFn).toHaveBeenCalledTimes(1); // only initial load

      vi.advanceTimersByTime(150);
      // The debounce fired and set _pageRequest; rxResource's internal effect
      // runs on the next microtask cycle — flush it before asserting.
      await flushLoad();
      expect(loadFn).toHaveBeenCalledTimes(2);
      expect(loadFn.mock.calls[1][0]).toMatchObject({ page: 0, query: 'ada' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders the label from `selectedItem` when the value is not in loaded items', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 'u99');
    fixture.componentRef.setInput('selectedItem', { value: 'u99', label: 'From another page' });
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('From another page');
  });
});
