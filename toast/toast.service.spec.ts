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

  // ---- Queue, pause, update, promise ----------------------------------------

  it('queues toasts beyond maxVisible and promotes them (timer starting then) as slots free', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideToastDefaults({ maxVisible: 2 })],
    });
    service = TestBed.inject(DmToastService);
    overlayContainer = TestBed.inject(OverlayContainer);

    const a = service.show('a', { duration: 1000 });
    service.show('b', { duration: 1000 });
    const c = service.show('c', { duration: 1000 });
    expect(service.toasts().map((t) => t.message)).toEqual(['a', 'b']);
    expect(service.queued()).toBe(1);

    // c waits: its timer has not started, so it outlives a's.
    vi.advanceTimersByTime(999);
    a.dismiss();
    expect(service.toasts().map((t) => t.message)).toEqual(['b', 'c']);
    expect(service.queued()).toBe(0);
    vi.advanceTimersByTime(1);
    expect(service.toasts().map((t) => t.message)).toEqual(['c']);
    vi.advanceTimersByTime(999);
    expect(service.toasts().length).toBe(0);

    let cDone = false;
    c.afterDismissed.then(() => (cDone = true));
    return Promise.resolve().then(() => expect(cDone).toBe(true));
  });

  it('pause() freezes the timers and resume() continues with the time left', () => {
    service.show('Hold on', { duration: 1000 });
    vi.advanceTimersByTime(600);
    service.pause();
    expect(service.paused()).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(1);

    service.resume();
    vi.advanceTimersByTime(399);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('a toast shown while paused waits for resume() before its timer runs', () => {
    service.pause();
    service.show('Later', { duration: 500 });
    vi.advanceTimersByTime(2000);
    expect(service.toasts().length).toBe(1);
    service.resume();
    vi.advanceTimersByTime(500);
    expect(service.toasts().length).toBe(0);
  });

  it('update() changes a live toast in place and a new duration restarts its timer', () => {
    const ref = service.loading('Uploading…');
    expect(service.toasts()[0]).toMatchObject({ variant: 'loading', duration: 0 });
    vi.advanceTimersByTime(10000);
    expect(service.toasts().length).toBe(1);

    ref.update({ message: 'Done', variant: 'success', duration: 1000 });
    expect(service.toasts()[0]).toMatchObject({ message: 'Done', variant: 'success' });
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
    expect(service.update(ref.id, { message: 'gone' })).toBe(false);
  });

  it('promise() shows a loading toast, then settles it to success in place', async () => {
    let resolve!: (v: number) => void;
    const ref = service.promise(new Promise<number>((r) => (resolve = r)), {
      loading: 'Saving…',
      success: (n) => `Saved ${n} rows`,
      error: 'Failed',
    });
    expect(service.toasts()[0]).toMatchObject({
      variant: 'loading',
      dismissible: false,
      duration: 0,
    });

    resolve(3);
    await Promise.resolve();
    await Promise.resolve();
    expect(service.toasts()[0]).toMatchObject({
      id: ref.id,
      message: 'Saved 3 rows',
      variant: 'success',
      dismissible: true,
    });
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('promise() settles to danger on rejection, with the error message function', async () => {
    let reject!: (e: unknown) => void;
    service.promise(new Promise<void>((_r, rj) => (reject = rj)), {
      loading: 'Saving…',
      success: 'Saved',
      error: (e) => `Failed: ${String(e)}`,
    });
    reject('offline');
    await Promise.resolve();
    await Promise.resolve();
    expect(service.toasts()[0]).toMatchObject({ message: 'Failed: offline', variant: 'danger' });
  });

  // ---- Container: roles, loading icon, exit ---------------------------------

  it('announces danger toasts as role=alert and renders a spinner for loading', () => {
    service.danger('Boom');
    service.loading('Working');
    TestBed.inject(ApplicationRef).tick();

    const toasts = overlayContainer.getContainerElement().querySelectorAll('.dm-toast');
    expect(toasts[0].getAttribute('role')).toBe('alert');
    expect(toasts[1].getAttribute('role')).toBe('status');
    expect(toasts[1].querySelector('dm-spinner')).not.toBeNull();
  });

  it('keeps a dismissed toast on screen as leaving until its exit animation ends', () => {
    const ref = service.show('Bye', { duration: 0 });
    TestBed.inject(ApplicationRef).tick();
    ref.dismiss();
    expect(service.toasts().length).toBe(0);
    TestBed.inject(ApplicationRef).tick();

    const container = overlayContainer.getContainerElement();
    const leaving = container.querySelector<HTMLElement>('.dm-toast[data-leaving]');
    expect(leaving).not.toBeNull();

    // Prefixed keyframe name, as emulated encapsulation emits it.
    leaving?.dispatchEvent(
      Object.assign(new Event('animationend', { bubbles: true }), {
        animationName: '_ngcontent-ng-c1_dm-toast-out',
      }),
    );
    TestBed.inject(ApplicationRef).tick();
    expect(container.querySelector('.dm-toast')).toBeNull();
  });

  it('removes a leaving toast anyway if no animationend ever arrives', () => {
    const ref = service.show('Bye', { duration: 0 });
    TestBed.inject(ApplicationRef).tick();
    ref.dismiss();
    TestBed.inject(ApplicationRef).tick();
    expect(overlayContainer.getContainerElement().querySelector('.dm-toast')).not.toBeNull();

    vi.advanceTimersByTime(600);
    TestBed.inject(ApplicationRef).tick();
    expect(overlayContainer.getContainerElement().querySelector('.dm-toast')).toBeNull();
  });

  it('pauses the timers while the stack is hovered', () => {
    service.show('Read me', { duration: 1000 });
    TestBed.inject(ApplicationRef).tick();
    const stack = overlayContainer.getContainerElement().querySelector('.dm-toasts') as HTMLElement;

    stack.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(1);

    stack.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });
});
