import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmProgressComponent } from './progress.component';
import { PROGRESS_DEFAULTS } from './progress.tokens';

describe('DmProgressComponent', () => {
  let fixture: ComponentFixture<DmProgressComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmProgressComponent);
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  function fill(): HTMLElement | null {
    return host().querySelector<HTMLElement>('.dm-progress__fill');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders a primary/md indeterminate bar by default', () => {
    createComponent();

    expect(host().getAttribute('data-color')).toBe('primary');
    expect(host().getAttribute('data-size')).toBe('md');
    expect(host().hasAttribute('data-indeterminate')).toBe(true);
    expect(host().querySelector('.dm-progress__track')).not.toBeNull();
    expect(fill()).not.toBeNull();
  });

  it('exposes progressbar semantics with min/max/now when determinate', () => {
    createComponent();
    fixture.componentRef.setInput('value', 30);
    fixture.detectChanges();

    expect(host().getAttribute('role')).toBe('progressbar');
    expect(host().getAttribute('aria-valuemin')).toBe('0');
    expect(host().getAttribute('aria-valuemax')).toBe('100');
    expect(host().getAttribute('aria-valuenow')).toBe('30');
  });

  it('omits aria-valuenow and aria-valuetext while indeterminate', () => {
    createComponent();

    expect(host().hasAttribute('aria-valuenow')).toBe(false);
    expect(host().hasAttribute('aria-valuetext')).toBe(false);
    expect(host().getAttribute('aria-valuemin')).toBe('0');
    expect(host().getAttribute('aria-valuemax')).toBe('100');
  });

  it('drives the fill width from value and a custom max', () => {
    createComponent();
    fixture.componentRef.setInput('value', 25);
    fixture.componentRef.setInput('max', 50);
    fixture.detectChanges();

    expect(host().getAttribute('aria-valuemax')).toBe('50');
    expect(host().getAttribute('aria-valuenow')).toBe('25');
    expect(fill()?.style.width).toBe('50%');
  });

  it('leaves the fill width to CSS while indeterminate', () => {
    createComponent();

    expect(fill()?.style.width).toBe('');
  });

  it('clamps the value to the [0, max] range', () => {
    createComponent();
    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();

    expect(host().getAttribute('aria-valuenow')).toBe('100');
    expect(fill()?.style.width).toBe('100%');

    fixture.componentRef.setInput('value', -20);
    fixture.detectChanges();

    expect(host().getAttribute('aria-valuenow')).toBe('0');
    expect(fill()?.style.width).toBe('0%');
  });

  it('renders no label row by default', () => {
    createComponent();

    expect(host().querySelector('.dm-progress__labels')).toBeNull();
  });

  it('renders the label above the bar', () => {
    createComponent();
    fixture.componentRef.setInput('label', 'Uploading assets');
    fixture.detectChanges();

    expect(host().querySelector('.dm-progress__label')?.textContent).toBe('Uploading assets');
  });

  it('shows the rounded percentage when showValueLabel is on', () => {
    createComponent();
    fixture.componentRef.setInput('value', 73);
    fixture.componentRef.setInput('showValueLabel', true);
    fixture.detectChanges();

    expect(host().querySelector('.dm-progress__value')?.textContent).toBe('73%');
  });

  it('hides the value label while indeterminate', () => {
    createComponent();
    fixture.componentRef.setInput('showValueLabel', true);
    fixture.detectChanges();

    expect(host().querySelector('.dm-progress__value')).toBeNull();
  });

  it('applies a custom formatValue to the value label and aria-valuetext', () => {
    createComponent();
    fixture.componentRef.setInput('value', 48);
    fixture.componentRef.setInput('max', 64);
    fixture.componentRef.setInput('showValueLabel', true);
    fixture.componentRef.setInput('formatValue', (value: number, max: number) => {
      return `${value} GB of ${max} GB`;
    });
    fixture.detectChanges();

    expect(host().querySelector('.dm-progress__value')?.textContent).toBe('48 GB of 64 GB');
    expect(host().getAttribute('aria-valuetext')).toBe('48 GB of 64 GB');
  });

  it('mirrors the default format in aria-valuetext for determinate bars', () => {
    createComponent();
    fixture.componentRef.setInput('value', 73);
    fixture.detectChanges();

    expect(host().getAttribute('aria-valuetext')).toBe('73%');
  });

  it('falls back to label as the accessible name and lets ariaLabel win', () => {
    createComponent();

    expect(host().hasAttribute('aria-label')).toBe(false);

    fixture.componentRef.setInput('label', 'Uploading');
    fixture.detectChanges();
    expect(host().getAttribute('aria-label')).toBe('Uploading');

    fixture.componentRef.setInput('ariaLabel', 'Upload progress');
    fixture.detectChanges();
    expect(host().getAttribute('aria-label')).toBe('Upload progress');
  });

  it('reflects color, size and striped as data attributes', () => {
    createComponent();
    fixture.componentRef.setInput('color', 'danger');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('striped', true);
    fixture.detectChanges();

    expect(host().getAttribute('data-color')).toBe('danger');
    expect(host().getAttribute('data-size')).toBe('lg');
    expect(host().hasAttribute('data-striped')).toBe(true);

    fixture.componentRef.setInput('striped', false);
    fixture.detectChanges();
    expect(host().hasAttribute('data-striped')).toBe(false);
  });

  it('honors defaults injected via PROGRESS_DEFAULTS', () => {
    TestBed.overrideProvider(PROGRESS_DEFAULTS, {
      useValue: { color: 'success', size: 'lg' },
    });
    createComponent();

    expect(host().getAttribute('data-color')).toBe('success');
    expect(host().getAttribute('data-size')).toBe('lg');
  });
});
