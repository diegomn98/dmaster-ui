import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';

import { DmSelectComponent } from './select.component';
import { DmSelectItem, DmSelectLoadResult, DmSelectOptionOrGroup } from './select.types';

const ITEMS: DmSelectItem<string>[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog', description: "Man's best friend" },
  { value: 'fish', label: 'Fish', disabled: true },
  { value: 'hamster', label: 'Hamster' },
];

const GROUPED: DmSelectOptionOrGroup<string>[] = [
  {
    label: 'Mammals',
    items: [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog' },
    ],
  },
  {
    label: 'Aquatic',
    items: [{ value: 'fish', label: 'Fish' }],
  },
];

@Component({
  imports: [DmSelectComponent, ReactiveFormsModule],
  template: `
    <dm-select label="Pet" placeholder="Choose one" [items]="items" [formControl]="control" />
  `,
})
class FormHostComponent {
  readonly items = ITEMS;
  readonly control = new FormControl<string | null>(null);
}

describe('DmSelectComponent', () => {
  let overlayContainer: OverlayContainer;

  function createDirect(): ComponentFixture<DmSelectComponent<string>> {
    const fixture = TestBed.createComponent(DmSelectComponent<string>);
    fixture.componentRef.setInput('items', ITEMS);
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

  function panelQuery<E extends Element>(selector: string): E | null {
    return overlayContainer.getContainerElement().querySelector<E>(selector);
  }

  function panelQueryAll(selector: string): HTMLElement[] {
    return Array.from(overlayContainer.getContainerElement().querySelectorAll(selector));
  }

  function typeFilter(text: string): void {
    const input = panelQuery<HTMLInputElement>('.dm-select__filter-input')!;
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    tick();
  }

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
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
    const fixture = createDirect();
    fixture.componentRef.setInput('placeholder', 'Choose one');
    fixture.detectChanges();

    const btn = trigger(fixture);
    expect(btn.getAttribute('role')).toBe('combobox');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-haspopup')).toBe('listbox');
    expect(btn.textContent).toContain('Choose one');
  });

  it('matches object values via compareWith (survives a new reference)', () => {
    interface Pet {
      id: string;
      name: string;
    }
    const petItems: DmSelectItem<Pet>[] = [
      { value: { id: 'cat', name: 'Cat' }, label: 'Cat' },
      { value: { id: 'dog', name: 'Dog' }, label: 'Dog' },
    ];
    const fixture = TestBed.createComponent(DmSelectComponent<Pet>);
    fixture.componentRef.setInput('items', petItems);
    fixture.componentRef.setInput('compareWith', (a: Pet, b: Pet) => a.id === b.id);
    // Brand-new object reference with the same identity as an option.
    fixture.componentRef.setInput('value', { id: 'dog', name: 'Dog' });
    fixture.detectChanges();

    // Trigger shows the matched option's label → selection matched by id, not
    // by reference (which would show the placeholder).
    expect(trigger(fixture).textContent).toContain('Dog');
  });

  it('emits openChange(true) on open and (false) on close', () => {
    const fixture = createDirect();
    const events: boolean[] = [];
    fixture.componentInstance.openChange.subscribe((v) => events.push(v));

    trigger(fixture).click();
    tick();
    expect(events).toEqual([true]);

    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    tick();
    expect(events).toEqual([true, false]);
  });

  it('opens the listbox on click and closes on Escape', () => {
    const fixture = createDirect();
    trigger(fixture).click();
    tick();

    expect(panelOptions().length).toBe(ITEMS.length);
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');

    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    tick();

    expect(panelOptions().length).toBe(0);
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('selects an item on click, closes the panel and updates the trigger label', () => {
    const fixture = createDirect();
    trigger(fixture).click();
    tick();

    panelOptions()[1].click();
    tick();

    expect(fixture.componentInstance.value()).toBe('dog');
    expect(trigger(fixture).textContent).toContain('Dog');
    expect(panelOptions().length).toBe(0);
  });

  it('skips disabled items with ArrowDown', () => {
    const fixture = createDirect();
    // Open at first item (Cat), then move down: fish is disabled → land on Hamster.
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    tick();
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    tick();

    const active = panelOptions().find((el) => el.hasAttribute('data-active'));
    expect(active?.textContent).toContain('Hamster');
  });

  it('does not select a disabled item on click', () => {
    const fixture = createDirect();
    trigger(fixture).click();
    tick();

    panelOptions()[2].click(); // Fish (disabled)
    tick();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(panelOptions().length).toBe(ITEMS.length); // still open
  });

  it('integrates with Reactive Forms (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    host.control.setValue('cat');
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Cat');

    trigger(fixture).click();
    tick();
    panelOptions()[1].click(); // Dog
    tick();
    expect(host.control.value).toBe('dog');

    host.control.disable();
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-disabled')).toBe('true');
  });

  it('marks the field as invalid when `error` is set', () => {
    const fixture = createDirect();
    fixture.componentRef.setInput('error', 'Pick something');
    fixture.detectChanges();

    expect(trigger(fixture).getAttribute('aria-invalid')).toBe('true');
    const err = fixture.nativeElement.querySelector('.dm-select__error');
    expect(err?.textContent).toContain('Pick something');
  });

  describe('multiple mode', () => {
    function createMultiple(values: string[] = []): ComponentFixture<DmSelectComponent<string>> {
      const fixture = TestBed.createComponent(DmSelectComponent<string>);
      fixture.componentRef.setInput('items', ITEMS);
      fixture.componentRef.setInput('multiple', true);
      fixture.componentRef.setInput('values', values);
      fixture.detectChanges();
      return fixture;
    }

    it('renders a chip per selected value', () => {
      const fixture = createMultiple(['dog']);
      const chips = fixture.nativeElement.querySelectorAll('.dm-select__chip');
      expect(chips.length).toBe(1);
      expect(chips[0].textContent).toContain('Dog');
    });

    it('adds an unselected option to values and keeps the panel open', () => {
      const fixture = createMultiple(['dog']);
      trigger(fixture).click();
      tick();

      panelOptions()[0].click(); // Cat (unselected)
      tick();

      expect(fixture.componentInstance.values()).toEqual(['dog', 'cat']);
      expect(panelOptions().length).toBe(ITEMS.length); // still open
    });

    it('removes a selected option when clicked again', () => {
      const fixture = createMultiple(['dog']);
      trigger(fixture).click();
      tick();

      panelOptions()[1].click(); // Dog (selected)
      tick();

      expect(fixture.componentInstance.values()).toEqual([]);
      expect(panelOptions().length).toBe(ITEMS.length); // still open
    });

    it('removes a value via the chip remove button', () => {
      const fixture = createMultiple(['dog']);
      const removeBtn = fixture.nativeElement.querySelector(
        '.dm-select__chip-remove',
      ) as HTMLButtonElement;
      removeBtn.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.values()).toEqual([]);
      expect(fixture.nativeElement.querySelectorAll('.dm-select__chip').length).toBe(0);
    });
  });

  describe('filterable', () => {
    function createFilterable(): ComponentFixture<DmSelectComponent<string>> {
      const fixture = TestBed.createComponent(DmSelectComponent<string>);
      fixture.componentRef.setInput('items', ITEMS);
      fixture.componentRef.setInput('filterable', true);
      fixture.componentRef.setInput('noResultsLabel', 'No matches');
      fixture.detectChanges();
      return fixture;
    }

    it('narrows the options to the matches as the user types', () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();

      expect(panelOptions().length).toBe(ITEMS.length);

      typeFilter('ha');
      expect(panelOptions().length).toBe(1);
      expect(panelOptions()[0].textContent).toContain('Hamster');
    });

    it('shows the no-results label when nothing matches', () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();

      typeFilter('zzz');
      expect(panelOptions().length).toBe(0);
      expect(panelQuery('.dm-select__empty')?.textContent).toContain('No matches');
    });

    it('focuses the filter input when the overlay attaches', async () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();
      // onOverlayAttach() difiere el focus a un microtask.
      await Promise.resolve();

      const input = panelQuery<HTMLInputElement>('.dm-select__filter-input')!;
      expect(document.activeElement).toBe(input);
    });

    it('does NOT prevent mousedown on the filter input (click-to-focus works)', () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();

      const input = panelQuery<HTMLInputElement>('.dm-select__filter-input')!;
      const inputMousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      input.dispatchEvent(inputMousedown);
      expect(inputMousedown.defaultPrevented).toBe(false);

      // El listbox SÍ lo previene (mantiene el foco donde está al clicar opciones).
      const listbox = panelQuery<HTMLElement>('.dm-select__listbox')!;
      const listMousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      listbox.dispatchEvent(listMousedown);
      expect(listMousedown.defaultPrevented).toBe(true);
    });

    it('routes a printable key pressed on the trigger into the filter input', async () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();
      await Promise.resolve();

      const input = panelQuery<HTMLInputElement>('.dm-select__filter-input')!;
      input.blur();
      expect(document.activeElement).not.toBe(input);

      trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));
      expect(document.activeElement).toBe(input);
    });

    it('opens without a CDK backdrop (outside clicks pass through)', () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();

      expect(panelQuery('.dm-select__panel')).not.toBeNull();
      expect(panelQuery('.cdk-overlay-backdrop')).toBeNull();
    });

    it('shows a clear (×) button once there is text; clicking it restores the full list', () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();

      expect(panelQuery('.dm-select__filter-clear')).toBeNull();

      typeFilter('ha');
      expect(panelOptions().length).toBe(1);
      const clear = panelQuery<HTMLButtonElement>('.dm-select__filter-clear');
      expect(clear).not.toBeNull();

      clear!.click();
      tick();
      expect(panelOptions().length).toBe(ITEMS.length);
      expect(panelQuery<HTMLInputElement>('.dm-select__filter-input')!.value).toBe('');
      expect(panelQuery('.dm-select__filter-clear')).toBeNull();
    });

    it('Escape clears a non-empty filter first; a second Escape closes the panel', () => {
      const fixture = createFilterable();
      trigger(fixture).click();
      tick();

      typeFilter('ha');
      const input = panelQuery<HTMLInputElement>('.dm-select__filter-input')!;

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      tick();
      // First Escape: filter cleared, panel still open.
      expect(panelQuery('.dm-select__panel')).not.toBeNull();
      expect(panelOptions().length).toBe(ITEMS.length);

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      tick();
      // Second Escape: panel closed.
      expect(panelQuery('.dm-select__panel')).toBeNull();
    });
  });

  describe('grouping', () => {
    function createGrouped(): ComponentFixture<DmSelectComponent<string>> {
      const fixture = TestBed.createComponent(DmSelectComponent<string>);
      fixture.componentRef.setInput('items', GROUPED);
      fixture.detectChanges();
      return fixture;
    }

    it('renders group headers and keeps options selectable', () => {
      const fixture = createGrouped();
      trigger(fixture).click();
      tick();

      const groups = panelQueryAll('.dm-select__group');
      expect(groups.map((g) => g.textContent?.trim())).toEqual(['Mammals', 'Aquatic']);
      expect(panelOptions().length).toBe(3);

      panelOptions()[1].click(); // Dog
      tick();

      expect(fixture.componentInstance.value()).toBe('dog');
    });
  });

  describe('select-all / clear-all', () => {
    function createBulk(): ComponentFixture<DmSelectComponent<string>> {
      const fixture = TestBed.createComponent(DmSelectComponent<string>);
      fixture.componentRef.setInput('items', ITEMS);
      fixture.componentRef.setInput('multiple', true);
      fixture.componentRef.setInput('selectAllLabel', 'Select all');
      fixture.componentRef.setInput('clearAllLabel', 'Clear');
      fixture.detectChanges();
      return fixture;
    }

    it('exposes the bulk action buttons in multiple mode', () => {
      const fixture = createBulk();
      trigger(fixture).click();
      tick();

      const actions = panelQueryAll('.dm-select__action');
      expect(actions.map((a) => a.textContent?.trim())).toEqual(['Select all', 'Clear']);
    });

    it('select-all fills values with every enabled option; clear-all empties them', () => {
      const fixture = createBulk();
      trigger(fixture).click();
      tick();

      const [selectAll, clearAll] = panelQueryAll('.dm-select__action');
      selectAll.click();
      tick();
      // Fish is disabled → excluded.
      expect(fixture.componentInstance.values()).toEqual(['cat', 'dog', 'hamster']);

      clearAll.click();
      tick();
      expect(fixture.componentInstance.values()).toEqual([]);
    });
  });

  describe('async (loadFn) mode — absorbs the former dm-paginated-select', () => {
    const PAGE_1: DmSelectLoadResult<string> = {
      items: [
        { value: 'u1', label: 'Ada Lovelace' },
        { value: 'u2', label: 'Alan Turing' },
        { value: 'u3', label: 'Grace Hopper' },
      ],
      total: 5,
    };
    const PAGE_2: DmSelectLoadResult<string> = {
      items: [
        { value: 'u4', label: 'Linus Torvalds' },
        { value: 'u5', label: 'Barbara Liskov' },
      ],
      total: 5,
    };

    function createAsync(loadFn = vi.fn().mockReturnValue(of(PAGE_1))) {
      const fixture = TestBed.createComponent(DmSelectComponent<string>);
      fixture.componentRef.setInput('loadFn', loadFn);
      fixture.detectChanges();
      return { fixture, loadFn };
    }

    /** Flush microtasks so rxResource can schedule state updates, then re-render. */
    async function flushLoad(): Promise<void> {
      await Promise.resolve();
      await Promise.resolve();
      tick();
    }

    it('calls loadFn on first open and renders items after resolve', async () => {
      const { fixture, loadFn } = createAsync();

      expect(loadFn).not.toHaveBeenCalled();
      trigger(fixture).click();
      tick();
      await flushLoad();

      expect(loadFn).toHaveBeenCalledTimes(1);
      expect(loadFn.mock.calls[0][0]).toMatchObject({ page: 0, query: '' });
      expect(panelOptions().length).toBe(PAGE_1.items.length);
      expect(panelOptions()[0].textContent).toContain('Ada Lovelace');
    });

    it('shows the loading row while the request is pending', () => {
      const pending = new Subject<DmSelectLoadResult<string>>();
      const { fixture } = createAsync(vi.fn().mockReturnValue(pending.asObservable()));

      trigger(fixture).click();
      tick();

      expect(panelQuery('.dm-select__loading')).not.toBeNull();
      expect(panelQuery('.dm-select__listbox')?.getAttribute('aria-busy')).toBe('true');
    });

    it('shows the no-results label when the server returns 0 items', async () => {
      const { fixture } = createAsync(
        vi.fn().mockReturnValue(of({ items: [], total: 0 } satisfies DmSelectLoadResult<string>)),
      );
      fixture.componentRef.setInput('noResultsLabel', 'Nobody found');
      fixture.detectChanges();

      trigger(fixture).click();
      tick();
      await flushLoad();

      expect(panelOptions().length).toBe(0);
      expect(panelQuery('.dm-select__empty')?.textContent).toContain('Nobody found');
    });

    it('loads the next page via the Load more button and appends it', async () => {
      const loadFn = vi.fn().mockReturnValueOnce(of(PAGE_1)).mockReturnValueOnce(of(PAGE_2));
      const { fixture } = createAsync(loadFn);
      fixture.componentRef.setInput('loadMoreMode', 'button');
      fixture.detectChanges();

      trigger(fixture).click();
      tick();
      await flushLoad();

      const loadMore = panelQuery<HTMLButtonElement>('.dm-select__load-more')!;
      expect(loadMore).not.toBeNull();
      loadMore.click();
      tick();
      await flushLoad();

      expect(loadFn).toHaveBeenCalledTimes(2);
      expect(loadFn.mock.calls[1][0]).toMatchObject({ page: 1 });
      expect(panelOptions().length).toBe(5);
      // All pages loaded (5 of 5) → the button disappears.
      expect(panelQuery('.dm-select__load-more')).toBeNull();
    });

    it('debounces the filter text into a page-0 server query', async () => {
      vi.useFakeTimers();
      try {
        const loadFn = vi.fn().mockReturnValue(of(PAGE_1));
        const { fixture } = createAsync(loadFn);
        fixture.componentRef.setInput('filterable', true);
        fixture.componentRef.setInput('searchDebounceMs', 200);
        fixture.detectChanges();

        trigger(fixture).click();
        tick();
        await flushLoad();

        typeFilter('ada');
        vi.advanceTimersByTime(100);
        expect(loadFn).toHaveBeenCalledTimes(1); // still only the initial load

        vi.advanceTimersByTime(150);
        await flushLoad();
        expect(loadFn).toHaveBeenCalledTimes(2);
        expect(loadFn.mock.calls[1][0]).toMatchObject({ page: 0, query: 'ada' });
      } finally {
        vi.useRealTimers();
      }
    });

    it('the filter clear (×) reloads page 0 with an empty query immediately', async () => {
      vi.useFakeTimers();
      try {
        const loadFn = vi.fn().mockReturnValue(of(PAGE_1));
        const { fixture } = createAsync(loadFn);
        fixture.componentRef.setInput('filterable', true);
        fixture.detectChanges();

        trigger(fixture).click();
        tick();
        await flushLoad();

        typeFilter('ada');
        vi.advanceTimersByTime(300);
        await flushLoad();
        expect(loadFn).toHaveBeenCalledTimes(2);

        panelQuery<HTMLButtonElement>('.dm-select__filter-clear')!.click();
        // No debounce on clear — the reload is immediate.
        await flushLoad();
        expect(loadFn).toHaveBeenCalledTimes(3);
        expect(loadFn.mock.calls[2][0]).toMatchObject({ page: 0, query: '' });
      } finally {
        vi.useRealTimers();
      }
    });

    it('resolves the trigger label from selectedItems when the value is not loaded', () => {
      const { fixture } = createAsync();
      fixture.componentRef.setInput('value', 'u99');
      fixture.componentRef.setInput('selectedItems', [
        { value: 'u99', label: 'From another page' },
      ]);
      fixture.detectChanges();

      expect(trigger(fixture).textContent).toContain('From another page');
    });

    it('selects a loaded option, closes the panel and updates the trigger', async () => {
      const { fixture } = createAsync();
      trigger(fixture).click();
      tick();
      await flushLoad();

      panelOptions()[1].click();
      tick();

      expect(fixture.componentInstance.value()).toBe('u2');
      expect(panelOptions().length).toBe(0);
      expect(trigger(fixture).textContent).toContain('Alan Turing');
    });

    it('keeps the selected label after a page-0 replace drops it (seen-items cache)', async () => {
      const loadFn = vi
        .fn()
        .mockReturnValueOnce(of(PAGE_1)) // page 0, query ''
        .mockReturnValueOnce(of({ items: [{ value: 'u9', label: 'Someone Else' }], total: 1 }));
      const { fixture } = createAsync(loadFn);
      fixture.componentRef.setInput('filterable', true);
      fixture.detectChanges();

      trigger(fixture).click();
      tick();
      await flushLoad();
      panelOptions()[0].click(); // pick "Ada Lovelace" (u1)
      tick();
      expect(fixture.componentInstance.value()).toBe('u1');
      expect(trigger(fixture).textContent).toContain('Ada Lovelace');

      // New search replaces the loaded page with a set that does NOT contain u1.
      trigger(fixture).click();
      tick();
      typeFilter('else');
      await new Promise((r) => setTimeout(r, 300));
      await flushLoad();

      // The trigger still shows the selected label (resolved from the cache).
      expect(fixture.componentInstance.value()).toBe('u1');
      expect(trigger(fixture).textContent).toContain('Ada Lovelace');
    });

    it('does NOT storm requests when an infinite-mode page fails (sentinel suppressed)', async () => {
      const loadFn = vi
        .fn()
        .mockReturnValueOnce(of(PAGE_1)) // page 0 ok (3 of 5)
        .mockReturnValueOnce(throwError(() => new Error('boom'))); // page 1 fails
      const { fixture } = createAsync(loadFn); // default loadMoreMode 'infinite'
      trigger(fixture).click();
      tick();
      await flushLoad();

      // Force the next page (simulates the IntersectionObserver firing once).
      fixture.componentInstance['loadNextPage']();
      tick();
      await flushLoad();

      expect(loadFn).toHaveBeenCalledTimes(2);
      expect(loadFn.mock.calls[1][0]).toMatchObject({ page: 1 });
      // Error state: the sentinel is gone, so no auto-retry loop can re-fire.
      expect(fixture.componentInstance['showInfiniteSentinel']()).toBe(false);
      expect(fixture.componentInstance['_loadError']()).toBe(true);
      // The empty row must NOT claim "no results" on an error.
      expect(panelQuery('.dm-select__empty')).toBeNull();
    });

    it('retries the FAILED page (not the next one) after an error', async () => {
      const loadFn = vi
        .fn()
        .mockReturnValueOnce(of(PAGE_1)) // page 0 ok
        .mockReturnValueOnce(throwError(() => new Error('boom'))) // page 1 fails
        .mockReturnValueOnce(of(PAGE_2)); // page 1 retry ok
      const { fixture } = createAsync(loadFn);
      fixture.componentRef.setInput('loadMoreMode', 'button');
      fixture.detectChanges();

      trigger(fixture).click();
      tick();
      await flushLoad();
      panelQuery<HTMLButtonElement>('.dm-select__load-more')!.click(); // page 1 → fails
      tick();
      await flushLoad();
      expect(fixture.componentInstance['_loadError']()).toBe(true);

      // Button still shown on error; clicking retries page 1, not page 2.
      panelQuery<HTMLButtonElement>('.dm-select__load-more')!.click();
      tick();
      await flushLoad();

      expect(loadFn).toHaveBeenCalledTimes(3);
      expect(loadFn.mock.calls[2][0]).toMatchObject({ page: 1 });
      expect(panelOptions().length).toBe(5); // page 0 (3) + page 1 retry (2)
    });
  });

  describe('duplicate group labels', () => {
    it('renders two headers for the same non-adjacent label without NG0955', () => {
      const items: DmSelectOptionOrGroup<string>[] = [
        { label: 'Other', items: [{ value: 'a', label: 'A' }] },
        { value: 'b', label: 'B' }, // ungrouped, resets the run
        { label: 'Other', items: [{ value: 'c', label: 'C' }] },
      ];
      const fixture = TestBed.createComponent(DmSelectComponent<string>);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      trigger(fixture).click();
      tick();

      const groups = panelQueryAll('.dm-select__group');
      expect(groups.length).toBe(2); // both "Other" headers render
      expect(groups.every((g) => g.textContent?.trim() === 'Other')).toBe(true);
      expect(panelOptions().length).toBe(3);
    });
  });
});
