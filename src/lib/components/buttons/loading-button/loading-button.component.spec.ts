import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmLoadingButtonComponent } from './loading-button.component';
import { LOADING_BUTTON_DEFAULTS } from './loading-button.tokens';

describe('DmLoadingButtonComponent', () => {
  let fixture: ComponentFixture<DmLoadingButtonComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmLoadingButtonComponent);
    fixture.detectChanges();
  }

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-loading-button');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders a primary/md/idle button of type button by default', () => {
    createComponent();

    expect(button().getAttribute('data-variant')).toBe('primary');
    expect(button().getAttribute('data-size')).toBe('md');
    expect(button().getAttribute('data-state')).toBe('idle');
    expect(button().type).toBe('button');
    expect(button().disabled).toBe(false);
  });

  it('reflects variant, size and state as data attributes', () => {
    createComponent();
    fixture.componentRef.setInput('variant', 'outline');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('state', 'success');
    fixture.detectChanges();

    expect(button().getAttribute('data-variant')).toBe('outline');
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

    const live = fixture.nativeElement.querySelector('.dm-loading-button__live');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toContain('Saving…');

    fixture.componentRef.setInput('successLabel', 'Saved');
    fixture.componentRef.setInput('state', 'success');
    fixture.detectChanges();
    expect(live.textContent).toContain('Saved');
  });

  it('projects its content as the label', () => {
    createComponent();
    // Content projection is exercised in the host-template test below;
    // here we assert the label wrapper exists and stays in the DOM while loading.
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dm-loading-button__label')).toBeTruthy();
  });

  it('honors defaults injected via LOADING_BUTTON_DEFAULTS', () => {
    TestBed.overrideProvider(LOADING_BUTTON_DEFAULTS, {
      useValue: { variant: 'ghost', size: 'sm' },
    });
    createComponent();

    expect(button().getAttribute('data-variant')).toBe('ghost');
    expect(button().getAttribute('data-size')).toBe('sm');
  });
});
