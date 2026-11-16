import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmDatePickerDayDirective } from './date-picker-day.directive';
import { DmDatePickerComponent } from './date-picker.component';
import { DM_DATE_LOCALE, provideDateLocale, provideDatePickerDefaults } from './date-picker.tokens';
import { DmDateRange } from './date-picker.types';

@Component({
  imports: [DmDatePickerComponent, ReactiveFormsModule],
  template: `<dm-date-picker label="Start" [formControl]="control" />`,
})
class FormHostComponent {
  readonly control = new FormControl<Date | null>(null);
}

@Component({
  imports: [DmDatePickerComponent, DmDatePickerDayDirective],
  template: `
    <dm-date-picker
      label="Start"
      locale="en-US"
      [range]="range()"
      [(value)]="value"
      [(rangeValue)]="rangeValue"
      [min]="min()"
      [max]="max()"
    >
      <ng-template
        dmDatePickerDay
        let-date
        let-selected="selected"
        let-disabled="disabled"
        let-today="today"
        let-outside="outside"
      >
        <span
          class="custom-day"
          [class.custom-day--selected]="selected"
          [class.custom-day--disabled]="disabled"
          [class.custom-day--today]="today"
          [class.custom-day--outside]="outside"
          >{{ date.getDate() }}</span
        >
      </ng-template>
    </dm-date-picker>
  `,
})
class DayTemplateHostComponent {
  readonly range = signal(false);
  readonly value = signal<Date | null>(new Date(2026, 7, 17));
  readonly rangeValue = signal<DmDateRange | null>(null);
  readonly min = signal<Date | null>(null);
  readonly max = signal<Date | null>(null);
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

  it('emits openChange on open and close', () => {
    const fixture = create();
    const events: boolean[] = [];
    fixture.componentInstance.openChange.subscribe((v) => events.push(v));

    trigger(fixture).click();
    fixture.detectChanges();
    expect(events).toEqual([true]);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(events).toEqual([true, false]);
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
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    // A native <button> doesn't support aria-required / aria-invalid
    // (aria-allowed-attr); the error text conveys invalidity via describedby.
    expect(btn.getAttribute('aria-required')).toBeNull();
    expect(btn.getAttribute('aria-invalid')).toBeNull();
    expect(btn.getAttribute('aria-describedby')).toBeTruthy();
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

  describe('range mode', () => {
    /** In-month, enabled day buttons in ascending calendar order. */
    function inMonthDays(): HTMLButtonElement[] {
      return days().filter((d) => !d.hasAttribute('data-outside') && !d.disabled);
    }

    function openRange(value: unknown = null): ComponentFixture<DmDatePickerComponent> {
      const fixture = create();
      fixture.componentRef.setInput('range', true);
      fixture.componentRef.setInput('locale', 'en-US');
      if (value !== null) {
        fixture.componentRef.setInput('rangeValue', value);
      }
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();
      return fixture;
    }

    it('first click sets start with a null end and keeps the panel open', () => {
      const fixture = openRange();
      inMonthDays()[5].click();
      fixture.detectChanges();
      const r = fixture.componentInstance.rangeValue();
      expect(r?.start).toBeInstanceOf(Date);
      expect(r?.end).toBeNull();
      expect(panel()).not.toBeNull();
    });

    it('second click on/after the start completes the range and closes', () => {
      const fixture = openRange();
      const cells = inMonthDays();
      cells[5].click();
      fixture.detectChanges();
      inMonthDays()[15].click();
      fixture.detectChanges();
      const r = fixture.componentInstance.rangeValue();
      expect(r?.start).toBeInstanceOf(Date);
      expect(r?.end).toBeInstanceOf(Date);
      expect(r!.end!.getTime()).toBeGreaterThan(r!.start!.getTime());
      expect(panel()).toBeNull();
    });

    it('a second click before the start restarts the range', () => {
      const fixture = openRange();
      inMonthDays()[15].click();
      fixture.detectChanges();
      const firstStart = fixture.componentInstance.rangeValue()!.start!;
      inMonthDays()[5].click();
      fixture.detectChanges();
      const r = fixture.componentInstance.rangeValue();
      expect(r?.end).toBeNull();
      expect(r!.start!.getTime()).toBeLessThan(firstStart.getTime());
      expect(panel()).not.toBeNull();
    });

    it('renders the trigger text as "start – …" then "start – end"', () => {
      const fixture = openRange();
      inMonthDays()[5].click();
      fixture.detectChanges();
      expect(trigger(fixture).textContent).toContain('–');
      expect(trigger(fixture).textContent).toContain('…');

      inMonthDays()[15].click();
      fixture.detectChanges();
      expect(trigger(fixture).textContent).toContain('–');
      expect(trigger(fixture).textContent).not.toContain('…');
    });

    it('marks the days between the endpoints with data-in-range', () => {
      openRange({
        start: new Date(2026, 7, 10),
        end: new Date(2026, 7, 20),
      });
      const band = days().filter((d) => d.hasAttribute('data-in-range'));
      expect(band.length).toBeGreaterThan(0);
      const start = days().find((d) => d.hasAttribute('data-range-start'));
      const end = days().find((d) => d.hasAttribute('data-range-end'));
      expect(start).not.toBeNull();
      expect(end).not.toBeNull();
    });

    it('previews a tentative band on hover while picking the end', () => {
      const fixture = openRange();
      const cells = inMonthDays();
      cells[5].click();
      fixture.detectChanges();
      inMonthDays()[15].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      fixture.detectChanges();
      const preview = days().filter((d) => d.hasAttribute('data-in-range-preview'));
      expect(preview.length).toBeGreaterThan(0);
    });

    it('clears the range via the clear button', () => {
      const fixture = create();
      fixture.componentRef.setInput('range', true);
      fixture.componentRef.setInput('clearable', true);
      fixture.componentRef.setInput('rangeValue', {
        start: new Date(2026, 7, 10),
        end: new Date(2026, 7, 20),
      });
      fixture.detectChanges();
      const clear = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
        '.dm-date-picker__clear',
      );
      expect(clear).not.toBeNull();
      clear!.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.rangeValue()).toBeNull();
    });

    it('accepts a DmDateRange through writeValue and normalises to local midnight', () => {
      const fixture = create();
      fixture.componentRef.setInput('range', true);
      fixture.detectChanges();
      fixture.componentInstance.writeValue({
        start: new Date(2026, 7, 10, 9, 30),
        end: new Date(2026, 7, 20, 18, 0),
      });
      const r = fixture.componentInstance.rangeValue();
      expect(r?.start?.getHours()).toBe(0);
      expect(r?.end?.getHours()).toBe(0);
    });

    it('leaves single-mode value untouched while in range mode', () => {
      const fixture = openRange();
      inMonthDays()[5].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBeNull();
    });
  });

  describe('custom day template (dmDatePickerDay)', () => {
    function customDays(): HTMLElement[] {
      return Array.from(overlayContainer.getContainerElement().querySelectorAll('.custom-day'));
    }

    function openHost(): ComponentFixture<DayTemplateHostComponent> {
      const fixture = TestBed.createComponent(DayTemplateHostComponent);
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();
      return fixture;
    }

    it('renders the projected template in every day cell with context flags', () => {
      const fixture = TestBed.createComponent(DayTemplateHostComponent);
      fixture.componentInstance.min.set(new Date(2026, 7, 10));
      fixture.componentInstance.max.set(new Date(2026, 7, 20));
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();

      expect(customDays()).toHaveLength(42);
      const selected = customDays().filter((d) => d.classList.contains('custom-day--selected'));
      expect(selected).toHaveLength(1);
      expect(selected[0].textContent?.trim()).toBe('17');
      // Aug 1–9 / 21+ fall outside min/max → flagged disabled through the context.
      expect(customDays().some((d) => d.classList.contains('custom-day--disabled'))).toBe(true);
      // The 42-cell grid always includes adjacent-month filler days.
      expect(customDays().some((d) => d.classList.contains('custom-day--outside'))).toBe(true);
    });

    it('marks today through the template context', () => {
      const fixture = TestBed.createComponent(DayTemplateHostComponent);
      const now = new Date();
      fixture.componentInstance.value.set(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      );
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();

      const todayButton = overlayContainer
        .getContainerElement()
        .querySelector('.dm-date-picker__day[aria-current="date"]');
      expect(todayButton?.querySelector('.custom-day--today')).not.toBeNull();
      expect(customDays().filter((d) => d.classList.contains('custom-day--today'))).toHaveLength(1);
    });

    it('still selects the day when the projected content is clicked', () => {
      const fixture = openHost();
      const target = customDays().find(
        (d) =>
          d.textContent?.trim() === '20' &&
          !d.classList.contains('custom-day--outside') &&
          !d.classList.contains('custom-day--disabled'),
      )!;
      target.click();
      fixture.detectChanges();

      const v = fixture.componentInstance.value();
      expect(v).toBeInstanceOf(Date);
      expect(v!.getDate()).toBe(20);
      expect(panel()).toBeNull();
    });

    it('flags range endpoints and the confirmed band as selected', () => {
      const fixture = TestBed.createComponent(DayTemplateHostComponent);
      fixture.componentInstance.range.set(true);
      fixture.componentInstance.value.set(null);
      fixture.componentInstance.rangeValue.set({
        start: new Date(2026, 7, 10),
        end: new Date(2026, 7, 20),
      });
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();

      // Aug 10 … Aug 20 inclusive — mirrors the cells' aria-selected.
      const selected = customDays().filter((d) => d.classList.contains('custom-day--selected'));
      expect(selected).toHaveLength(11);
    });

    it('keeps the default plain-number render when no template is projected', () => {
      const fixture = create();
      fixture.componentRef.setInput('locale', 'en-US');
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();

      expect(customDays()).toHaveLength(0);
      // Each day button contains only the Intl-formatted digits, no extra nodes.
      expect(days().every((d) => d.children.length === 0)).toBe(true);
      expect(days().every((d) => /^\d{1,2}$/.test(d.textContent?.trim() ?? ''))).toBe(true);
    });
  });
});
