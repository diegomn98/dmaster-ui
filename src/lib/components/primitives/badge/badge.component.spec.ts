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

  it('renders neutral/subtle/md without dot by default', () => {
    createComponent();

    expect(host().getAttribute('data-variant')).toBe('neutral');
    expect(host().getAttribute('data-appearance')).toBe('subtle');
    expect(host().getAttribute('data-size')).toBe('md');
    expect(host().hasAttribute('data-pill')).toBe(false);
    expect(host().querySelector('.dm-badge__dot')).toBeNull();
  });

  it('reflects variant, appearance, size and pill', () => {
    createComponent();
    fixture.componentRef.setInput('variant', 'success');
    fixture.componentRef.setInput('appearance', 'solid');
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('pill', true);
    fixture.detectChanges();

    expect(host().getAttribute('data-variant')).toBe('success');
    expect(host().getAttribute('data-appearance')).toBe('solid');
    expect(host().getAttribute('data-size')).toBe('sm');
    expect(host().hasAttribute('data-pill')).toBe(true);
  });

  it('shows the status dot when requested', () => {
    createComponent();
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();

    expect(host().querySelector('.dm-badge__dot')).toBeTruthy();
  });

  it('honors defaults injected via BADGE_DEFAULTS', () => {
    TestBed.overrideProvider(BADGE_DEFAULTS, {
      useValue: { variant: 'danger', appearance: 'outline', size: 'sm' },
    });
    createComponent();

    expect(host().getAttribute('data-variant')).toBe('danger');
    expect(host().getAttribute('data-appearance')).toBe('outline');
    expect(host().getAttribute('data-size')).toBe('sm');
  });
});
