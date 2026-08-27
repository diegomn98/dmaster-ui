import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DmDialogService } from './dialog.service';

@Component({
  template: '<p class="content">Hello {{ data.name }}</p>',
})
class TestDialogComponent {
  protected readonly data = inject<{ name: string }>(DIALOG_DATA);
  readonly ref = inject(DialogRef);
}

describe('DmDialogService', () => {
  let service: DmDialogService;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(DmDialogService);
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  function containerEl(): HTMLElement {
    return overlayContainer.getContainerElement();
  }

  it('opens the component with data and the library panel classes', () => {
    service.open(TestDialogComponent, { data: { name: 'Diego' }, size: 'lg' });
    TestBed.inject(ApplicationRef).tick();

    expect(containerEl().querySelector('.content')?.textContent).toContain('Hello Diego');
    const pane = containerEl().querySelector('.dm-dialog-panel');
    expect(pane).toBeTruthy();
    expect(pane?.classList.contains('dm-dialog-panel--lg')).toBe(true);
    expect(containerEl().querySelector('.dm-dialog-backdrop')).toBeTruthy();
  });

  it('merges a custom panelClass onto the panel for scoped theming', () => {
    service.open(TestDialogComponent, { data: { name: 'x' }, panelClass: 'brand-theme' });
    TestBed.inject(ApplicationRef).tick();

    const pane = containerEl().querySelector('.dm-dialog-panel');
    expect(pane?.classList.contains('brand-theme')).toBe(true);
    // The library classes survive alongside the custom one.
    expect(pane?.classList.contains('dm-dialog-panel--md')).toBe(true);
  });

  it('closes with a result', () => {
    const ref = service.open<string, { name: string }, TestDialogComponent>(TestDialogComponent, {
      data: { name: 'Diego' },
    });
    TestBed.inject(ApplicationRef).tick();

    let result: string | undefined;
    ref.closed.subscribe((value) => (result = value));
    ref.close('saved');
    TestBed.inject(ApplicationRef).tick();

    expect(result).toBe('saved');
    expect(containerEl().querySelector('.content')).toBeNull();
  });

  it('closeAll closes every open dialog', () => {
    service.open(TestDialogComponent, { data: { name: 'a' } });
    service.open(TestDialogComponent, { data: { name: 'b' } });
    TestBed.inject(ApplicationRef).tick();

    service.closeAll();
    TestBed.inject(ApplicationRef).tick();

    expect(containerEl().querySelectorAll('.content').length).toBe(0);
  });
});
