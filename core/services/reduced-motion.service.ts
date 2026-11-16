import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core';

/**
 * Exposes `prefers-reduced-motion` as a live signal, for components that
 * need to branch in TypeScript (CSS-only cases are covered by the
 * `reduced-motion` mixin and the zeroed duration tokens).
 */
@Injectable({ providedIn: 'root' })
export class ReducedMotionService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly media =
    this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;

  private readonly _reducedMotion = signal(this.media?.matches ?? false);

  /** `true` while the user requests reduced motion. */
  readonly reducedMotion: Signal<boolean> = this._reducedMotion.asReadonly();

  constructor() {
    if (this.media) {
      const onChange = (event: MediaQueryListEvent) => this._reducedMotion.set(event.matches);
      this.media.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => this.media?.removeEventListener('change', onChange));
    }
  }
}
