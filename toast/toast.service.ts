import { GlobalPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom, isObservable } from 'rxjs';

import { DmToastContainerComponent } from './toast-container.component';
import { TOAST_DEFAULTS } from './toast.tokens';
import {
  DmToastData,
  DmToastOptions,
  DmToastPromiseInput,
  DmToastPromiseMessages,
  DmToastRef,
  DmToastUpdate,
} from './toast.types';

interface ToastTimer {
  handle: ReturnType<typeof setTimeout> | null;
  /** Epoch ms when the toast should dismiss (while running). */
  deadline: number;
  /** Ms left when paused. */
  remaining: number;
}

/**
 * Notification queue. Toasts stack at the configured `position`
 * (bottom-right by default), auto-dismiss (configurable), and are announced
 * politely (`role="status"`; errors as `role="alert"`).
 *
 * ```ts
 * private readonly toast = inject(DmToastService);
 *
 * this.toast.success('Changes saved');
 * this.toast.danger('Something went wrong', { duration: 0 });
 * this.toast.promise(this.api.save(), {
 *   loading: 'Saving…',
 *   success: 'Saved',
 *   error: (e) => `Could not save: ${e}`,
 * });
 * ```
 *
 * This service owns the LOGICAL state: what is visible, what waits in the
 * queue (`maxVisible`), the timers (paused while the stack is hovered or
 * focused). The container owns the motion — a dismissed toast leaves the
 * queue immediately (`afterDismissed` resolves) and plays its exit on screen.
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Injectable({ providedIn: 'root' })
export class DmToastService {
  private readonly overlay = inject(Overlay);
  private readonly defaults = inject(TOAST_DEFAULTS);

  private overlayRef: OverlayRef | null = null;
  private sequence = 0;
  private readonly timers = new Map<number, ToastTimer>();
  /** Resolvers for each toast's `afterDismissed` promise. */
  private readonly dismissResolvers = new Map<number, () => void>();

  private readonly _toasts = signal<DmToastData[]>([]);
  private readonly _queue = signal<DmToastData[]>([]);
  private readonly _paused = signal(false);

  /** Visible toasts (the container renders them). */
  readonly toasts = this._toasts.asReadonly();

  /** Toasts waiting for a slot (`maxVisible` reached). */
  readonly queued = computed(() => this._queue().length);

  /** True while auto-dismiss timers are paused (stack hovered / focused). */
  readonly paused = this._paused.asReadonly();

  /** Placement the stack was created with (global, read once). */
  readonly position = this.defaults.position;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach((timer) => timer.handle && clearTimeout(timer.handle));
      this.timers.clear();
      this.dismissResolvers.forEach((resolve) => resolve());
      this.dismissResolvers.clear();
      this.overlayRef?.dispose();
    });
  }

  show(message: string, options: DmToastOptions = {}): DmToastRef {
    this.ensureContainer();

    const id = ++this.sequence;
    const data: DmToastData = {
      id,
      message,
      title: options.title,
      variant: options.variant ?? 'neutral',
      dismissible: options.dismissible ?? this.defaults.dismissible,
      duration: options.duration ?? this.defaults.duration,
      action: options.action,
    };

    let resolve!: () => void;
    const afterDismissed = new Promise<void>((r) => (resolve = r));
    this.dismissResolvers.set(id, resolve);

    if (this._toasts().length >= this.defaults.maxVisible) {
      this._queue.update((queue) => [...queue, data]);
    } else {
      this.present(data);
    }

    return {
      id,
      dismiss: () => this.dismiss(id),
      update: (patch) => void this.update(id, patch),
      afterDismissed,
    };
  }

  success(message: string, options: Omit<DmToastOptions, 'variant'> = {}): DmToastRef {
    return this.show(message, { ...options, variant: 'success' });
  }

  warning(message: string, options: Omit<DmToastOptions, 'variant'> = {}): DmToastRef {
    return this.show(message, { ...options, variant: 'warning' });
  }

  danger(message: string, options: Omit<DmToastOptions, 'variant'> = {}): DmToastRef {
    return this.show(message, { ...options, variant: 'danger' });
  }

  /** A spinner toast. Sticky by default — `update()` or `dismiss()` it when done. */
  loading(message: string, options: Omit<DmToastOptions, 'variant'> = {}): DmToastRef {
    return this.show(message, { duration: 0, ...options, variant: 'loading' });
  }

  /**
   * Tracks an async operation in ONE toast: shows `messages.loading` with a
   * spinner (sticky, not dismissible), then updates it in place to `success`
   * or `danger` with the regular auto-dismiss. Accepts a Promise or an
   * Observable (its first value). `options.duration` / `dismissible` apply to
   * the final state. Returns the toast's ref; the input is not swallowed —
   * keep your own `await` for the result.
   */
  promise<T>(
    input: DmToastPromiseInput<T>,
    messages: DmToastPromiseMessages<T>,
    options: Omit<DmToastOptions, 'variant'> = {},
  ): DmToastRef {
    const ref = this.show(messages.loading, {
      title: options.title,
      action: options.action,
      variant: 'loading',
      duration: 0,
      dismissible: false,
    });
    const settle = (message: string, variant: 'success' | 'danger') => {
      const patch: DmToastUpdate = {
        message,
        variant,
        duration: options.duration ?? this.defaults.duration,
        dismissible: options.dismissible ?? this.defaults.dismissible,
      };
      // Dismissed meanwhile (e.g. dismissAll)? The outcome still deserves a toast.
      if (!this.update(ref.id, patch)) this.show(message, { ...options, variant, ...patch });
    };
    const source = isObservable(input) ? firstValueFrom(input) : input;
    source.then(
      (value) =>
        settle(
          typeof messages.success === 'function' ? messages.success(value) : messages.success,
          'success',
        ),
      (error: unknown) =>
        settle(
          typeof messages.error === 'function' ? messages.error(error) : messages.error,
          'danger',
        ),
    );
    return ref;
  }

  /**
   * Changes a live (or queued) toast in place. A new `duration` restarts the
   * auto-dismiss timer. Returns `false` when the toast is already gone.
   */
  update(id: number, patch: DmToastUpdate): boolean {
    let found = false;
    const apply = (list: DmToastData[]) =>
      list.map((toast) => {
        if (toast.id !== id) return toast;
        found = true;
        const next = { ...toast };
        if (patch.message !== undefined) next.message = patch.message;
        if (patch.title !== undefined) next.title = patch.title;
        if (patch.variant !== undefined) next.variant = patch.variant;
        if (patch.dismissible !== undefined) next.dismissible = patch.dismissible;
        if (patch.duration !== undefined) next.duration = patch.duration;
        if (patch.action !== undefined) next.action = patch.action;
        return next;
      });
    this._toasts.update(apply);
    const visible = found;
    if (!found) this._queue.update(apply);
    if (!found) return false;
    if (visible && patch.duration !== undefined) {
      this.clearTimer(id);
      this.startTimer(id, patch.duration);
    }
    return true;
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    const wasVisible = this._toasts().some((toast) => toast.id === id);
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
    this._queue.update((queue) => queue.filter((toast) => toast.id !== id));
    const resolve = this.dismissResolvers.get(id);
    if (resolve) {
      this.dismissResolvers.delete(id);
      resolve();
    }
    if (wasVisible) this.drain();
  }

  dismissAll(): void {
    [...this._queue(), ...this._toasts()].forEach((toast) => this.dismiss(toast.id));
  }

  /** Freezes every auto-dismiss timer (the container calls it on hover / focus). */
  pause(): void {
    if (this._paused()) return;
    this._paused.set(true);
    const now = Date.now();
    this.timers.forEach((timer) => {
      if (timer.handle === null) return;
      clearTimeout(timer.handle);
      timer.handle = null;
      timer.remaining = Math.max(0, timer.deadline - now);
    });
  }

  /** Resumes the timers with the time they had left. */
  resume(): void {
    if (!this._paused()) return;
    this._paused.set(false);
    this.timers.forEach((timer, id) => {
      if (timer.handle !== null) return;
      timer.deadline = Date.now() + timer.remaining;
      timer.handle = setTimeout(() => this.dismiss(id), timer.remaining);
    });
  }

  // ---- Internals -------------------------------------------------------------

  private present(data: DmToastData): void {
    this._toasts.update((toasts) => [...toasts, data]);
    this.startTimer(data.id, data.duration);
  }

  /** Moves queued toasts into free slots, in order. */
  private drain(): void {
    while (this._queue().length && this._toasts().length < this.defaults.maxVisible) {
      const [next, ...rest] = this._queue();
      this._queue.set(rest);
      this.present(next);
    }
  }

  private startTimer(id: number, duration: number): void {
    if (duration <= 0) return;
    if (this._paused()) {
      this.timers.set(id, { handle: null, deadline: 0, remaining: duration });
      return;
    }
    this.timers.set(id, {
      handle: setTimeout(() => this.dismiss(id), duration),
      deadline: Date.now() + duration,
      remaining: duration,
    });
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer?.handle) clearTimeout(timer.handle);
    this.timers.delete(id);
  }

  private ensureContainer(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      positionStrategy: this.buildPositionStrategy(),
      hasBackdrop: false,
    });
    this.overlayRef.attach(new ComponentPortal(DmToastContainerComponent));
  }

  /**
   * Builds the global strategy from `defaults.position` (default
   * `'bottom-right'`). The position is global: one container serves every
   * toast, and it is read once when the first toast creates it.
   */
  private buildPositionStrategy(): GlobalPositionStrategy {
    const strategy = this.overlay.position().global();
    const [vertical, horizontal] = this.defaults.position.split('-');
    if (vertical === 'top') {
      strategy.top('1rem');
    } else {
      strategy.bottom('1rem');
    }
    if (horizontal === 'left') {
      strategy.left('1rem');
    } else if (horizontal === 'center') {
      strategy.centerHorizontally();
    } else {
      strategy.right('1rem');
    }
    return strategy;
  }
}
