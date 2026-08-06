import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmBadgeComponent } from './badge.component';
import { BADGE_DEFAULTS } from './badge.tokens';

describe('DmBadgeComponent', () => {
  let fixture: ComponentFixture<DmBadgeComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmBadgeComponent);
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

  it('renders default/flat/md/full without a dot by default', () => {
    createComponent();

    expect(host().getAttribute('data-color')).toBe('default');
    expect(host().getAttribute('data-variant')).toBe('flat');
    expect(host().getAttribute('data-size')).toBe('md');
    expect(host().getAttribute('data-radius')).toBe('full');
    expect(host().querySelector('.dm-badge__dot')).toBeNull();
  });

  it('reflects color, variant, size and radius', () => {
    createComponent();
    fixture.componentRef.setInput('color', 'success');
    fixture.componentRef.setInput('variant', 'solid');
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('radius', 'md');
    fixture.detectChanges();

    expect(host().getAttribute('data-color')).toBe('success');
    expect(host().getAttribute('data-variant')).toBe('solid');
    expect(host().getAttribute('data-size')).toBe('sm');
    expect(host().getAttribute('data-radius')).toBe('md');
  });

  it('shows the leading dot only for the dot variant', () => {
    createComponent();
    expect(host().querySelector('.dm-badge__dot')).toBeNull();

    fixture.componentRef.setInput('variant', 'dot');
    fixture.detectChanges();
    expect(host().querySelector('.dm-badge__dot')).toBeTruthy();
  });

  it('honors defaults injected via BADGE_DEFAULTS', () => {
    TestBed.overrideProvider(BADGE_DEFAULTS, {
      useValue: { color: 'danger', variant: 'bordered', size: 'sm', radius: 'md' },
    });
    createComponent();

    expect(host().getAttribute('data-color')).toBe('danger');
    expect(host().getAttribute('data-variant')).toBe('bordered');
    expect(host().getAttribute('data-size')).toBe('sm');
  });
});
