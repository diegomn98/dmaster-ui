import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmSliderComponent } from './slider.component';
import { SLIDER_DEFAULTS } from './slider.tokens';

@Component({
  imports: [DmSliderComponent, ReactiveFormsModule],
  template: '<dm-slider [formControl]="control" [min]="0" [max]="100" [step]="1" />',
})
class FormHostComponent {
  readonly control = new FormControl(20, { nonNullable: true });
}

describe('DmSliderComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(): ComponentFixture<DmSliderComponent> {
    const fixture = TestBed.createComponent(DmSliderComponent);
    fixture.detectChanges();
    return fixture;
  }

  function host(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('dm-slider') ?? fixture.nativeElement;
  }

  function thumb(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.dm-slider__thumb');
  }

  function track(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.dm-slider__track');
  }

  function zone(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.dm-slider__zone');
  }

  function keydown(el: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event;
  }

  function mockTrack(fixture: ComponentFixture<unknown>, left: number, width: number): void {
    track(fixture).getBoundingClientRect = () =>
      ({
        left,
        width,
        right: left + width,
        top: 0,
        bottom: 0,
        height: 0,
        x: left,
        y: 0,
      }) as DOMRect;
  }

  // ---- Rendering & aria ----------------------------------------------------
  it('renders slider role with the default aria contract', () => {
    const fixture = create();
    const t = thumb(fixture);

    expect(t.getAttribute('role')).toBe('slider');
    expect(t.getAttribute('aria-orientation')).toBe('horizontal');
    expect(t.getAttribute('tabindex')).toBe('0');
    expect(t.getAttribute('aria-valuemin')).toBe('0');
    expect(t.getAttribute('aria-valuemax')).toBe('100');
    expect(t.getAttribute('aria-valuenow')).toBe('0');
  });

  it('reflects the value on aria-valuenow and the fill/thumb position', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 40);
    fixture.detectChanges();

    expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('40');
    const fill = fixture.nativeElement.querySelector('.dm-slider__fill') as HTMLElement;
    expect(fill.style.width).toBe('40%');
    expect(thumb(fixture).style.left).toBe('40%');
  });

  it('exposes size and color as host data attributes', () => {
    const fixture = create();
    expect(host(fixture).getAttribute('data-size')).toBe('md');
    expect(host(fixture).getAttribute('data-color')).toBe('primary');

    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'success');
    fixture.detectChanges();

    expect(host(fixture).getAttribute('data-size')).toBe('lg');
    expect(host(fixture).getAttribute('data-color')).toBe('success');
  });

  it('renders the accessible label when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Volume');
    fixture.detectChanges();

    expect(thumb(fixture).getAttribute('aria-label')).toBe('Volume');
  });

  // ---- ControlValueAccessor: writeValue clamp + snap -----------------------
  it('writeValue clamps above max and below min', () => {
    const fixture = create();
    fixture.componentRef.setInput('max', 100);

    fixture.componentInstance.writeValue(999);
    expect(fixture.componentInstance.value()).toBe(100);

    fixture.componentInstance.writeValue(-50);
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('writeValue snaps onto the step grid', () => {
    const fixture = create();
    fixture.componentRef.setInput('step', 10);
    fixture.detectChanges();

    fixture.componentInstance.writeValue(73);
    expect(fixture.componentInstance.value()).toBe(70);
  });

  it('writeValue coerces non-numeric input to the minimum', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 5);
    fixture.detectChanges();

    fixture.componentInstance.writeValue('not a number');
    expect(fixture.componentInstance.value()).toBe(5);
  });

  // ---- Keyboard ------------------------------------------------------------
  it('ArrowRight / ArrowUp increment by one step', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    keydown(thumb(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(11);

    keydown(thumb(fixture), 'ArrowUp');
    expect(fixture.componentInstance.value()).toBe(12);
  });

  it('ArrowLeft / ArrowDown decrement by one step', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    keydown(thumb(fixture), 'ArrowLeft');
    expect(fixture.componentInstance.value()).toBe(9);

    keydown(thumb(fixture), 'ArrowDown');
    expect(fixture.componentInstance.value()).toBe(8);
  });

  it('Home jumps to min and End jumps to max', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 40);
    fixture.detectChanges();

    keydown(thumb(fixture), 'Home');
    expect(fixture.componentInstance.value()).toBe(0);

    keydown(thumb(fixture), 'End');
    expect(fixture.componentInstance.value()).toBe(100);
  });

  it('PageUp / PageDown move by (max - min) / 10', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();

    keydown(thumb(fixture), 'PageUp');
    expect(fixture.componentInstance.value()).toBe(60);

    keydown(thumb(fixture), 'PageDown');
    expect(fixture.componentInstance.value()).toBe(50);
  });

  it('calls preventDefault on handled keys', () => {
    const fixture = create();
    const event = keydown(thumb(fixture), 'ArrowRight');
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores unhandled keys without preventing default', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    const event = keydown(thumb(fixture), 'a');
    expect(event.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.value()).toBe(10);
  });

  it('handles a decimal step of 0.1 without float artifacts', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 1);
    fixture.componentRef.setInput('step', 0.1);
    fixture.componentRef.setInput('value', 0.2);
    fixture.detectChanges();

    keydown(thumb(fixture), 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(0.3);
    expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('0.3');

    keydown(thumb(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(0.4);
  });

  // ---- CVA notifications ---------------------------------------------------
  it('registerOnChange fires on keyboard changes', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    const changes: number[] = [];
    fixture.componentInstance.registerOnChange((v: number) => changes.push(v));

    keydown(thumb(fixture), 'ArrowRight');
    expect(changes).toEqual([11]);
  });

  it('registerOnTouched fires on blur', () => {
    const fixture = create();
    let touched = false;
    fixture.componentInstance.registerOnTouched(() => (touched = true));

    thumb(fixture).dispatchEvent(new Event('blur'));
    expect(touched).toBe(true);
  });

  // ---- Disabled ------------------------------------------------------------
  it('setDisabledState blocks keyboard interaction', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    keydown(thumb(fixture), 'ArrowRight');
    expect(fixture.componentInstance.value()).toBe(10);
    expect(thumb(fixture).getAttribute('aria-disabled')).toBe('true');
    expect(thumb(fixture).getAttribute('tabindex')).toBe('-1');
    expect(host(fixture).getAttribute('data-disabled')).toBe('true');
  });

  it('disabled input blocks pointer interaction', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    mockTrack(fixture, 0, 200);

    zone(fixture).dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 100, button: 0, bubbles: true }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(10);
  });

  // ---- Pointer -------------------------------------------------------------
  it('pointerdown jumps to the value under the pointer', () => {
    const fixture = create();
    fixture.detectChanges();
    mockTrack(fixture, 0, 200);

    // clientX 100 over a 200px track (left 0) → ratio 0.5 → value 50.
    zone(fixture).dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 100, button: 0, bubbles: true }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(50);
    expect(host(fixture).getAttribute('data-dragging')).toBe('true');
  });

  it('ignores secondary mouse buttons on pointerdown', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();
    mockTrack(fixture, 0, 200);

    zone(fixture).dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 100, button: 2, bubbles: true }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(10);
  });

  // ---- Marks ---------------------------------------------------------------
  it('renders marks with an active flag for values at or below the current value', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('marks', [{ value: 25 }, { value: 50 }, { value: 75 }]);
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.dm-slider__mark');
    const active = fixture.nativeElement.querySelectorAll('.dm-slider__mark--active');
    expect(dots.length).toBe(3);
    expect(active.length).toBe(2);
  });

  it('renders mark labels when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('marks', [{ value: 50, label: 'Half' }, { value: 100 }]);
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('.dm-slider__mark-label');
    expect(labels.length).toBe(1);
    expect(labels[0].textContent?.trim()).toBe('Half');
  });

  // ---- formatValue & value label -------------------------------------------
  it('applies formatValue to aria-valuetext and the bubble', () => {
    const fixture = create();
    fixture.componentRef.setInput('value', 40);
    fixture.componentRef.setInput('showValueLabel', true);
    fixture.componentRef.setInput('formatValue', (v: number) => `${v}%`);
    fixture.detectChanges();

    expect(thumb(fixture).getAttribute('aria-valuetext')).toBe('40%');
    const bubble = fixture.nativeElement.querySelector('.dm-slider__bubble') as HTMLElement;
    expect(bubble.textContent?.trim()).toBe('40%');
  });

  it('hides the value bubble unless showValueLabel is set', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('.dm-slider__bubble')).toBeNull();

    fixture.componentRef.setInput('showValueLabel', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dm-slider__bubble')).not.toBeNull();
  });

  // ---- Injectable defaults -------------------------------------------------
  it('reads its defaults from SLIDER_DEFAULTS', () => {
    TestBed.overrideProvider(SLIDER_DEFAULTS, {
      useValue: { size: 'lg', color: 'danger', showValueLabel: true },
    });
    const fixture = create();

    expect(host(fixture).getAttribute('data-size')).toBe('lg');
    expect(host(fixture).getAttribute('data-color')).toBe('danger');
    expect(fixture.nativeElement.querySelector('.dm-slider__bubble')).not.toBeNull();
  });

  // ---- Reactive forms ------------------------------------------------------
  it('integrates with reactive forms (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;

    // Model reflects the initial control value.
    expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('20');

    // Programmatic write flows in.
    app.control.setValue(60);
    fixture.detectChanges();
    expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('60');

    // Keyboard change flows back out.
    keydown(thumb(fixture), 'ArrowRight');
    expect(app.control.value).toBe(61);

    // Disable state propagates.
    app.control.disable();
    fixture.detectChanges();
    expect(thumb(fixture).getAttribute('aria-disabled')).toBe('true');
    expect(thumb(fixture).getAttribute('tabindex')).toBe('-1');
  });
});
