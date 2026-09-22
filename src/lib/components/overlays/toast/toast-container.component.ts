import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { DmSpinnerComponent } from '../../primitives/spinner';
import { TOAST_DEFAULTS } from './toast.tokens';
import { DmToastService } from './toast.service';
import { DmToastData } from './toast.types';

/** A toast as the container draws it: the service's data plus its exit state. */
interface RenderedToast {
  data: DmToastData;
  leaving: boolean;
}

/** Removes a leaving toast even if no `animationend` ever arrives (no animations, prerender). */
const EXIT_FALLBACK_MS = 600;

/**
 * The toast stack. `DmToastService` attaches it to a global CDK overlay the
 * first time a toast is shown; not public API.
 *
 * The service owns the logical queue; this container owns the motion: a toast
 * the service dropped stays rendered with `data-leaving` until its exit
 * animation ends (`dm-toast-out`), so the stack folds instead of jumping. It
 * also pauses the timers while hovered / focused and lets a toast be swiped
 * away with the pointer.
 */
@Component({
  selector: 'dm-toast-container',
  imports: [DmSpinnerComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-position]': 'service.position',
  },
})
export class DmToastContainerComponent {
  protected readonly service = inject(DmToastService);
  protected readonly defaults = inject(TOAST_DEFAULTS);

  protected readonly rendered = signal<RenderedToast[]>([]);
  private readonly exitFallbacks = new Map<number, ReturnType<typeof setTimeout>>();

  private hovering = false;
  private focused = false;
  private drag: {
    id: number;
    pointerId: number;
    startX: number;
    dx: number;
    el: HTMLElement;
  } | null = null;

  constructor() {
    effect(() => {
      const active = this.service.toasts();
      untracked(() => this.sync(active));
    });
    inject(DestroyRef).onDestroy(() => this.exitFallbacks.forEach((t) => clearTimeout(t)));
  }

  /** Mirrors the service's list, keeping dropped toasts in place while they leave. */
  private sync(active: DmToastData[]): void {
    const byId = new Map(active.map((toast) => [toast.id, toast]));
    this.rendered.update((list) => {
      const next = list.map((item) => {
        const fresh = byId.get(item.data.id);
        if (fresh)
          return fresh === item.data && !item.leaving ? item : { data: fresh, leaving: false };
        if (item.leaving) return item;
        this.scheduleExitFallback(item.data.id);
        return { ...item, leaving: true };
      });
      for (const toast of active) {
        if (!list.some((item) => item.data.id === toast.id))
          next.push({ data: toast, leaving: false });
      }
      return next;
    });
  }

  private scheduleExitFallback(id: number): void {
    this.exitFallbacks.set(
      id,
      setTimeout(() => this.remove(id), EXIT_FALLBACK_MS),
    );
  }

  private remove(id: number): void {
    const fallback = this.exitFallbacks.get(id);
    if (fallback) clearTimeout(fallback);
    this.exitFallbacks.delete(id);
    this.rendered.update((list) => list.filter((item) => item.data.id !== id));
  }

  /** Emulated encapsulation prefixes keyframe names — match the tail. */
  protected onAnimationEnd(event: AnimationEvent, id: number): void {
    if (event.animationName.endsWith('dm-toast-out')) this.remove(id);
  }

  /** Runs the toast action, then dismisses it (resolving `afterDismissed`). */
  protected runAction(toast: DmToastData): void {
    toast.action?.handler();
    this.service.dismiss(toast.id);
  }

  // ---- Pause while the user is on the stack ----------------------------------

  protected onPointerEnter(): void {
    this.hovering = true;
    this.service.pause();
  }

  protected onPointerLeave(): void {
    this.hovering = false;
    if (!this.focused) this.service.resume();
  }

  protected onFocusIn(): void {
    this.focused = true;
    this.service.pause();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (event.currentTarget as Node).contains(next)) return;
    this.focused = false;
    if (!this.hovering) this.service.resume();
  }

  // ---- Swipe to dismiss --------------------------------------------------------

  protected onPointerDown(event: PointerEvent, toast: DmToastData): void {
    if (event.button !== 0 || (event.target as Element).closest('button, a')) return;
    const el = event.currentTarget as HTMLElement;
    this.drag = { id: toast.id, pointerId: event.pointerId, startX: event.clientX, dx: 0, el };
    el.setPointerCapture(event.pointerId);
    el.setAttribute('data-dragging', '');
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    this.drag.dx = event.clientX - this.drag.startX;
    this.drag.el.style.setProperty('--dm-toast-drag', `${this.drag.dx}px`);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const { id, dx, el } = this.drag;
    this.drag = null;
    el.removeAttribute('data-dragging');
    if (Math.abs(dx) > el.offsetWidth * 0.35) {
      // Keep the dragged offset as the exit's starting point and fly out that way.
      el.style.setProperty('--dm-toast-exit-x', dx > 0 ? '120%' : '-120%');
      el.style.setProperty('--dm-toast-exit-y', '0');
      this.service.dismiss(id);
      return;
    }
    el.style.removeProperty('--dm-toast-drag');
  }

  protected onPointerCancel(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const { el } = this.drag;
    this.drag = null;
    el.removeAttribute('data-dragging');
    el.style.removeProperty('--dm-toast-drag');
  }
}
