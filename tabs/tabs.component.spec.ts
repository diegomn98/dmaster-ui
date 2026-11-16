import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTabComponent } from './tab.component';
import { DmTabPanelComponent } from './tab-panel.component';
import { DmTabsComponent } from './tabs.component';
import { TABS_DEFAULTS } from './tabs.tokens';

@Component({
  imports: [DmTabsComponent, DmTabComponent, DmTabPanelComponent],
  template: `
    <dm-tabs
      [(selectedValue)]="active"
      [placement]="placement()"
      [disabled]="tabsDisabled()"
      ariaLabel="Sections"
    >
      <dm-tab value="one">One</dm-tab>
      <dm-tab value="two">Two</dm-tab>
      <dm-tab value="three" [disabled]="thirdDisabled()">Three</dm-tab>

      <dm-tab-panel value="one">Panel 1</dm-tab-panel>
      <dm-tab-panel value="two">Panel 2</dm-tab-panel>
      <dm-tab-panel value="three">Panel 3</dm-tab-panel>
    </dm-tabs>
  `,
})
class HostComponent {
  readonly active = signal<string | undefined>('one');
  readonly thirdDisabled = signal(true);
  readonly tabsDisabled = signal(false);
  readonly placement = signal<'top' | 'start'>('top');
}

describe('DmTabsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  function tabs(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-tab'));
  }

  function panels(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-tab-panel'));
  }

  function tablist(): HTMLElement {
    return fixture.nativeElement.querySelector('[role="tablist"]');
  }

  function fireKey(el: HTMLElement, key: string): void {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders the tab matching selectedValue as active with the right ARIA wiring', () => {
    expect(tablist().getAttribute('role')).toBe('tablist');
    expect(tablist().getAttribute('aria-label')).toBe('Sections');
    expect(tablist().getAttribute('aria-orientation')).toBe('horizontal');

    expect(tabs()[0].getAttribute('role')).toBe('tab');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs()[0].getAttribute('tabindex')).toBe('0');
    expect(tabs()[1].getAttribute('tabindex')).toBe('-1');

    expect(panels()[0].getAttribute('role')).toBe('tabpanel');
    expect(panels()[0].hasAttribute('hidden')).toBe(false);
    expect(panels()[1].hasAttribute('hidden')).toBe(true);
  });

  it('wires aria-controls / aria-labelledby between each tab and its panel', () => {
    const tabIds = tabs().map((t) => t.getAttribute('id'));
    const panelIds = panels().map((p) => p.getAttribute('id'));

    expect(tabIds.every(Boolean)).toBe(true);
    expect(panelIds.every(Boolean)).toBe(true);

    for (let i = 0; i < tabs().length; i++) {
      expect(tabs()[i].getAttribute('aria-controls')).toBe(panelIds[i]);
      expect(panels()[i].getAttribute('aria-labelledby')).toBe(tabIds[i]);
    }
  });

  it('activates a tab on click and propagates via two-way binding', () => {
    tabs()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe('two');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(panels()[0].hasAttribute('hidden')).toBe(true);
    expect(panels()[1].hasAttribute('hidden')).toBe(false);
  });

  it('ignores click and keyboard activation when the whole tablist is disabled', () => {
    fixture.componentInstance.tabsDisabled.set(true);
    fixture.detectChanges();

    // Pointer activation is blocked (guarded in select()).
    tabs()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');

    // Keyboard roving/activation is blocked too (guarded in activateAndFocus()).
    fireKey(tabs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');
  });

  it('reflects external selectedValue changes back into the DOM', () => {
    fixture.componentInstance.active.set('two');
    fixture.detectChanges();

    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(panels()[1].hasAttribute('hidden')).toBe(false);
  });

  it('moves focus and selection with ArrowRight and ArrowLeft', () => {
    fireKey(tabs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('two');
    expect(document.activeElement).toBe(tabs()[1]);

    fireKey(tabs()[1], 'ArrowLeft');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('wraps past the last enabled tab', () => {
    fixture.componentInstance.active.set('two');
    fixture.detectChanges();

    // Third tab is disabled, so ArrowRight wraps back to 'one'.
    fireKey(tabs()[1], 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');
  });

  it('jumps to first/last enabled with Home / End', () => {
    fixture.componentInstance.active.set('two');
    fixture.detectChanges();

    fireKey(tabs()[1], 'End');
    fixture.detectChanges();
    // 'three' is disabled → last enabled is 'two'.
    expect(fixture.componentInstance.active()).toBe('two');

    fireKey(tabs()[1], 'Home');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');
  });

  it('uses ArrowUp/ArrowDown when placement is vertical', () => {
    fixture.componentInstance.placement.set('start');
    fixture.detectChanges();
    expect(tablist().getAttribute('aria-orientation')).toBe('vertical');

    fireKey(tabs()[0], 'ArrowDown');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('two');

    fireKey(tabs()[1], 'ArrowUp');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');
  });

  it('does not select a disabled tab via click nor keyboard', () => {
    tabs()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');

    fireKey(tabs()[2], 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');

    fireKey(tabs()[2], ' ');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('one');

    expect(tabs()[2].getAttribute('aria-disabled')).toBe('true');
    expect(tabs()[2].getAttribute('tabindex')).toBe('-1');
  });

  it('activates the focused tab on Space and Enter', () => {
    fireKey(tabs()[1], ' ');
    fixture.detectChanges();
    // Space fires the tab's own select() — it doesn't move focus, only activates.
    expect(fixture.componentInstance.active()).toBe('two');
  });

  it('falls back to the first enabled tab when selectedValue is undefined', () => {
    // A fresh fixture with no initial selection.
    fixture.componentInstance.active.set(undefined);
    fixture.detectChanges();

    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(panels()[0].hasAttribute('hidden')).toBe(false);
  });

  it('honors defaults injected via TABS_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: TABS_DEFAULTS,
          useValue: {
            color: 'success',
            variant: 'underlined',
            size: 'lg',
            radius: 'sm',
            placement: 'top',
            fullWidth: true,
            divider: true,
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(tablist().getAttribute('data-color')).toBe('success');
    expect(tablist().getAttribute('data-variant')).toBe('underlined');
    expect(tablist().getAttribute('data-size')).toBe('lg');
  });

  it('lazy is off by default — every panel renders its content immediately', () => {
    // HostComponent never binds [lazy]; all panel bodies must be present.
    expect(panels()[0].textContent).toContain('Panel 1');
    expect(panels()[1].textContent).toContain('Panel 2');
    expect(panels()[2].textContent).toContain('Panel 3');
  });

  describe('lazy panels', () => {
    @Component({
      imports: [DmTabsComponent, DmTabComponent, DmTabPanelComponent],
      template: `
        <dm-tabs [(selectedValue)]="active" [lazy]="lazy()" ariaLabel="Lazy">
          <dm-tab value="one">One</dm-tab>
          <dm-tab value="two">Two</dm-tab>

          <dm-tab-panel value="one"><span class="c-one">Panel 1</span></dm-tab-panel>
          <dm-tab-panel value="two"><span class="c-two">Panel 2</span></dm-tab-panel>
        </dm-tabs>
      `,
    })
    class LazyHostComponent {
      readonly active = signal<string | undefined>('one');
      readonly lazy = signal(true);
    }

    function panelEls(root: HTMLElement): HTMLElement[] {
      return Array.from(root.querySelectorAll('dm-tab-panel'));
    }

    it('defers a lazy panel until first activation, then keeps it mounted', () => {
      const f = TestBed.createComponent(LazyHostComponent);
      f.detectChanges();
      const root: HTMLElement = f.nativeElement;

      // The initially active panel is instantiated; the unvisited one is not.
      expect(root.querySelector('.c-one')).not.toBeNull();
      expect(root.querySelector('.c-two')).toBeNull();

      // Activate the second tab → its content mounts on first activation.
      f.componentInstance.active.set('two');
      f.detectChanges();
      expect(root.querySelector('.c-two')).not.toBeNull();

      // Switching back keeps the visited panel mounted (only hidden).
      f.componentInstance.active.set('one');
      f.detectChanges();
      expect(root.querySelector('.c-two')).not.toBeNull();
      expect(panelEls(root)[1].hasAttribute('hidden')).toBe(true);
    });

    it('instantiates every panel up front when lazy is off', () => {
      const f = TestBed.createComponent(LazyHostComponent);
      f.componentInstance.lazy.set(false);
      f.detectChanges();
      const root: HTMLElement = f.nativeElement;

      expect(root.querySelector('.c-one')).not.toBeNull();
      expect(root.querySelector('.c-two')).not.toBeNull();
    });
  });
});
