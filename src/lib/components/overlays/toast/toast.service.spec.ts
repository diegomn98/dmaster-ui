import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DmToastService } from './toast.service';
import { provideToastDefaults } from './toast.tokens';

describe('DmToastService', () => {
  let service: DmToastService;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(DmToastService);
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    vi.useRealTimers();
  });

  it('shows a toast in the overlay container with role=status', () => {
    service.show('Saved', { variant: 'success' });
    TestBed.inject(ApplicationRef).tick();

    const toast = overlayContainer.getContainerElement().querySelector('.dm-toast');
    expect(toast?.textContent).toContain('Saved');
    expect(toast?.getAttribute('role')).toBe('status');
    expect(toast?.getAttribute('data-variant')).toBe('success');
  });

  it('auto-dismisses after the configured duration', () => {
    service.show('Bye', { duration: 1000 });
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(999);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('duration 0 disables auto-dismiss; manual dismiss works', () => {
    const ref = service.show('Sticky', { duration: 0 });
    vi.advanceTimersByTime(60000);
    expect(service.toasts().length).toBe(1);

    ref.dismiss();
    expect(service.toasts().length).toBe(0);
  });

  it('resolves afterDismissed on manual dismiss and on auto-dismiss', async () => {
    const manual = service.show('Sticky', { duration: 0 });
    let manualDone = false;
    manual.afterDismissed.then(() => (manualDone = true));
    manual.dismiss();
    await Promise.resolve();
    expect(manualDone).toBe(true);

    const auto = service.show('Bye', { duration: 1000 });
    let autoDone = false;
    auto.afterDismissed.then(() => (autoDone = true));
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(autoDone).toBe(true);
  });

  it('renders the optional title above the message', () => {
    service.show('Your draft is safe', { title: 'Saved' });
    TestBed.inject(ApplicationRef).tick();

    const body = overlayContainer.getContainerElement().querySelector('.dm-toast__body');
    const title = body?.querySelector('.dm-toast__title');
    expect(title?.textContent?.trim()).toBe('Saved');
    expect(body?.firstElementChild).toBe(title);
    expect(body?.querySelector('.dm-toast__message')?.textContent).toContain('Your draft is safe');
  });

  it('renders neither title nor action button by default', () => {
    service.show('Saved');
    TestBed.inject(ApplicationRef).tick();

    const toast = overlayContainer.getContainerElement().querySelector('.dm-toast');
    expect(toast?.querySelector('.dm-toast__title')).toBeNull();
    expect(toast?.querySelector('.dm-toast__action')).toBeNull();
  });

  it('action button runs the handler, dismisses the toast and resolves afterDismissed', async () => {
    const handler = vi.fn();
    const ref = service.show('Conversation archived', {
      duration: 0,
      action: { label: 'Undo', handler },
    });
    let done = false;
    ref.afterDismissed.then(() => (done = true));
    TestBed.inject(ApplicationRef).tick();

    const button = overlayContainer
      .getContainerElement()
      .querySelector<HTMLButtonElement>('.dm-toast__action');
    expect(button?.textContent?.trim()).toBe('Undo');

    button?.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(service.toasts().length).toBe(0);

    await Promise.resolve();
    expect(done).toBe(true);
  });

  it('positions the container bottom-right by default', () => {
    service.show('Saved');
    TestBed.inject(ApplicationRef).tick();

    const container = overlayContainer.getContainerElement();
    const wrapper = container.querySelector<HTMLElement>('.cdk-global-overlay-wrapper');
    const pane = container.querySelector<HTMLElement>('.cdk-overlay-pane');
    expect(wrapper?.style.justifyContent).toBe('flex-end');
    expect(wrapper?.style.alignItems).toBe('flex-end');
    expect(pane?.style.marginBottom).toBe('1rem');
    expect(pane?.style.marginRight).toBe('1rem');
  });

  it('honors a non-default position from the injected defaults', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideToastDefaults({ position: 'top-center' }),
      ],
    });
    service = TestBed.inject(DmToastService);
    overlayContainer = TestBed.inject(OverlayContainer);

    service.show('Up here');
    TestBed.inject(ApplicationRef).tick();

    const container = overlayContainer.getContainerElement();
    const wrapper = container.querySelector<HTMLElement>('.cdk-global-overlay-wrapper');
    const pane = container.querySelector<HTMLElement>('.cdk-overlay-pane');
    expect(wrapper?.style.justifyContent).toBe('center');
    expect(wrapper?.style.alignItems).toBe('flex-start');
    expect(pane?.style.marginTop).toBe('1rem');
  });

  it('variant helpers stack toasts and dismissAll clears them', () => {
    service.success('a');
    service.warning('b');
    service.danger('c');
    expect(service.toasts().map((toast) => toast.variant)).toEqual([
      'success',
      'warning',
      'danger',
    ]);

    service.dismissAll();
    expect(service.toasts().length).toBe(0);
  });
});
