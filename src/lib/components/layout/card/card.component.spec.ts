import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmCardComponent } from './card.component';
import { CARD_DEFAULTS } from './card.tokens';

describe('DmCardComponent', () => {
  let fixture: ComponentFixture<DmCardComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmCardComponent);
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

  it('renders elevated/md and non-interactive by default', () => {
    createComponent();

    expect(host().getAttribute('data-appearance')).toBe('elevated');
    expect(host().getAttribute('data-padding')).toBe('md');
    expect(host().hasAttribute('data-interactive')).toBe(false);
  });

  it('reflects appearance, padding and interactive', () => {
    createComponent();
    fixture.componentRef.setInput('appearance', 'flat');
    fixture.componentRef.setInput('padding', 'none');
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();

    expect(host().getAttribute('data-appearance')).toBe('flat');
    expect(host().getAttribute('data-padding')).toBe('none');
    expect(host().hasAttribute('data-interactive')).toBe(true);
  });

  it('honors defaults injected via CARD_DEFAULTS', () => {
    TestBed.overrideProvider(CARD_DEFAULTS, {
      useValue: { appearance: 'outlined', padding: 'lg' },
    });
    createComponent();

    expect(host().getAttribute('data-appearance')).toBe('outlined');
    expect(host().getAttribute('data-padding')).toBe('lg');
  });
});
