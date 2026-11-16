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

import { DmDialogService } from './dialog.service';

@Component({
  template: '<p class="content">Hello {{ data.name }}</p>',
})
class TestDialogComponent {
  protected readonly data = inject<{ name: string }>(DIALOG_DATA);
  readonly ref = inject(DialogRef);
}

@Component({
  template: '<ng-template #tpl><p class="tpl-content">From template</p></ng-template>',
})
class TemplateHostComponent {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
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

  // The CDK overlay keyboard dispatcher listens on document.body and the CDK
  // dialog matches Escape by keyCode (27), which the KeyboardEvent constructor
  // does not set from `key` alone.
  function dispatchEscape(): void {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    Object.defineProperty(event, 'keyCode', { get: () => 27 });
    document.body.dispatchEvent(event);
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

  it('opens a TemplateRef', () => {
    const host = TestBed.createComponent(TemplateHostComponent);
    host.detectChanges();

    service.open(host.componentInstance.tpl(), { data: {} });
    TestBed.inject(ApplicationRef).tick();

    expect(containerEl().querySelector('.tpl-content')?.textContent).toContain('From template');
  });

  describe('confirm', () => {
    const options = {
      title: 'Delete this file?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
    };

    function confirmButton(): HTMLButtonElement {
      return containerEl().querySelector<HTMLButtonElement>('.dm-confirm-dialog__confirm button')!;
    }

    function cancelButton(): HTMLButtonElement {
      return containerEl().querySelector<HTMLButtonElement>('.dm-confirm-dialog__cancel button')!;
    }

    it('renders the provided labels verbatim (the library ships no copy)', () => {
      void service.confirm(options);
      TestBed.inject(ApplicationRef).tick();

      const el = containerEl();
      expect(el.querySelector('.dm-confirm-dialog__title')?.textContent).toBe('Delete this file?');
      expect(el.querySelector('.dm-confirm-dialog__message')?.textContent).toBe(
        'This action cannot be undone.',
      );
      expect(confirmButton().textContent?.trim()).toBe('Delete');
      expect(cancelButton().textContent?.trim()).toBe('Keep it');
      // The title doubles as the dialog's accessible name.
      expect(el.querySelector('.cdk-dialog-container')?.getAttribute('aria-label')).toBe(
        'Delete this file?',
      );
    });

    it('omits the message paragraph when no message is given', () => {
      void service.confirm({ title: 't', confirmLabel: 'Yes', cancelLabel: 'No' });
      TestBed.inject(ApplicationRef).tick();

      expect(containerEl().querySelector('.dm-confirm-dialog__message')).toBeNull();
    });

    it('resolves true when the confirm button is clicked', async () => {
      const result = service.confirm(options);
      TestBed.inject(ApplicationRef).tick();

      confirmButton().click();
      TestBed.inject(ApplicationRef).tick();

      expect(await result).toBe(true);
      expect(containerEl().querySelector('.dm-confirm-dialog__title')).toBeNull();
    });

    it('resolves false when the cancel button is clicked', async () => {
      const result = service.confirm(options);
      TestBed.inject(ApplicationRef).tick();

      cancelButton().click();
      TestBed.inject(ApplicationRef).tick();

      expect(await result).toBe(false);
    });

    it('resolves false when dismissed with Escape', async () => {
      const result = service.confirm(options);
      TestBed.inject(ApplicationRef).tick();

      dispatchEscape();
      TestBed.inject(ApplicationRef).tick();

      expect(await result).toBe(false);
    });

    it('paints the confirm button primary by default and with the given color', () => {
      void service.confirm(options);
      TestBed.inject(ApplicationRef).tick();
      expect(confirmButton().getAttribute('data-color')).toBe('primary');
      expect(cancelButton().getAttribute('data-variant')).toBe('light');
      service.closeAll();
      TestBed.inject(ApplicationRef).tick();

      void service.confirm({ ...options, color: 'danger' });
      TestBed.inject(ApplicationRef).tick();
      expect(confirmButton().getAttribute('data-color')).toBe('danger');
      expect(confirmButton().getAttribute('data-variant')).toBe('solid');
    });
  });
});
