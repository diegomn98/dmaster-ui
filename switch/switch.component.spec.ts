import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmSwitchComponent } from './switch.component';

@Component({
  imports: [DmSwitchComponent, ReactiveFormsModule],
  template: '<dm-switch [formControl]="control">Notifications</dm-switch>',
})
class FormHostComponent {
  readonly control = new FormControl(false, { nonNullable: true });
}

describe('DmSwitchComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function button(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-switch__control');
  }

  it('renders unchecked md by default with switch semantics', () => {
    const fixture = TestBed.createComponent(DmSwitchComponent);
    fixture.detectChanges();

    expect(button(fixture).getAttribute('role')).toBe('switch');
    expect(button(fixture).getAttribute('aria-checked')).toBe('false');
    expect(button(fixture).getAttribute('data-size')).toBe('md');
  });

  it('reflects the size input as data-size on the control (lg)', () => {
    const fixture = TestBed.createComponent(DmSwitchComponent);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(button(fixture).getAttribute('data-size')).toBe('lg');
  });

  it('reflects the color input as data-color (default primary)', () => {
    const fixture = TestBed.createComponent(DmSwitchComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('data-color')).toBe('primary');

    fixture.componentRef.setInput('color', 'warning');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('data-color')).toBe('warning');
  });

  it('toggles on click and emits checkedChange', () => {
    const fixture = TestBed.createComponent(DmSwitchComponent);
    fixture.detectChanges();
    const values: boolean[] = [];
    fixture.componentInstance.checked.subscribe((value) => values.push(value));

    button(fixture).click();
    fixture.detectChanges();

    expect(button(fixture).getAttribute('aria-checked')).toBe('true');
    expect(values).toEqual([true]);
  });

  it('does not toggle while disabled', () => {
    const fixture = TestBed.createComponent(DmSwitchComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    button(fixture).click();
    fixture.detectChanges();

    expect(button(fixture).getAttribute('aria-checked')).toBe('false');
    expect(button(fixture).disabled).toBe(true);
  });

  it('uses inputId for the internal button so external label[for] works', () => {
    const fixture = TestBed.createComponent(DmSwitchComponent);
    fixture.componentRef.setInput('inputId', 'my-switch');
    fixture.detectChanges();

    expect(button(fixture).id).toBe('my-switch');
  });

  it('integrates with reactive forms (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    host.control.setValue(true);
    fixture.detectChanges();
    expect(button(fixture).getAttribute('aria-checked')).toBe('true');

    button(fixture).click();
    fixture.detectChanges();
    expect(host.control.value).toBe(false);

    host.control.disable();
    fixture.detectChanges();
    expect(button(fixture).disabled).toBe(true);
  });
});
