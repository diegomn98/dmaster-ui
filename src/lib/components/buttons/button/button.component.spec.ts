import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmButtonComponent } from './button.component';
import { BUTTON_DEFAULTS } from './button.tokens';

describe('DmButtonComponent', () => {
  let fixture: ComponentFixture<DmButtonComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmButtonComponent);
    fixture.detectChanges();
  }

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-button');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders a primary/solid/full/md/idle button of type button by default', () => {
    createComponent();

    expect(button().getAttribute('data-color')).toBe('primary');
    expect(button().getAttribute('data-variant')).toBe('solid');
    expect(button().getAttribute('data-radius')).toBe('full');
    expect(button().getAttribute('data-size')).toBe('md');
    expect(button().getAttribute('data-state')).toBe('idle');
    expect(button().type).toBe('button');
    expect(button().disabled).toBe(false);
  });

  it('reflects color, variant, radius, size and state as data attributes', () => {
    createComponent();
    fixture.componentRef.setInput('color', 'secondary');
    fixture.componentRef.setInput('variant', 'flat');
    fixture.componentRef.setInput('radius', 'full');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('state', 'success');
    fixture.detectChanges();

    expect(button().getAttribute('data-color')).toBe('secondary');
    expect(button().getAttribute('data-variant')).toBe('flat');
    expect(button().getAttribute('data-radius')).toBe('full');
    expect(button().getAttribute('data-size')).toBe('lg');
    expect(button().getAttribute('data-state')).toBe('success');
  });

  it('disables the button and sets aria-busy while loading', () => {
    createComponent();
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
    expect(button().getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('dm-spinner')).toBeTruthy();
  });

  it('emits clicked while interactive and not while loading', () => {
    createComponent();
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => clicks++);

    button().click();
    expect(clicks).toBe(1);

    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();
    button().click();
    expect(clicks).toBe(1);
  });

  it('does not emit clicked when disabled', () => {
    createComponent();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => clicks++);

    button().click();
    expect(clicks).toBe(0);
  });

  it('announces the state labels through the live region', () => {
    createComponent();
    fixture.componentRef.setInput('loadingLabel', 'Saving…');
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();

    const live = fixture.nativeElement.querySelector('.dm-button__live');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toContain('Saving…');

    fixture.componentRef.setInput('successLabel', 'Saved');
    fixture.componentRef.setInput('state', 'success');
    fixture.detectChanges();
    expect(live.textContent).toContain('Saved');
  });

  it('projects its content as the label', () => {
    createComponent();
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dm-button__label')).toBeTruthy();
  });

  it('honors defaults injected via BUTTON_DEFAULTS', () => {
    TestBed.overrideProvider(BUTTON_DEFAULTS, {
      useValue: { color: 'danger', variant: 'flat', size: 'sm', radius: 'lg' },
    });
    createComponent();

    expect(button().getAttribute('data-color')).toBe('danger');
    expect(button().getAttribute('data-variant')).toBe('flat');
    expect(button().getAttribute('data-size')).toBe('sm');
    expect(button().getAttribute('data-radius')).toBe('lg');
  });
});
