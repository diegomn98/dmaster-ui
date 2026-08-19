import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmSelectComponent } from './select.component';
import { DmSelectItem, DmSelectOptionOrGroup } from './select.types';

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
});
