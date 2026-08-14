import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  Component,
  inject,
  provideZonelessChangeDetection,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DmDrawerService } from './drawer.service';
import { DRAWER_DEFAULTS, provideDrawerDefaults } from './drawer.tokens';

@Component({
  template: '<p class="content">Hello {{ data.name }}</p>',
})
class TestDrawerComponent {
  protected readonly data = inject<{ name: string }>(DIALOG_DATA);
  readonly ref = inject(DialogRef);
}

@Component({
  template: '<ng-template #tpl><p class="tpl-content">From template</p></ng-template>',
})
class TemplateHostComponent {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

describe('DmDrawerService', () => {
  let service: DmDrawerService;
  let overlayContainer: OverlayContainer;

  function setup(providers: unknown[] = []): void {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...(providers as [])],
    });
    service = TestBed.inject(DmDrawerService);
    overlayContainer = TestBed.inject(OverlayContainer);
  }

  afterEach(() => {
    overlayContainer?.ngOnDestroy();
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function containerEl(): HTMLElement {
    return overlayContainer.getContainerElement();
  }

  function panel(): HTMLElement | null {
    return containerEl().querySelector('.dm-drawer-panel');
  }

  // The CDK overlay keyboard dispatcher listens on document.body and the CDK
  // dialog matches Escape by keyCode (27), which the KeyboardEvent constructor
  // does not set from `key` alone.
  function dispatchEscape(): void {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    Object.defineProperty(event, 'keyCode', { get: () => 27 });
    document.body.dispatchEvent(event);
  }

  it('opens a component with its data injected via DIALOG_DATA', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'Diego' } });
    tick();

    expect(containerEl().querySelector('.content')?.textContent).toContain('Hello Diego');
  });

  it('opens a TemplateRef', () => {
    setup();
    const host = TestBed.createComponent(TemplateHostComponent);
    host.detectChanges();

    service.open(host.componentInstance.tpl(), { data: {} });
    tick();

    expect(containerEl().querySelector('.tpl-content')?.textContent).toContain('From template');
  });

  it('closes with a result that resolves through DialogRef.closed', () => {
    setup();
    const ref = service.open<string, { name: string }, TestDrawerComponent>(TestDrawerComponent, {
      data: { name: 'Diego' },
    });
    tick();

    let result: string | undefined;
    ref.closed.subscribe((value) => (result = value));
    ref.close('saved');
    tick();

    expect(result).toBe('saved');
    expect(containerEl().querySelector('.content')).toBeNull();
  });

  it('defaults to placement right + size md and stamps those panel classes', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' } });
    tick();

    expect(panel()?.classList.contains('dm-drawer-panel--right')).toBe(true);
    expect(panel()?.classList.contains('dm-drawer-panel--md')).toBe(true);
  });

  it('stamps the requested placement and size classes', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' }, placement: 'left', size: 'lg' });
    tick();

    expect(panel()?.classList.contains('dm-drawer-panel--left')).toBe(true);
    expect(panel()?.classList.contains('dm-drawer-panel--lg')).toBe(true);
    expect(panel()?.classList.contains('dm-drawer-panel--right')).toBe(false);
  });

  it('supports the full size for every placement', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' }, placement: 'bottom', size: 'full' });
    tick();

    expect(panel()?.classList.contains('dm-drawer-panel--bottom')).toBe(true);
    expect(panel()?.classList.contains('dm-drawer-panel--full')).toBe(true);
  });

  it('renders the backdrop by default and closes on backdrop click', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' } });
    tick();

    const backdrop = containerEl().querySelector<HTMLElement>('.dm-drawer-backdrop');
    expect(backdrop).toBeTruthy();

    backdrop!.click();
    tick();

    expect(panel()).toBeNull();
  });

  it('does not render a backdrop when backdrop is false', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' }, backdrop: false });
    tick();

    expect(containerEl().querySelector('.dm-drawer-backdrop')).toBeNull();
    expect(panel()).toBeTruthy();
  });

  it('keeps the drawer open on backdrop click when disableClose is set', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' }, disableClose: true });
    tick();

    const backdrop = containerEl().querySelector<HTMLElement>('.dm-drawer-backdrop');
    backdrop!.click();
    tick();

    expect(panel()).toBeTruthy();
  });

  it('closes on Escape', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' } });
    tick();

    dispatchEscape();
    tick();

    expect(panel()).toBeNull();
  });

  it('ignores Escape when disableClose is set', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' }, disableClose: true });
    tick();

    dispatchEscape();
    tick();

    expect(panel()).toBeTruthy();
  });

  it('stamps role="dialog" and the aria-label from the config', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' }, ariaLabel: 'Filters' });
    tick();

    const container = containerEl().querySelector('.cdk-dialog-container');
    expect(container?.getAttribute('role')).toBe('dialog');
    expect(container?.getAttribute('aria-label')).toBe('Filters');
  });

  it('marks the drawer aria-modal only while a backdrop is present', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' } });
    service.open(TestDrawerComponent, { data: { name: 'b' }, backdrop: false });
    tick();

    const containers = containerEl().querySelectorAll('.cdk-dialog-container');
    expect(containers[0].getAttribute('aria-modal')).toBe('true');
    expect(containers[1].getAttribute('aria-modal')).toBe('false');
  });

  it('reads the default placement from provideDrawerDefaults', () => {
    setup([provideDrawerDefaults({ placement: 'left', size: 'sm' })]);
    service.open(TestDrawerComponent, { data: { name: 'a' } });
    tick();

    expect(panel()?.classList.contains('dm-drawer-panel--left')).toBe(true);
    expect(panel()?.classList.contains('dm-drawer-panel--sm')).toBe(true);
  });

  it('lets an explicit config override the provided defaults', () => {
    setup([provideDrawerDefaults({ placement: 'left' })]);
    service.open(TestDrawerComponent, { data: { name: 'a' }, placement: 'right' });
    tick();

    expect(panel()?.classList.contains('dm-drawer-panel--right')).toBe(true);
  });

  it('exposes the fallback defaults through the DRAWER_DEFAULTS token', () => {
    setup();
    expect(TestBed.inject(DRAWER_DEFAULTS)).toEqual({
      placement: 'right',
      size: 'md',
      backdrop: true,
      disableClose: false,
    });
  });

  it('closeAll closes every open drawer', () => {
    setup();
    service.open(TestDrawerComponent, { data: { name: 'a' } });
    service.open(TestDrawerComponent, { data: { name: 'b' } });
    tick();

    service.closeAll();
    tick();

    expect(containerEl().querySelectorAll('.content').length).toBe(0);
  });
});
