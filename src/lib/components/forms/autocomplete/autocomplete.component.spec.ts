import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmAutocompleteOptionDirective } from './autocomplete-option.directive';
import { DmAutocompleteComponent } from './autocomplete.component';
import { DmAutocompleteOption } from './autocomplete.types';

const OPTIONS: DmAutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot', description: 'Stone fruit' },
  { value: 'avocado', label: 'Avocado', disabled: true },
  { value: 'banana', label: 'Banana' },
];

@Component({
  imports: [DmAutocompleteComponent, DmAutocompleteOptionDirective],
  template: `
    <dm-autocomplete [options]="options" [(value)]="value" (optionSelected)="selected.push($event)">
      <ng-template dmAutocompleteOption let-option let-index="index" let-active="active">
        <span class="custom-option" [attr.data-index]="index" [attr.data-option-active]="active">
          {{ option.label.toUpperCase() }}
        </span>
      </ng-template>
    </dm-autocomplete>
  `,
})
class OptionTemplateHostComponent {
  readonly options = OPTIONS;
  readonly value = signal('');
  readonly selected: DmAutocompleteOption[] = [];
}

describe('DmAutocompleteComponent', () => {
  let overlayContainer: OverlayContainer;

  function create(): ComponentFixture<DmAutocompleteComponent> {
    const fixture = TestBed.createComponent(DmAutocompleteComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  function input(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('.dm-autocomplete__input');
  }

  function type(fixture: ComponentFixture<unknown>, text: string): void {
    const el = input(fixture);
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    tick();
  }

  function options(): HTMLElement[] {
    return Array.from(
      overlayContainer.getContainerElement().querySelectorAll('.dm-autocomplete__option'),
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

  it('renders a combobox input with autocomplete semantics', () => {
    const fixture = create();
    fixture.componentRef.setInput('placeholder', 'Search fruit');
    fixture.detectChanges();

    const el = input(fixture);
    expect(el.getAttribute('role')).toBe('combobox');
    expect(el.getAttribute('aria-autocomplete')).toBe('list');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(el.getAttribute('aria-haspopup')).toBe('listbox');
    expect(el.getAttribute('placeholder')).toBe('Search fruit');
  });

  it('filters options as the user types', () => {
    const fixture = create();

    type(fixture, 'ap');
    // Apple + Apricot match "ap"; Avocado / Banana do not.
    expect(options().length).toBe(2);
    expect(input(fixture).getAttribute('aria-expanded')).toBe('true');

    type(fixture, 'apr');
    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('Apricot');
  });

  it('shows options verbatim when [filter]="false" (server-driven mode)', () => {
    const fixture = create();
    fixture.componentRef.setInput('filter', false);
    fixture.detectChanges();

    // "zzz" matches no label, but server-driven options are shown as-is.
    type(fixture, 'zzz');
    expect(options().length).toBe(OPTIONS.length);
  });

  it('uses a custom filterFn (e.g. matching on description)', () => {
    const fixture = create();
    fixture.componentRef.setInput('filterFn', (o: DmAutocompleteOption, q: string) =>
      (o.description ?? '').toLowerCase().includes(q.toLowerCase()),
    );
    fixture.detectChanges();

    // "stone" only matches Apricot's description, not any label.
    type(fixture, 'stone');
    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('Apricot');
  });

  it('selects an option with ArrowDown + Enter, sets value and emits optionSelected', () => {
    const fixture = create();
    const selected: DmAutocompleteOption[] = [];
    fixture.componentInstance.optionSelected.subscribe((o) => selected.push(o));

    // On typing, active resets to the first enabled option (Apple). One
    // ArrowDown moves to Apricot; Enter commits it.
    type(fixture, 'ap');
    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    tick();
    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    tick();

    expect(fixture.componentInstance.value()).toBe('Apricot');
    expect(selected.length).toBe(1);
    expect(selected[0].value).toBe('apricot');
    expect(options().length).toBe(0); // closed after selection
  });

  it('emits openChange when the suggestions open and close', () => {
    const fixture = create();
    const events: boolean[] = [];
    fixture.componentInstance.openChange.subscribe((v) => events.push(v));

    type(fixture, 'ap'); // matches → opens
    expect(events).toEqual([true]);

    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    tick();
    expect(events).toEqual([true, false]);
  });

  it('closes on Escape but keeps the typed text', () => {
    const fixture = create();
    type(fixture, 'ban');
    expect(options().length).toBe(1);

    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    tick();

    expect(options().length).toBe(0);
    expect(fixture.componentInstance.value()).toBe('ban'); // free text kept
  });

  it('keeps arbitrary free text that matches no option', () => {
    const fixture = create();
    type(fixture, 'zzz');

    expect(fixture.componentInstance.value()).toBe('zzz');
    // No matches and no noResultsLabel → panel stays closed.
    expect(options().length).toBe(0);
  });

  it('shows the no-results row when configured', () => {
    const fixture = create();
    fixture.componentRef.setInput('noResultsLabel', 'Nothing found');
    fixture.detectChanges();

    type(fixture, 'zzz');
    const empty = overlayContainer.getContainerElement().querySelector('.dm-autocomplete__empty');
    expect(empty?.textContent).toContain('Nothing found');
  });

  it('does not select a disabled option on click', () => {
    const fixture = create();
    type(fixture, 'av'); // matches Avocado (disabled)

    options()[0].click();
    tick();

    expect(fixture.componentInstance.value()).toBe('av'); // unchanged
    expect(options().length).toBe(1); // still open
  });

  it('skips disabled options with ArrowDown', () => {
    const fixture = create();
    type(fixture, 'a'); // Apple, Apricot, Avocado(disabled)
    // Active starts on Apple (index 0). Down → Apricot. Down → skip Avocado, wrap to Apple.
    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    tick();
    const active = options().find((el) => el.hasAttribute('data-active'));
    expect(active?.textContent).toContain('Apricot');
  });

  it('clears the value with the clear button', () => {
    const fixture = create();
    type(fixture, 'apple');
    const clear = fixture.nativeElement.querySelector('.dm-autocomplete__clear') as HTMLElement;
    expect(clear).toBeTruthy();

    clear.click();
    tick();

    expect(fixture.componentInstance.value()).toBe('');
  });

  it('marks the field invalid when `error` is set', () => {
    const fixture = create();
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();

    expect(input(fixture).getAttribute('aria-invalid')).toBe('true');
    const err = fixture.nativeElement.querySelector('.dm-autocomplete__error');
    expect(err?.textContent).toContain('Required');
  });

  describe('custom option template (dmAutocompleteOption)', () => {
    function createHost(): ComponentFixture<OptionTemplateHostComponent> {
      const fixture = TestBed.createComponent(OptionTemplateHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    function customOptions(): HTMLElement[] {
      return Array.from(
        overlayContainer.getContainerElement().querySelectorAll<HTMLElement>('.custom-option'),
      );
    }

    it('renders the projected template with option + index context', () => {
      const fixture = createHost();
      type(fixture, 'ap');

      const custom = customOptions();
      expect(custom.length).toBe(2);
      expect(custom[0].textContent).toContain('APPLE');
      expect(custom[1].textContent).toContain('APRICOT');
      expect(custom[1].getAttribute('data-index')).toBe('1');
      // The default label/description markup is fully replaced.
      expect(
        overlayContainer.getContainerElement().querySelector('.dm-autocomplete__option-text'),
      ).toBeNull();
    });

    it('exposes an `active` flag that follows keyboard navigation', () => {
      const fixture = createHost();
      type(fixture, 'ap'); // active resets to the first enabled option (Apple)

      expect(customOptions()[0].getAttribute('data-option-active')).toBe('true');
      expect(customOptions()[1].getAttribute('data-option-active')).toBe('false');

      input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      tick();

      expect(customOptions()[0].getAttribute('data-option-active')).toBe('false');
      expect(customOptions()[1].getAttribute('data-option-active')).toBe('true');
    });

    it('commits the label and emits optionSelected when picking a templated option', () => {
      const fixture = createHost();
      type(fixture, 'ban');

      options()[0].click();
      tick();

      expect(fixture.componentInstance.value()).toBe('Banana');
      expect(fixture.componentInstance.selected.length).toBe(1);
      expect(fixture.componentInstance.selected[0].value).toBe('banana');
      expect(options().length).toBe(0); // closed after selection
    });

    it('keeps the default option rendering when no template is projected', () => {
      const fixture = create();
      type(fixture, 'apr');

      const panel = overlayContainer.getContainerElement();
      expect(panel.querySelector('.dm-autocomplete__option-label')?.textContent).toContain(
        'Apricot',
      );
      expect(panel.querySelector('.dm-autocomplete__option-description')?.textContent).toContain(
        'Stone fruit',
      );
    });
  });
});
