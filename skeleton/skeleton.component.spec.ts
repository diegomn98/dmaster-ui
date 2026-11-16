import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmSkeletonComponent } from './skeleton.component';
import { SKELETON_DEFAULTS } from './skeleton.tokens';

describe('DmSkeletonComponent', () => {
  let fixture: ComponentFixture<DmSkeletonComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmSkeletonComponent);
    fixture.detectChanges();
  }

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-skeleton__item'));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders a single text/pulse item by default', () => {
    createComponent();

    expect(items().length).toBe(1);
    expect(items()[0].getAttribute('data-variant')).toBe('text');
    expect(items()[0].getAttribute('data-animation')).toBe('pulse');
  });

  it('exposes loading semantics for assistive technology', () => {
    createComponent();
    const host: HTMLElement = fixture.nativeElement;

    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.getAttribute('aria-live')).toBe('polite');
  });

  it('renders `count` items', () => {
    createComponent();
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();

    expect(items().length).toBe(3);
  });

  it('never renders less than one item', () => {
    createComponent();
    fixture.componentRef.setInput('count', 0);
    fixture.detectChanges();

    expect(items().length).toBe(1);
  });

  it('treats numeric sizes as pixels and passes strings through', () => {
    createComponent();
    fixture.componentRef.setInput('width', 120);
    fixture.componentRef.setInput('height', 'clamp(2rem, 10vw, 4rem)');
    fixture.detectChanges();

    expect(items()[0].style.width).toBe('120px');
    expect(items()[0].style.height).toBe('clamp(2rem, 10vw, 4rem)');
  });

  it('sets no inline size by default so CSS drives the responsive sizing', () => {
    createComponent();

    expect(items()[0].style.width).toBe('');
    expect(items()[0].style.height).toBe('');
  });

  it('reflects variant, animation and rounded as data attributes', () => {
    createComponent();
    fixture.componentRef.setInput('variant', 'rounded');
    fixture.componentRef.setInput('animation', 'wave');
    fixture.componentRef.setInput('rounded', 'lg');
    fixture.detectChanges();

    const item = items()[0];
    expect(item.getAttribute('data-variant')).toBe('rounded');
    expect(item.getAttribute('data-animation')).toBe('wave');
    expect(item.getAttribute('data-rounded')).toBe('lg');
  });

  it('honors defaults injected via SKELETON_DEFAULTS', () => {
    TestBed.overrideProvider(SKELETON_DEFAULTS, {
      useValue: { variant: 'circular', animation: 'none', rounded: 'full', count: 2 },
    });
    createComponent();

    expect(items().length).toBe(2);
    expect(items()[0].getAttribute('data-variant')).toBe('circular');
    expect(items()[0].getAttribute('data-animation')).toBe('none');
  });
});
