import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmSpinnerComponent } from './spinner.component';
import { SPINNER_DEFAULTS } from './spinner.tokens';

describe('DmSpinnerComponent', () => {
  let fixture: ComponentFixture<DmSpinnerComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmSpinnerComponent);
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('is decorative by default (aria-hidden, md size)', () => {
    createComponent();

    expect(host().getAttribute('aria-hidden')).toBe('true');
    expect(host().getAttribute('role')).toBeNull();
    expect(host().style.width).toBe('1.5rem');
  });

  it('becomes a status live region when a label is provided', () => {
    createComponent();
    fixture.componentRef.setInput('label', 'Loading');
    fixture.detectChanges();

    expect(host().getAttribute('role')).toBe('status');
    expect(host().getAttribute('aria-label')).toBe('Loading');
    expect(host().getAttribute('aria-hidden')).toBeNull();
  });

  it('maps named sizes and passes custom sizes through', () => {
    createComponent();
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(host().style.width).toBe('2rem');

    fixture.componentRef.setInput('size', 20);
    fixture.detectChanges();
    expect(host().style.width).toBe('20px');

    fixture.componentRef.setInput('size', '1em');
    fixture.detectChanges();
    expect(host().style.width).toBe('1em');
  });

  it('applies the stroke width to both circles', () => {
    createComponent();
    fixture.componentRef.setInput('strokeWidth', 4);
    fixture.detectChanges();

    const circles = host().querySelectorAll('circle');
    expect(circles[0].getAttribute('stroke-width')).toBe('4');
    expect(circles[1].getAttribute('stroke-width')).toBe('4');
  });

  it('honors defaults injected via SPINNER_DEFAULTS', () => {
    TestBed.overrideProvider(SPINNER_DEFAULTS, {
      useValue: { size: 'sm', strokeWidth: 3 },
    });
    createComponent();

    expect(host().style.width).toBe('1rem');
    expect(host().querySelector('circle')?.getAttribute('stroke-width')).toBe('3');
  });
});
