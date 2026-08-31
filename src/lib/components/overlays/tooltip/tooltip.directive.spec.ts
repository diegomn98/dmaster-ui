import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTooltipDirective } from './tooltip.directive';

@Component({
  imports: [DmTooltipDirective],
  template: '<button dmTooltip="Copy to clipboard" dmTooltipPosition="bottom">Copy</button>',
})
class HostComponent {}

@Component({
  imports: [DmTooltipDirective],
  template: `
    <button
      dmTooltip="Copy to clipboard"
      [dmTooltipShowDelay]="showDelay()"
      [dmTooltipHideDelay]="hideDelay()"
      [dmTooltipDisabled]="disabled()"
    >
      Copy
    </button>
  `,
})
class ConfigurableHostComponent {
  readonly showDelay = signal<number | null>(null);
  readonly hideDelay = signal<number | null>(null);
  readonly disabled = signal(false);
}

describe('DmTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('shows the panel on focus and wires aria-describedby', () => {
    button().dispatchEvent(new Event('focusin', { bubbles: true }));
    fixture.detectChanges();

    const panel = overlayContainer.getContainerElement().querySelector('dm-tooltip-panel');
    expect(panel?.textContent).toContain('Copy to clipboard');
    expect(panel?.getAttribute('role')).toBe('tooltip');
    expect(button().getAttribute('aria-describedby')).toBeTruthy();
  });

  it('hides the panel on blur and removes aria-describedby', () => {
    button().dispatchEvent(new Event('focusin', { bubbles: true }));
    fixture.detectChanges();
    button().dispatchEvent(new Event('focusout', { bubbles: true }));
    fixture.detectChanges();

    expect(overlayContainer.getContainerElement().querySelector('dm-tooltip-panel')).toBeNull();
    expect(button().getAttribute('aria-describedby')).toBeNull();
  });

  describe('per-instance delays & disabled', () => {
    function createConfigurable(): ComponentFixture<ConfigurableHostComponent> {
      const configurable = TestBed.createComponent(ConfigurableHostComponent);
      configurable.detectChanges();
      return configurable;
    }

    function buttonOf(host: ComponentFixture<ConfigurableHostComponent>): HTMLButtonElement {
      return host.nativeElement.querySelector('button');
    }

    function panel(): Element | null {
      return overlayContainer.getContainerElement().querySelector('dm-tooltip-panel');
    }

    it('falls back to the injected default show delay when no per-instance delay is set', () => {
      vi.useFakeTimers();
      try {
        const host = createConfigurable();
        buttonOf(host).dispatchEvent(new Event('mouseenter'));

        vi.advanceTimersByTime(299);
        expect(panel()).toBeNull();

        vi.advanceTimersByTime(1); // TOOLTIP_DEFAULTS.showDelay = 300
        expect(panel()).not.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('a per-instance show delay overrides the injected default on hover', () => {
      vi.useFakeTimers();
      try {
        const host = createConfigurable();
        host.componentInstance.showDelay.set(1000);
        host.detectChanges();
        buttonOf(host).dispatchEvent(new Event('mouseenter'));

        vi.advanceTimersByTime(300); // the global default would have fired by now
        expect(panel()).toBeNull();

        vi.advanceTimersByTime(700);
        expect(panel()).not.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('a per-instance hide delay overrides the injected default on mouseleave', () => {
      vi.useFakeTimers();
      try {
        const host = createConfigurable();
        host.componentInstance.hideDelay.set(500);
        host.detectChanges();

        buttonOf(host).dispatchEvent(new Event('focusin', { bubbles: true }));
        expect(panel()).not.toBeNull();
        buttonOf(host).dispatchEvent(new Event('mouseleave'));

        vi.advanceTimersByTime(100); // the global default would have hidden by now
        expect(panel()).not.toBeNull();

        vi.advanceTimersByTime(400);
        expect(panel()).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not show on focus or hover while disabled', () => {
      vi.useFakeTimers();
      try {
        const host = createConfigurable();
        host.componentInstance.disabled.set(true);
        host.detectChanges();

        buttonOf(host).dispatchEvent(new Event('focusin', { bubbles: true }));
        buttonOf(host).dispatchEvent(new Event('mouseenter'));
        vi.advanceTimersByTime(1000);
        host.detectChanges();

        expect(panel()).toBeNull();
        expect(buttonOf(host).getAttribute('aria-describedby')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('closes an open tooltip and unwires aria-describedby when disabled flips true', () => {
      const host = createConfigurable();
      buttonOf(host).dispatchEvent(new Event('focusin', { bubbles: true }));
      host.detectChanges();
      expect(panel()).not.toBeNull();
      expect(buttonOf(host).getAttribute('aria-describedby')).toBeTruthy();

      host.componentInstance.disabled.set(true);
      host.detectChanges();

      expect(panel()).toBeNull();
      expect(buttonOf(host).getAttribute('aria-describedby')).toBeNull();
    });
  });
});
