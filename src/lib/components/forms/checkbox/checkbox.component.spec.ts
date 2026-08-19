import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmCheckboxComponent } from './checkbox.component';

@Component({
  imports: [DmCheckboxComponent, ReactiveFormsModule],
  template: '<dm-checkbox [formControl]="control">Terms</dm-checkbox>',
})
class FormHostComponent {
  readonly control = new FormControl(false, { nonNullable: true });
}

describe('DmCheckboxComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function nativeInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('.dm-checkbox__input');
  }

  it('renders unchecked by default', () => {
    const fixture = TestBed.createComponent(DmCheckboxComponent);
    fixture.detectChanges();

    expect(nativeInput(fixture).checked).toBe(false);
    expect(fixture.nativeElement.querySelector('.dm-checkbox--checked')).toBeNull();
  });

  it('toggles through the native input and emits checkedChange', () => {
    const fixture = TestBed.createComponent(DmCheckboxComponent);
    fixture.detectChanges();
    const values: boolean[] = [];
    fixture.componentInstance.checked.subscribe((value) => values.push(value));

    nativeInput(fixture).click();
    fixture.detectChanges();

    expect(values).toEqual([true]);
    expect(fixture.nativeElement.querySelector('.dm-checkbox--checked')).toBeTruthy();
  });

  it('shows the indeterminate state via the native property while unchecked', () => {
    const fixture = TestBed.createComponent(DmCheckboxComponent);
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dm-checkbox--indeterminate')).toBeTruthy();
    // Native `indeterminate` property drives the "mixed" announcement — no
    // aria-checked on a native checkbox (that would trip aria-conditional-attr).
    expect(nativeInput(fixture).indeterminate).toBe(true);
    expect(nativeInput(fixture).getAttribute('aria-checked')).toBeNull();

    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dm-checkbox--indeterminate')).toBeNull();
    expect(nativeInput(fixture).indeterminate).toBe(false);
    expect(nativeInput(fixture).getAttribute('aria-checked')).toBeNull();
  });

  it('does not toggle while disabled', () => {
    const fixture = TestBed.createComponent(DmCheckboxComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    nativeInput(fixture).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.checked()).toBe(false);
    expect(nativeInput(fixture).disabled).toBe(true);
  });

  it('integrates with reactive forms (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    host.control.setValue(true);
    fixture.detectChanges();
    expect(nativeInput(fixture).checked).toBe(true);

    nativeInput(fixture).click();
    fixture.detectChanges();
    expect(host.control.value).toBe(false);

    host.control.disable();
    fixture.detectChanges();
    expect(nativeInput(fixture).disabled).toBe(true);
  });
});
