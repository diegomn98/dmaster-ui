import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmDatePickerComponent } from './date-picker.component';
import { DM_DATE_LOCALE, provideDateLocale, provideDatePickerDefaults } from './date-picker.tokens';

@Component({
  imports: [DmDatePickerComponent, ReactiveFormsModule],
  template: `<dm-date-picker label="Start" [formControl]="control" />`,
})
class FormHostComponent {
  readonly control = new FormControl<Date | null>(null);
}

describe('DmDatePickerComponent', () => {
  let overlayContainer: OverlayContainer;

  function create(): ComponentFixture<DmDatePickerComponent> {
    const fixture = TestBed.createComponent(DmDatePickerComponent);
    fixture.detectChanges();
    return fixture;
  }

  function trigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-date-picker__trigger');
  }

  function panel(): HTMLElement | null {
    return overlayContainer.getContainerElement().querySelector('.dm-date-picker__panel');
  }

  function days(): HTMLButtonElement[] {
    return Array.from(
      overlayContainer.getContainerElement().querySelectorAll('.dm-date-picker__day'),
    );
  }

  async function flush(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.getContainerElement().remove();
  });

  it('renders the trigger with the placeholder when empty', () => {
    const fixture = TestBed.createComponent(DmDatePickerComponent);
    fixture.componentRef.setInput('placeholder', 'Pick a date');
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Pick a date');
  });

  it('formats the selected value in the trigger with the given locale', () => {
    const fixture = create();
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    // en-US short: "Aug 17, 2026"
    expect(trigger(fixture).textContent).toContain('Aug');
    expect(trigger(fixture).textContent).toContain('17');
    expect(trigger(fixture).textContent).toContain('2026');
  });

  it('localises month names in the header (es)', () => {
    const fixture = create();
    fixture.componentRef.setInput('locale', 'es');
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    // Spanish August is "agosto".
    expect(panel()?.textContent?.toLowerCase()).toContain('agosto');
  });

  it('opens and closes on trigger click', () => {
    const fixture = create();
    expect(panel()).toBeNull();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()).not.toBeNull();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('renders 42 day cells', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(days()).toHaveLength(42);
  });

  it('selecting a day updates the model and closes', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();

    // Click the first in-month, enabled day.
    const target = days().find((d) => !d.hasAttribute('data-outside') && !d.disabled)!;
    target.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeInstanceOf(Date);
    expect(panel()).toBeNull();
  });

  it('normalises the model value to local midnight', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(new Date(2026, 7, 17, 13, 30));
    const v = fixture.componentInstance.value()!;
    expect(v.getHours()).toBe(0);
    expect(v.getMinutes()).toBe(0);
  });

  it('blocks selection of days outside min/max', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', new Date(2026, 7, 15));
    fixture.componentRef.setInput('min', new Date(2026, 7, 10));
    fixture.componentRef.setInput('max', new Date(2026, 7, 20));
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();

    const disabledDays = days().filter((d) => d.disabled);
    expect(disabledDays.length).toBeGreaterThan(0);
  });

  it('applies the isDateDisabled predicate', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', new Date(2026, 7, 15));
    // Disable weekends.
    fixture.componentRef.setInput(
      'isDateDisabled',
      (d: Date) => d.getDay() === 0 || d.getDay() === 6,
    );
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(days().some((d) => d.disabled)).toBe(true);
  });

  it('orders weekday headers by an explicit firstDayOfWeek', () => {
    const fixture = create();
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('firstDayOfWeek', 1); // Monday first
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    const headers = Array.from(
      overlayContainer.getContainerElement().querySelectorAll('.dm-date-picker__weekday'),
    ).map((el) => el.getAttribute('aria-label'));
    expect(headers[0]).toBe('Monday');
  });

  function firstWeekdayFor(locale: string): string | null {
    const fixture = create();
    fixture.componentRef.setInput('locale', locale); // firstDayOfWeek stays 'auto'
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    return (
      overlayContainer
        .getContainerElement()
        .querySelector('.dm-date-picker__weekday')
        ?.getAttribute('aria-label') ?? null
    );
  }

  it('derives the first day of the week from the locale by default', () => {
    // Spain starts the week on Monday…
    expect(firstWeekdayFor('es-ES')).toBe('lunes');
  });

  it('derives Sunday-first weeks for US English by default', () => {
    expect(firstWeekdayFor('en-US')).toBe('Sunday');
  });

  it('climbs to the months view when the header is clicked', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    const heading = overlayContainer
      .getContainerElement()
      .querySelector<HTMLButtonElement>('.dm-date-picker__heading')!;
    heading.click();
    fixture.detectChanges();
    const chips = overlayContainer
      .getContainerElement()
      .querySelectorAll('.dm-date-picker__grid--months .dm-date-picker__chip');
    expect(chips).toHaveLength(12);
  });

  it('clears via the clear button', () => {
    const fixture = create();
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    const clear = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.dm-date-picker__clear',
    );
    expect(clear).not.toBeNull();
    clear!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('does not open when disabled', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
    expect(trigger(fixture).disabled).toBe(true);
  });

  it('wires ARIA attributes on the trigger', () => {
    const fixture = create();
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const btn = trigger(fixture);
    expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
    expect(btn.getAttribute('aria-required')).toBe('true');
    expect(btn.getAttribute('aria-invalid')).toBe('true');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('marks today with aria-current and selected day with aria-selected', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    const selected = overlayContainer
      .getContainerElement()
      .querySelector('.dm-date-picker__cell[aria-selected="true"]');
    expect(selected).not.toBeNull();
    expect(selected?.querySelector('.dm-date-picker__day')?.textContent?.trim()).toBe('17');
  });

  it('applies injected defaults', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideDatePickerDefaults({ variant: 'bordered', firstDayOfWeek: 1 }),
      ],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
    const fixture = create();
    expect(trigger(fixture).getAttribute('data-variant')).toBe('bordered');
    expect(fixture.componentInstance.firstDayOfWeek()).toBe(1);
  });

  it('follows the app-wide DM_DATE_LOCALE token (string)', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideDateLocale('es')],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
    const fixture = create();
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    // Spanish medium format → "17 ago 2026".
    expect(trigger(fixture).textContent?.toLowerCase()).toContain('ago');
  });

  it('re-renders live when a Signal<string> locale changes', () => {
    const loc = signal('en-US');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: DM_DATE_LOCALE, useValue: loc }],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
    const fixture = create();
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Aug');

    loc.set('es');
    fixture.detectChanges();
    expect(trigger(fixture).textContent?.toLowerCase()).toContain('ago');
  });

  it('lets a per-instance locale input win over the token', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideDateLocale('es')],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
    const fixture = create();
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('value', new Date(2026, 7, 17));
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Aug');
  });

  it('binds to a reactive FormControl', async () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    await flush(fixture);
    fixture.componentInstance.control.setValue(new Date(2026, 7, 17));
    await flush(fixture);
    expect(trigger(fixture).textContent).toContain('17');
  });
});
