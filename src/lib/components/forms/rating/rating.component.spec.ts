import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmRatingComponent } from './rating.component';
import { RATING_DEFAULTS } from './rating.tokens';

@Component({
  imports: [DmRatingComponent, ReactiveFormsModule],
  template: '<dm-rating [formControl]="control" [max]="5" />',
})
class FormHostComponent {
  readonly control = new FormControl(2, { nonNullable: true });
}

describe('DmRatingComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(): ComponentFixture<DmRatingComponent> {
    const fixture = TestBed.createComponent(DmRatingComponent);
    fixture.detectChanges();
    return fixture;
  }

  function host(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('dm-rating') ?? fixture.nativeElement;
  }

  function stars(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-rating__star'));
  }

  function fills(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-rating__layer--full'));
  }

  function keydown(el: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event;
  }

  /** Presses a star; `leftHalf` places the pointer in its left half. */
  function clickStar(fixture: ComponentFixture<unknown>, index: number, leftHalf = false): void {
    const star = stars(fixture)[index];
    star.getBoundingClientRect = () =>
      ({ left: 0, width: 20, right: 20, top: 0, bottom: 20, height: 20, x: 0, y: 0 }) as DOMRect;
    star.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: leftHalf ? 5 : 15, button: 0, bubbles: true }),
    );
    fixture.detectChanges();
  }

  // ---- Rendering & aria ----------------------------------------------------
  it('renders max star glyphs by default', () => {
    const fixture = create();
    expect(stars(fixture).length).toBe(5);
  });

  it('respects a custom max', () => {
    const fixture = create();
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();
    expect(stars(fixture).length).toBe(10);
  });

  it('exposes the slider aria contract on the host', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();
    const h = host(fixture);

    expect(h.getAttribute('role')).toBe('slider');
    expect(h.getAttribute('aria-valuemin')).toBe('0');
    expect(h.getAttribute('aria-valuemax')).toBe('5');
    expect(h.getAttribute('aria-valuenow')).toBe('3');
    expect(h.getAttribute('aria-valuetext')).toBe('3 of 5 stars');
    expect(h.getAttribute('tabindex')).toBe('0');
  });

  it('renders the accessible label when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Rate this');
    fixture.detectChanges();
    expect(host(fixture).getAttribute('aria-label')).toBe('Rate this');
  });

  it('exposes size and color as host data attributes', () => {
    const fixture = create();
    expect(host(fixture).getAttribute('data-size')).toBe('md');
    expect(host(fixture).getAttribute('data-color')).toBe('warning');

    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'primary');
    fixture.detectChanges();

    expect(host(fixture).getAttribute('data-size')).toBe('lg');
    expect(host(fixture).getAttribute('data-color')).toBe('primary');
  });

  it('renders a custom character glyph', () => {
    const fixture = create();
    fixture.componentRef.setInput('character', '❤');
    fixture.detectChanges();

    const chars = fixture.nativeElement.querySelectorAll('.dm-rating__char');
    expect(chars.length).toBeGreaterThan(0);
    expect(chars[0].textContent?.trim()).toBe('❤');
    expect(fixture.nativeElement.querySelector('.dm-rating__svg')).toBeNull();
  });

  // ---- Fill fractions ------------------------------------------------------
  it('fills stars up to the value', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    const widths = fills(fixture).map((el) => el.style.inlineSize);
    expect(widths).toEqual(['100%', '100%', '100%', '0%', '0%']);
  });

  it('renders fractional readonly averages precisely', () => {
    const fixture = create();
    fixture.componentRef.setInput('readonly', true);
    fixture.componentInstance.writeValue(3.7);
    fixture.detectChanges();

    const widths = fills(fixture).map((el) => el.style.inlineSize);
    // 3.7 → three full, the fourth ~70%, the fifth empty.
    expect(widths[0]).toBe('100%');
    expect(widths[2]).toBe('100%');
    expect(widths[3]).toBe('70%');
    expect(widths[4]).toBe('0%');
  });

  // ---- Pointer -------------------------------------------------------------
  it('clicking a star sets the value', () => {
    const fixture = create();
    clickStar(fixture, 2);
    expect(fixture.componentInstance.value()).toBe(3);
  });

  it('clicking the current value again clears to 0', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    clickStar(fixture, 2);
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('allowHalf resolves a left-half click to a half step', () => {
    const fixture = create();
    fixture.componentRef.setInput('allowHalf', true);
    fixture.detectChanges();

    clickStar(fixture, 2, true);
    expect(fixture.componentInstance.value()).toBe(2.5);

    clickStar(fixture, 2, false);
    expect(fixture.componentInstance.value()).toBe(3);
  });

  // ---- Keyboard ------------------------------------------------------------
  it('ArrowRight / ArrowUp increment, ArrowLeft / ArrowDown decrement', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 2);
    fixture.detectChanges();

    keydown(host(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(3);
    keydown(host(fixture), 'ArrowUp');
    expect(fixture.componentInstance.value()).toBe(4);
    keydown(host(fixture), 'ArrowLeft');
    expect(fixture.componentInstance.value()).toBe(3);
    keydown(host(fixture), 'ArrowDown');
    expect(fixture.componentInstance.value()).toBe(2);
  });

  it('Home jumps to 0 and End jumps to max', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    keydown(host(fixture), 'Home');
    expect(fixture.componentInstance.value()).toBe(0);
    keydown(host(fixture), 'End');
    expect(fixture.componentInstance.value()).toBe(5);
  });

  it('allowHalf makes the keyboard step by 0.5', () => {
    const fixture = create();
    fixture.componentRef.setInput('allowHalf', true);
    fixture.componentRef.setInput('value', 2);
    fixture.detectChanges();

    keydown(host(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(2.5);
  });

  it('clamps within [0, max] on the keyboard', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();

    keydown(host(fixture), 'ArrowLeft');
    expect(fixture.componentInstance.value()).toBe(0);

    fixture.componentRef.setInput('value', 5);
    fixture.detectChanges();
    keydown(host(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(5);
  });

  it('calls preventDefault on handled keys and ignores others', () => {
    const fixture = create();
    expect(keydown(host(fixture), 'ArrowRight').defaultPrevented).toBe(true);
    expect(keydown(host(fixture), 'a').defaultPrevented).toBe(false);
  });

  // ---- Readonly & disabled -------------------------------------------------
  it('readonly is non-interactive but still exposes the aria value', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 4);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    expect(host(fixture).getAttribute('aria-readonly')).toBe('true');
    expect(host(fixture).getAttribute('aria-valuenow')).toBe('4');
    expect(host(fixture).getAttribute('tabindex')).toBe('-1');

    keydown(host(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(4);

    clickStar(fixture, 0);
    expect(fixture.componentInstance.value()).toBe(4);
  });

  it('disabled blocks interaction and reflects on the host', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 2);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(host(fixture).getAttribute('aria-disabled')).toBe('true');
    expect(host(fixture).getAttribute('data-disabled')).toBe('true');
    expect(host(fixture).getAttribute('tabindex')).toBe('-1');

    keydown(host(fixture), 'ArrowRight');
    clickStar(fixture, 4);
    expect(fixture.componentInstance.value()).toBe(2);
  });

  // ---- ControlValueAccessor ------------------------------------------------
  it('writeValue clamps into [0, max] and coerces non-numeric to 0', () => {
    const fixture = create();

    fixture.componentInstance.writeValue(99);
    expect(fixture.componentInstance.value()).toBe(5);
    fixture.componentInstance.writeValue(-3);
    expect(fixture.componentInstance.value()).toBe(0);
    fixture.componentInstance.writeValue('not a number');
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('registerOnChange fires on commit, registerOnTouched on blur', () => {
    const fixture = create();
    const changes: number[] = [];
    let touched = false;
    fixture.componentInstance.registerOnChange((v: number) => changes.push(v));
    fixture.componentInstance.registerOnTouched(() => (touched = true));

    keydown(host(fixture), 'ArrowRight');
    expect(changes).toEqual([1]);

    host(fixture).dispatchEvent(new Event('blur'));
    expect(touched).toBe(true);
  });

  it('setDisabledState propagates the forms disabled state', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    expect(host(fixture).getAttribute('aria-disabled')).toBe('true');
    expect(host(fixture).getAttribute('tabindex')).toBe('-1');
  });

  it('emits rateChange when a new value is committed', () => {
    const fixture = create();
    const emitted: number[] = [];
    fixture.componentInstance.rateChange.subscribe((v) => emitted.push(v));

    keydown(host(fixture), 'ArrowRight');
    expect(emitted).toEqual([1]);
  });

  // ---- Reactive forms ------------------------------------------------------
  it('round-trips through a reactive FormControl', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const h = fixture.nativeElement.querySelector('dm-rating') as HTMLElement;

    // Model reflects the initial control value.
    expect(h.getAttribute('aria-valuenow')).toBe('2');

    // Programmatic write flows in.
    app.control.setValue(4);
    fixture.detectChanges();
    expect(h.getAttribute('aria-valuenow')).toBe('4');

    // Keyboard change flows back out.
    keydown(h, 'ArrowRight');
    expect(app.control.value).toBe(5);

    // Disable state propagates.
    app.control.disable();
    fixture.detectChanges();
    expect(h.getAttribute('aria-disabled')).toBe('true');
    expect(h.getAttribute('tabindex')).toBe('-1');
  });

  // ---- Injectable defaults -------------------------------------------------
  it('reads its defaults from RATING_DEFAULTS', () => {
    TestBed.overrideProvider(RATING_DEFAULTS, {
      useValue: { max: 3, size: 'lg', color: 'danger', allowHalf: true },
    });
    const fixture = create();

    expect(stars(fixture).length).toBe(3);
    expect(host(fixture).getAttribute('data-size')).toBe('lg');
    expect(host(fixture).getAttribute('data-color')).toBe('danger');

    fixture.componentRef.setInput('value', 1);
    fixture.detectChanges();
    keydown(host(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(1.5);
  });
});
