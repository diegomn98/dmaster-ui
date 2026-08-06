import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmSelectComponent } from './select.component';
import { DmSelectItem } from './select.types';

const ITEMS: DmSelectItem<string>[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog', description: "Man's best friend" },
  { value: 'fish', label: 'Fish', disabled: true },
  { value: 'hamster', label: 'Hamster' },
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
    expect(trigger(fixture).hasAttribute('disabled')).toBe(true);
  });

  it('marks the field as invalid when `error` is set', () => {
    const fixture = createDirect();
    fixture.componentRef.setInput('error', 'Pick something');
    fixture.detectChanges();

    expect(trigger(fixture).getAttribute('aria-invalid')).toBe('true');
    const err = fixture.nativeElement.querySelector('.dm-select__error');
    expect(err?.textContent).toContain('Pick something');
  });
});
