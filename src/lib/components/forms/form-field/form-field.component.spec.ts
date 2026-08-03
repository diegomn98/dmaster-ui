import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmFormFieldComponent } from './form-field.component';
import { DmInputDirective } from './input.directive';

@Component({
  imports: [DmFormFieldComponent, DmInputDirective],
  template: `
    <dm-form-field label="Email" [hint]="hint()" [error]="error()" [required]="required()">
      <input dmInput type="email" />
    </dm-form-field>
  `,
})
class HostComponent {
  readonly hint = signal('');
  readonly error = signal('');
  readonly required = signal(false);
}

describe('DmFormFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function label(): HTMLLabelElement {
    return fixture.nativeElement.querySelector('.dm-form-field__label');
  }

  it('applies the dm-input class and wires label[for] to the input id', () => {
    expect(input().classList.contains('dm-input')).toBe(true);
    expect(input().id).toBeTruthy();
    expect(label().getAttribute('for')).toBe(input().id);
  });

  it('links the hint via aria-describedby', () => {
    fixture.componentInstance.hint.set('We never share it');
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector('.dm-form-field__hint');
    expect(hint?.textContent).toContain('We never share it');
    expect(input().getAttribute('aria-describedby')).toBe(hint.id);
    expect(input().getAttribute('aria-invalid')).toBe('false');
  });

  it('switches to the error state: role=alert, aria-invalid and describedby', () => {
    fixture.componentInstance.hint.set('Hint');
    fixture.componentInstance.error.set('Invalid email');
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.dm-form-field__error');
    expect(error?.getAttribute('role')).toBe('alert');
    expect(fixture.nativeElement.querySelector('.dm-form-field__hint')).toBeNull();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().getAttribute('aria-describedby')).toBe(error.id);
  });

  it('shows the required marker', () => {
    fixture.componentInstance.required.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dm-form-field__required')).toBeTruthy();
  });
});
