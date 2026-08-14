import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmDividerComponent } from './divider.component';
import { DIVIDER_DEFAULTS } from './divider.tokens';

@Component({
  imports: [DmDividerComponent],
  template: `<dm-divider labelPlacement="start">OR</dm-divider>`,
})
class LabeledHostComponent {}

describe('DmDividerComponent', () => {
  let fixture: ComponentFixture<DmDividerComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmDividerComponent);
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

  it('renders a horizontal separator by default', () => {
    createComponent();

    expect(host().getAttribute('role')).toBe('separator');
    expect(host().getAttribute('aria-orientation')).toBe('horizontal');
    expect(host().getAttribute('data-orientation')).toBe('horizontal');
    expect(host().getAttribute('data-label-placement')).toBe('center');
  });

  it('renders both line halves as decorative elements', () => {
    createComponent();
    const lines: HTMLElement[] = Array.from(host().querySelectorAll('.dm-divider__line'));

    expect(lines.length).toBe(2);
    expect(lines.every((line) => line.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('keeps the label element empty when nothing is projected', () => {
    createComponent();
    const label = host().querySelector<HTMLElement>('.dm-divider__label');

    expect(label).not.toBeNull();
    expect(label?.textContent).toBe('');
  });

  it('reflects a vertical orientation on ARIA and data attributes', () => {
    createComponent();
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    expect(host().getAttribute('aria-orientation')).toBe('vertical');
    expect(host().getAttribute('data-orientation')).toBe('vertical');
  });

  it('reflects labelPlacement changes as a data attribute', () => {
    createComponent();
    fixture.componentRef.setInput('labelPlacement', 'end');
    fixture.detectChanges();

    expect(host().getAttribute('data-label-placement')).toBe('end');
  });

  it('projects label content into the label element', () => {
    const hostFixture = TestBed.createComponent(LabeledHostComponent);
    hostFixture.detectChanges();
    const label = (hostFixture.nativeElement as HTMLElement).querySelector('.dm-divider__label');

    expect(label?.textContent).toBe('OR');
  });

  it('keeps separator semantics when a label is projected', () => {
    const hostFixture = TestBed.createComponent(LabeledHostComponent);
    hostFixture.detectChanges();
    const divider = (hostFixture.nativeElement as HTMLElement).querySelector('dm-divider');

    expect(divider?.getAttribute('role')).toBe('separator');
    expect(divider?.getAttribute('data-label-placement')).toBe('start');
  });

  it('honors defaults injected via DIVIDER_DEFAULTS', () => {
    TestBed.overrideProvider(DIVIDER_DEFAULTS, {
      useValue: { orientation: 'vertical', labelPlacement: 'end' },
    });
    createComponent();

    expect(host().getAttribute('data-orientation')).toBe('vertical');
    expect(host().getAttribute('aria-orientation')).toBe('vertical');
    expect(host().getAttribute('data-label-placement')).toBe('end');
  });
});
