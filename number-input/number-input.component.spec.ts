import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmNumberInputComponent } from './number-input.component';
import { DM_NUMBER_INPUT_FALLBACK_DEFAULTS, NUMBER_INPUT_DEFAULTS } from './number-input.tokens';

@Component({
  imports: [DmNumberInputComponent, ReactiveFormsModule],
  template: '<dm-number-input [formControl]="control" label="Quantity" [min]="0" [max]="10" />',
})
class FormHostComponent {
  readonly control = new FormControl<number | null>(5);
}

describe('DmNumberInputComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(inputs: Record<string, unknown> = {}): ComponentFixture<DmNumberInputComponent> {
    const fixture = TestBed.createComponent(DmNumberInputComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  function control(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.dm-number-input__control');
  }

  function input(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('.dm-number-input__input');
  }

  function stepBtn(
    fixture: ComponentFixture<unknown>,
    direction: 'up' | 'down',
  ): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      `.dm-number-input__step[data-direction="${direction}"]`,
    );
  }

  function type(fixture: ComponentFixture<unknown>, text: string): void {
    const el = input(fixture);
    el.value = text;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function blur(fixture: ComponentFixture<unknown>): void {
    input(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function focus(fixture: ComponentFixture<unknown>): void {
    input(fixture).dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  }

  function keydown(
    fixture: ComponentFixture<unknown>,
    key: string,
    shiftKey = false,
  ): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
    input(fixture).dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  it('renders a spinbutton with −/+ controls and flat/md/md defaults', () => {
    const fixture = create();

    expect(input(fixture).getAttribute('role')).toBe('spinbutton');
    expect(input(fixture).getAttribute('inputmode')).toBe('decimal');
    expect(stepBtn(fixture, 'down')).not.toBeNull();
    expect(stepBtn(fixture, 'up')).not.toBeNull();
    expect(control(fixture).getAttribute('data-variant')).toBe('flat');
    expect(control(fixture).getAttribute('data-size')).toBe('md');
    expect(control(fixture).getAttribute('data-radius')).toBe('md');
    expect(control(fixture).hasAttribute('data-controls')).toBe(true);
    expect(stepBtn(fixture, 'down').getAttribute('aria-label')).toBe('Decrease');
    expect(stepBtn(fixture, 'up').getAttribute('aria-label')).toBe('Increase');
  });

  it('steps the value with the −/+ buttons and emits valueCommit', () => {
    const fixture = create({ value: 5, step: 2 });
    const commits: (number | null)[] = [];
    fixture.componentInstance.valueCommit.subscribe((v) => commits.push(v));

    stepBtn(fixture, 'up').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(7);
    expect(input(fixture).value).toBe('7');

    stepBtn(fixture, 'down').click();
    stepBtn(fixture, 'down').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(3);
    expect(commits).toEqual([7, 5, 3]);
  });

  it('starts from 0 when empty and steps from there', () => {
    const fixture = create();
    expect(fixture.componentInstance.value()).toBeNull();

    stepBtn(fixture, 'up').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(1);
  });

  it('clamps at min/max and disables the matching button at the bound', () => {
    const fixture = create({ value: 9, min: 0, max: 10 });

    stepBtn(fixture, 'up').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(10);
    expect(stepBtn(fixture, 'up').disabled).toBe(true);
    expect(stepBtn(fixture, 'down').disabled).toBe(false);

    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(stepBtn(fixture, 'down').disabled).toBe(true);
    expect(stepBtn(fixture, 'up').disabled).toBe(false);

    keydown(fixture, 'ArrowDown');
    expect(fixture.componentInstance.value()).toBe(0);
  });

  it('steps with ArrowUp/ArrowDown, ×10 with Shift and PageUp/PageDown', () => {
    const fixture = create({ value: 50, step: 1 });

    keydown(fixture, 'ArrowUp');
    expect(fixture.componentInstance.value()).toBe(51);

    keydown(fixture, 'ArrowDown');
    expect(fixture.componentInstance.value()).toBe(50);

    keydown(fixture, 'ArrowUp', true);
    expect(fixture.componentInstance.value()).toBe(60);

    keydown(fixture, 'PageDown');
    expect(fixture.componentInstance.value()).toBe(50);

    const event = keydown(fixture, 'PageUp');
    expect(fixture.componentInstance.value()).toBe(60);
    expect(event.defaultPrevented).toBe(true);
  });

  it('jumps to min/max with Home/End only when the bound is set', () => {
    const fixture = create({ value: 5, min: 1, max: 9 });

    keydown(fixture, 'Home');
    expect(fixture.componentInstance.value()).toBe(1);

    keydown(fixture, 'End');
    expect(fixture.componentInstance.value()).toBe(9);

    const unbounded = create({ value: 5 });
    const event = keydown(unbounded, 'Home');
    expect(unbounded.componentInstance.value()).toBe(5);
    expect(event.defaultPrevented).toBe(false);
  });

  it('commits the typed text on blur, clamped and rounded to the step precision', () => {
    const fixture = create({ step: 0.5, min: 0, max: 5 });

    type(fixture, '3.333');
    expect(fixture.componentInstance.value()).toBeNull(); // draft, not yet committed
    blur(fixture);
    expect(fixture.componentInstance.value()).toBe(3.3);
    expect(input(fixture).value).toBe('3.3');

    type(fixture, '12');
    blur(fixture);
    expect(fixture.componentInstance.value()).toBe(5);

    type(fixture, '1,25');
    keydown(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toBe(1.3);
  });

  it('keeps the previous value when the typed text is not a number', () => {
    const fixture = create({ value: 4 });

    type(fixture, 'abc');
    blur(fixture);
    expect(fixture.componentInstance.value()).toBe(4);
    expect(input(fixture).value).toBe('4');
  });

  it('yields null when the field is cleared', () => {
    const fixture = create({ value: 4 });
    const commits: (number | null)[] = [];
    fixture.componentInstance.valueCommit.subscribe((v) => commits.push(v));

    type(fixture, '');
    blur(fixture);
    expect(fixture.componentInstance.value()).toBeNull();
    expect(input(fixture).value).toBe('');
    expect(input(fixture).hasAttribute('aria-valuenow')).toBe(false);
    expect(commits).toEqual([null]);
  });

  it('round-trips through a FormControl (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    expect(input(fixture).value).toBe('5');

    host.control.setValue(8);
    fixture.detectChanges();
    expect(input(fixture).value).toBe('8');

    type(fixture, '42');
    blur(fixture);
    expect(host.control.value).toBe(10); // clamped to max
    expect(host.control.touched).toBe(true);

    stepBtn(fixture, 'down').click();
    fixture.detectChanges();
    expect(host.control.value).toBe(9);

    host.control.disable();
    fixture.detectChanges();
    expect(input(fixture).disabled).toBe(true);
    expect(stepBtn(fixture, 'up').disabled).toBe(true);
    expect(control(fixture).hasAttribute('data-disabled')).toBe(true);
  });

  it('hides the −/+ buttons with hideControls while keyboard stepping keeps working', () => {
    const fixture = create({ value: 1, hideControls: true });

    expect(fixture.nativeElement.querySelector('.dm-number-input__controls')).toBeNull();
    expect(control(fixture).hasAttribute('data-controls')).toBe(false);

    keydown(fixture, 'ArrowUp');
    expect(fixture.componentInstance.value()).toBe(2);
  });

  it('blocks stepping while readonly or disabled', () => {
    const fixture = create({ value: 3, readonly: true });

    expect(input(fixture).readOnly).toBe(true);
    expect(stepBtn(fixture, 'up').disabled).toBe(true);
    expect(stepBtn(fixture, 'down').disabled).toBe(true);
    keydown(fixture, 'ArrowUp');
    expect(fixture.componentInstance.value()).toBe(3);

    fixture.componentRef.setInput('readonly', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(input(fixture).disabled).toBe(true);
    expect(stepBtn(fixture, 'up').disabled).toBe(true);
    keydown(fixture, 'PageUp');
    expect(fixture.componentInstance.value()).toBe(3);
  });

  it('exposes spinbutton ARIA: bounds, current value, label and invalid state', () => {
    const fixture = create({ value: 7, min: 0, max: 20, ariaLabel: 'Seats', required: true });
    const el = input(fixture);

    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('20');
    expect(el.getAttribute('aria-valuenow')).toBe('7');
    expect(el.getAttribute('aria-label')).toBe('Seats');
    expect(el.getAttribute('aria-required')).toBe('true');
    expect(el.getAttribute('aria-invalid')).toBeNull();

    fixture.componentRef.setInput('error', 'Too many');
    fixture.detectChanges();
    expect(el.getAttribute('aria-invalid')).toBe('true');
    expect(control(fixture).hasAttribute('data-invalid')).toBe(true);
    const error = fixture.nativeElement.querySelector('.dm-number-input__error');
    expect(error.textContent).toContain('Too many');
    expect(el.getAttribute('aria-describedby')).toBe(error.id);
  });

  it('wires a visible label via aria-labelledby and the description via aria-describedby', () => {
    const fixture = create({ label: 'Quantity', description: 'Whole units', ariaLabel: 'ignored' });
    const el = input(fixture);
    const label = fixture.nativeElement.querySelector('.dm-number-input__label');
    const hint = fixture.nativeElement.querySelector('.dm-number-input__hint');

    expect(label.textContent).toContain('Quantity');
    expect(label.getAttribute('for')).toBe(el.id);
    expect(el.getAttribute('aria-labelledby')).toBe(label.id);
    expect(el.getAttribute('aria-label')).toBeNull();
    expect(el.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('shows the formatted value while blurred and the raw number while focused', () => {
    const fixture = create({
      value: 1234.5,
      locale: 'en-US',
      formatOptions: { style: 'currency', currency: 'EUR' },
    });

    expect(input(fixture).value).toBe('€1,234.50');
    expect(input(fixture).getAttribute('aria-valuetext')).toBe('€1,234.50');
    expect(input(fixture).getAttribute('aria-valuenow')).toBe('1234.5');

    focus(fixture);
    expect(input(fixture).value).toBe('1234.5');

    blur(fixture);
    expect(input(fixture).value).toBe('€1,234.50');
  });

  it('honors injected defaults, including the step-button labels', () => {
    TestBed.overrideProvider(NUMBER_INPUT_DEFAULTS, {
      useValue: {
        ...DM_NUMBER_INPUT_FALLBACK_DEFAULTS,
        variant: 'bordered',
        size: 'sm',
        radius: 'full',
        decrementLabel: 'Disminuir',
        incrementLabel: 'Aumentar',
      },
    });
    const fixture = create();

    expect(control(fixture).getAttribute('data-variant')).toBe('bordered');
    expect(control(fixture).getAttribute('data-size')).toBe('sm');
    expect(control(fixture).getAttribute('data-radius')).toBe('full');
    expect(stepBtn(fixture, 'down').getAttribute('aria-label')).toBe('Disminuir');
    expect(stepBtn(fixture, 'up').getAttribute('aria-label')).toBe('Aumentar');
  });

  it('can hide the controls app-wide via defaults', () => {
    TestBed.overrideProvider(NUMBER_INPUT_DEFAULTS, {
      useValue: { ...DM_NUMBER_INPUT_FALLBACK_DEFAULTS, hideControls: true },
    });
    const fixture = create();

    expect(fixture.nativeElement.querySelector('.dm-number-input__controls')).toBeNull();
  });
});
