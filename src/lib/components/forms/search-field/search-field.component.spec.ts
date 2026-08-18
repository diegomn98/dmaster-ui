import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmSearchFieldComponent } from './search-field.component';
import { SEARCH_FIELD_DEFAULTS } from './search-field.tokens';

@Component({
  imports: [DmSearchFieldComponent, ReactiveFormsModule],
  template: '<dm-search-field [formControl]="control" label="Search" />',
})
class FormHostComponent {
  readonly control = new FormControl('', { nonNullable: true });
}

describe('DmSearchFieldComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function control(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('.dm-search-field__control');
  }

  function input(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('.dm-search-field__input');
  }

  function clearBtn(fixture: ComponentFixture<unknown>): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.dm-search-field__clear');
  }

  function type(fixture: ComponentFixture<unknown>, text: string): void {
    const el = input(fixture);
    el.value = text;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('renders a search input with flat/md/md defaults', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.detectChanges();

    expect(input(fixture).type).toBe('search');
    expect(control(fixture).getAttribute('data-variant')).toBe('flat');
    expect(control(fixture).getAttribute('data-size')).toBe('md');
    expect(control(fixture).getAttribute('data-radius')).toBe('md');
  });

  it('reflects color/variant/size/radius inputs on the control', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.componentRef.setInput('color', 'success');
    fixture.componentRef.setInput('variant', 'bordered');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('radius', 'sm');
    fixture.detectChanges();

    const el = control(fixture);
    expect(el.getAttribute('data-color')).toBe('success');
    expect(el.getAttribute('data-variant')).toBe('bordered');
    expect(el.getAttribute('data-size')).toBe('lg');
    expect(el.getAttribute('data-radius')).toBe('sm');
  });

  it('shows the clear button only once there is text', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.detectChanges();
    expect(clearBtn(fixture)).toBeNull();

    type(fixture, 'hello');
    expect(clearBtn(fixture)).not.toBeNull();
  });

  it('clears the value and emits cleared when the × button is clicked', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.detectChanges();
    let cleared = 0;
    fixture.componentInstance.cleared.subscribe(() => cleared++);

    type(fixture, 'hello');
    clearBtn(fixture)!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('');
    expect(clearBtn(fixture)).toBeNull();
    expect(cleared).toBe(1);
  });

  it('clears on Escape and submits on Enter', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.detectChanges();
    const submitted: string[] = [];
    fixture.componentInstance.searchSubmit.subscribe((v) => submitted.push(v));

    type(fixture, 'query');
    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(submitted).toEqual(['query']);

    input(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('');
  });

  it('marks the field invalid when error is set', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();

    expect(control(fixture).hasAttribute('data-invalid')).toBe(true);
    expect(input(fixture).getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.dm-search-field__error').textContent).toContain(
      'Required',
    );
  });

  it('hides the clear button while disabled or read-only', () => {
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.componentRef.setInput('value', 'x');
    fixture.detectChanges();
    expect(clearBtn(fixture)).not.toBeNull();

    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    expect(clearBtn(fixture)).toBeNull();

    fixture.componentRef.setInput('readOnly', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(clearBtn(fixture)).toBeNull();
    expect(input(fixture).disabled).toBe(true);
  });

  it('honors injected defaults', () => {
    TestBed.overrideProvider(SEARCH_FIELD_DEFAULTS, {
      useValue: { color: 'default', variant: 'underlined', size: 'sm', radius: 'full' },
    });
    const fixture = TestBed.createComponent(DmSearchFieldComponent);
    fixture.detectChanges();

    expect(control(fixture).getAttribute('data-variant')).toBe('underlined');
    expect(control(fixture).getAttribute('data-size')).toBe('sm');
    expect(control(fixture).getAttribute('data-radius')).toBe('full');
  });

  it('integrates with reactive forms (write, propagate, disable)', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    host.control.setValue('abc');
    fixture.detectChanges();
    expect(input(fixture).value).toBe('abc');

    type(fixture, 'abcd');
    expect(host.control.value).toBe('abcd');

    host.control.disable();
    fixture.detectChanges();
    expect(input(fixture).disabled).toBe(true);
  });
});
