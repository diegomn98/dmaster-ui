import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DmToastService } from './toast.service';

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
