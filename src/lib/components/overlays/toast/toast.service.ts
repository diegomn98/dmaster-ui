import { GlobalPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import { DmToastContainerComponent } from './toast-container.component';
import { TOAST_DEFAULTS } from './toast.tokens';
import { DmToastData, DmToastOptions, DmToastRef } from './toast.types';

/**
 * Cola de notificaciones. Los toasts se apilan abajo a la derecha,
 * se auto-descartan (configurable) y se anuncian como `role="status"`.
 *
 * ```ts
 * private readonly toast = inject(DmToastService);
 *
 * this.toast.success('Changes saved');
 * this.toast.danger('Something went wrong', { duration: 0 });
 * this.toast.show('Custom', { variant: 'neutral', dismissible: false });
 * ```
 *
 * Requiere los estilos estructurales del CDK una vez por app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Injectable({ providedIn: 'root' })
export class DmToastService {
  private readonly overlay = inject(Overlay);
  private readonly defaults = inject(TOAST_DEFAULTS);

  private overlayRef: OverlayRef | null = null;
  private sequence = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  /** Resolvers for each toast's `afterDismissed` promise. */
  private readonly dismissResolvers = new Map<number, () => void>();

  private readonly _toasts = signal<DmToastData[]>([]);

  /** Toasts activos (los consume el contenedor interno). */
  readonly toasts = this._toasts.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach((timer) => clearTimeout(timer));
      this.dismissResolvers.forEach((resolve) => resolve());
      this.dismissResolvers.clear();
      this.overlayRef?.dispose();
    });
  }

  show(message: string, options: DmToastOptions = {}): DmToastRef {
    this.ensureContainer();

    const id = ++this.sequence;
    const duration = options.duration ?? this.defaults.duration;

    this._toasts.update((toasts) => [
      ...toasts,
      {
        id,
        message,
        title: options.title,
        variant: options.variant ?? 'neutral',
        dismissible: options.dismissible ?? this.defaults.dismissible,
        action: options.action,
      },
    ]);

    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }

    let resolve!: () => void;
    const afterDismissed = new Promise<void>((r) => (resolve = r));
    this.dismissResolvers.set(id, resolve);

    return { id, dismiss: () => this.dismiss(id), afterDismissed };
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

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
    const resolve = this.dismissResolvers.get(id);
    if (resolve) {
      this.dismissResolvers.delete(id);
      resolve();
    }
  }

  dismissAll(): void {
    this._toasts().forEach((toast) => this.dismiss(toast.id));
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
