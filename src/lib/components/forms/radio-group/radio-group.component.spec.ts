import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmRadioGroupComponent } from './radio-group.component';
import { RADIO_DEFAULTS } from './radio-group.tokens';
import { DmRadioComponent } from './radio.component';

@Component({
  imports: [DmRadioGroupComponent, DmRadioComponent],
  template: `
    <dm-radio-group name="plan" [(value)]="value" ariaLabel="Plan">
      <dm-radio value="free">Free</dm-radio>
      <dm-radio value="pro">Pro</dm-radio>
      <dm-radio value="team">Team</dm-radio>
    </dm-radio-group>
  `,
})
class TwoWayHostComponent {
  readonly value = signal<string | null>(null);
}

@Component({
  imports: [DmRadioGroupComponent, DmRadioComponent, ReactiveFormsModule],
  template: `
    <dm-radio-group name="plan" [formControl]="control" ariaLabel="Plan">
      <dm-radio value="free">Free</dm-radio>
      <dm-radio value="pro">Pro</dm-radio>
    </dm-radio-group>
  `,
})
class FormHostComponent {
  readonly control = new FormControl<string | null>(null);
}

@Component({
  imports: [DmRadioGroupComponent, DmRadioComponent],
  template: `
    <dm-radio-group [(value)]="value" ariaLabel="Plan">
      <dm-radio value="free">Free</dm-radio>
      <dm-radio value="pro">Pro</dm-radio>
    </dm-radio-group>
  `,
})
class NoNameHostComponent {
  readonly value = signal<string | null>(null);
}

describe('DmRadioGroupComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function group(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('dm-radio-group');
  }

  function radios(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-radio'));
  }

  it('renders with radiogroup semantics and per-item radio roles', () => {
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();

    expect(group(fixture).getAttribute('role')).toBe('radiogroup');
    expect(group(fixture).getAttribute('aria-orientation')).toBe('vertical');
    expect(group(fixture).getAttribute('aria-label')).toBe('Plan');

    const items = radios(fixture);
    expect(items.length).toBe(3);
    for (const item of items) {
      expect(item.getAttribute('role')).toBe('radio');
      expect(item.getAttribute('aria-checked')).toBe('false');
    }

    // With no selection, only the first enabled radio owns the tab stop.
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    expect(items[2].getAttribute('tabindex')).toBe('-1');
  });

  it('works without an explicit name (auto-generated) and still selects on click', () => {
    // `name` used to be required — creating this group with no name would throw.
    const fixture = TestBed.createComponent(NoNameHostComponent);
    fixture.detectChanges();

    radios(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('pro');
  });

  it('selects a value on click and updates aria-checked + tabindex', () => {
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();
    const items = radios(fixture);

    items[1].click();
    fixture.detectChanges();

    expect(items[0].getAttribute('aria-checked')).toBe('false');
    expect(items[1].getAttribute('aria-checked')).toBe('true');
    expect(items[2].getAttribute('aria-checked')).toBe('false');

    // Roving tabindex now follows the selection.
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    expect(items[2].getAttribute('tabindex')).toBe('-1');
  });

  it('supports two-way binding with a signal via [(value)]', () => {
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const items = radios(fixture);

    // Parent → child.
    host.value.set('pro');
    fixture.detectChanges();
    expect(items[1].getAttribute('aria-checked')).toBe('true');

    // Child → parent.
    items[2].click();
    fixture.detectChanges();
    expect(host.value()).toBe('team');
  });

  it('moves focus and selection with ArrowDown / ArrowUp / Home / End', () => {
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();
    const items = radios(fixture);

    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[1]);
    expect(items[1].getAttribute('aria-checked')).toBe('true');

    items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
    expect(items[0].getAttribute('aria-checked')).toBe('true');

    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);
    expect(items[2].getAttribute('aria-checked')).toBe('true');

    items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
    expect(items[0].getAttribute('aria-checked')).toBe('true');
  });

  it('ArrowDown wraps from the last enabled radio to the first', () => {
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();
    const items = radios(fixture);

    items[2].focus();
    items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
  });

  it('does not select when the group is disabled', () => {
    const fixture = TestBed.createComponent(DmRadioGroupComponent);
    fixture.componentRef.setInput('name', 'g');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    // Directly call select on the disabled group: value stays null.
    fixture.componentInstance.select('anything');
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('integrates with reactive forms (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const items = radios(fixture);

    // Form → group.
    host.control.setValue('pro');
    fixture.detectChanges();
    expect(items[1].getAttribute('aria-checked')).toBe('true');

    // Group → form.
    items[0].click();
    fixture.detectChanges();
    expect(host.control.value).toBe('free');

    // Disabling the control propagates via setDisabledState.
    host.control.disable();
    fixture.detectChanges();
    expect(group(fixture).getAttribute('aria-disabled')).toBe('true');
  });

  it('renders defaults from the RADIO_DEFAULTS token when overridden', () => {
    TestBed.overrideProvider(RADIO_DEFAULTS, {
      useValue: { color: 'success', size: 'lg', orientation: 'horizontal' },
    });
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();

    expect(group(fixture).getAttribute('aria-orientation')).toBe('horizontal');
    expect(group(fixture).getAttribute('data-orientation')).toBe('horizontal');

    const items = radios(fixture);
    expect(items[0].getAttribute('data-color')).toBe('success');
    expect(items[0].getAttribute('data-size')).toBe('lg');
  });

  it('exposes the value in a hidden input for plain <form> submission', () => {
    const fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.componentInstance.value.set('pro');
    fixture.detectChanges();

    const hidden = fixture.nativeElement.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.name).toBe('plan');
    expect(hidden.value).toBe('pro');
  });
});
