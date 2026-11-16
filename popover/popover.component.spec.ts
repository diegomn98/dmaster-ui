import { CdkTrapFocus } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  Component,
  getDebugNode,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmPopoverComponent } from './popover.component';
import { DmPopoverTriggerDirective } from './popover.directive';
import { POPOVER_DEFAULTS } from './popover.tokens';
import { DmPopoverPlacement } from './popover.types';

@Component({
  imports: [DmPopoverComponent, DmPopoverTriggerDirective],
  template: `
    <button [dmPopoverTrigger]="pop">Open</button>
    <dm-popover
      #pop
      [placement]="placement()"
      [showArrow]="showArrow()"
      [trapFocus]="trap()"
      ariaLabel="Details"
      (opened)="openedCount = openedCount + 1"
      (closed)="closedCount = closedCount + 1"
    >
      <h3>Title</h3>
      <button class="inside">Action</button>
    </dm-popover>
  `,
})
class HostComponent {
  readonly placement = signal<DmPopoverPlacement>('bottom');
  readonly showArrow = signal(true);
  readonly trap = signal(false);
  openedCount = 0;
  closedCount = 0;
}

describe('DmPopover', () => {
  let overlayContainer: OverlayContainer | undefined;
  const mounted: HTMLElement[] = [];

  function mount<T>(fixture: ComponentFixture<T>): ComponentFixture<T> {
    document.body.appendChild(fixture.nativeElement);
    mounted.push(fixture.nativeElement);
    fixture.detectChanges();
    return fixture;
  }

  function create(): ComponentFixture<HostComponent> {
    return mount(TestBed.createComponent(HostComponent));
  }

  function trigger(fixture: ComponentFixture<HostComponent>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  function panel(): HTMLElement | null {
    // Injected lazily so tests can `overrideProvider` before the TestBed is
    // instantiated (the first inject freezes the module).
    overlayContainer ??= TestBed.inject(OverlayContainer);
    return overlayContainer.getContainerElement().querySelector('.dm-popover__panel');
  }

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    overlayContainer?.ngOnDestroy();
    overlayContainer = undefined;
    while (mounted.length) {
      mounted.pop()?.remove();
    }
  });

  it('opens the panel on trigger click', () => {
    const fixture = create();
    expect(panel()).toBeNull();

    trigger(fixture).click();
    tick();

    expect(panel()).not.toBeNull();
    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(panel()?.getAttribute('aria-modal')).toBe('false');
  });

  it('toggles closed on a second trigger click', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();
    expect(panel()).not.toBeNull();

    trigger(fixture).click();
    tick();
    expect(panel()).toBeNull();
  });

  it('syncs aria-expanded on the trigger', () => {
    const fixture = create();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');

    trigger(fixture).click();
    tick();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');

    trigger(fixture).click();
    tick();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('wires aria-haspopup and aria-controls to the panel id', () => {
    const fixture = create();
    expect(trigger(fixture).getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger(fixture).getAttribute('aria-controls')).toBeNull();

    trigger(fixture).click();
    tick();

    const controls = trigger(fixture).getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(panel()?.id).toBe(controls);
  });

  it('closes on Escape and returns focus to the trigger', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();

    panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    tick();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger(fixture));
  });

  it('closes on outside click', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();
    expect(panel()).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();

    expect(panel()).toBeNull();
  });

  it('emits opened and closed outputs', () => {
    const fixture = create();
    const host = fixture.componentInstance;

    trigger(fixture).click();
    tick();
    expect(host.openedCount).toBe(1);
    expect(host.closedCount).toBe(0);

    trigger(fixture).click();
    tick();
    expect(host.closedCount).toBe(1);
  });

  it('reflects the placement side as data-placement on the panel', () => {
    const fixture = create();
    fixture.componentInstance.placement.set('top');
    fixture.detectChanges();

    trigger(fixture).click();
    tick();

    expect(panel()?.getAttribute('data-placement')).toBe('top');
  });

  it('renders the arrow by default and hides it when showArrow is false', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();
    expect(panel()?.querySelector('.dm-popover__arrow')).not.toBeNull();

    // close, disable the arrow, reopen
    trigger(fixture).click();
    tick();
    fixture.componentInstance.showArrow.set(false);
    fixture.detectChanges();
    trigger(fixture).click();
    tick();

    expect(panel()?.querySelector('.dm-popover__arrow')).toBeNull();
  });

  it('applies cdkTrapFocus only when trapFocus is true', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();

    let trap = getDebugNode(panel()!)?.injector.get(CdkTrapFocus);
    expect(trap?.enabled).toBe(false);

    fixture.componentInstance.trap.set(true);
    fixture.detectChanges();
    tick();

    trap = getDebugNode(panel()!)?.injector.get(CdkTrapFocus);
    expect(trap?.enabled).toBe(true);
  });

  it('renders projected content inside the panel', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();

    expect(panel()?.querySelector('h3')?.textContent).toContain('Title');
    expect(panel()?.querySelector('button.inside')).not.toBeNull();
  });

  it('focuses the panel when it opens', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();

    expect(document.activeElement).toBe(panel());
  });

  it('exposes the ariaLabel on the panel', () => {
    const fixture = create();
    trigger(fixture).click();
    tick();

    expect(panel()?.getAttribute('aria-label')).toBe('Details');
  });

  it('honors provider defaults for placement and showArrow', () => {
    TestBed.overrideProvider(POPOVER_DEFAULTS, {
      useValue: { placement: 'right', showArrow: false, offset: 8 },
    });

    @Component({
      imports: [DmPopoverComponent, DmPopoverTriggerDirective],
      template: `
        <button [dmPopoverTrigger]="pop">Open</button>
        <dm-popover #pop>Content</dm-popover>
      `,
    })
    class DefaultsHost {}

    const fixture = mount(TestBed.createComponent(DefaultsHost));

    fixture.nativeElement.querySelector('button').click();
    tick();

    expect(panel()?.getAttribute('data-placement')).toBe('right');
    expect(panel()?.querySelector('.dm-popover__arrow')).toBeNull();
  });

  describe('two-way [(open)] model', () => {
    @Component({
      imports: [DmPopoverComponent, DmPopoverTriggerDirective],
      template: `
        <button [dmPopoverTrigger]="pop">Open</button>
        <dm-popover
          #pop
          [(open)]="open"
          (opened)="openedCount = openedCount + 1"
          (closed)="closedCount = closedCount + 1"
        >
          Content
        </dm-popover>
      `,
    })
    class OpenModelHost {
      readonly open = signal(false);
      openedCount = 0;
      closedCount = 0;
    }

    it('opens and closes the overlay when the bound value changes', () => {
      const fixture = mount(TestBed.createComponent(OpenModelHost));
      const host = fixture.componentInstance;
      expect(panel()).toBeNull();

      host.open.set(true);
      fixture.detectChanges();
      tick();
      expect(panel()).not.toBeNull();

      host.open.set(false);
      fixture.detectChanges();
      tick();
      expect(panel()).toBeNull();
    });

    it('reflects trigger clicks back into the bound value', () => {
      const fixture = mount(TestBed.createComponent(OpenModelHost));
      const host = fixture.componentInstance;

      fixture.nativeElement.querySelector('button').click();
      tick();
      expect(host.open()).toBe(true);

      fixture.nativeElement.querySelector('button').click();
      tick();
      expect(host.open()).toBe(false);
    });

    it('emits opened/closed once per transition, external drives included', () => {
      const fixture = mount(TestBed.createComponent(OpenModelHost));
      const host = fixture.componentInstance;

      host.open.set(true);
      fixture.detectChanges();
      tick();
      expect(host.openedCount).toBe(1);
      expect(host.closedCount).toBe(0);

      host.open.set(false);
      fixture.detectChanges();
      tick();
      expect(host.openedCount).toBe(1);
      expect(host.closedCount).toBe(1);
    });
  });
});
