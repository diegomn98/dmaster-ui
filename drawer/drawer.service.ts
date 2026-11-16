import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef, Injectable, inject } from '@angular/core';

import { DRAWER_DEFAULTS } from './drawer.tokens';
import { DmDrawerConfig, DmDrawerPlacement } from './drawer.types';

/**
 * Slide-in side panel served over the CDK Dialog with the library look. Focus
 * trap, focus restore, Escape/backdrop handling come from the CDK; the panel
 * is pinned to a viewport edge with a global position strategy and styled by
 * the library's global stylesheet.
 *
 * ```ts
 * private readonly drawer = inject(DmDrawerService);
 *
 * openFilters(): void {
 *   const ref = this.drawer.open(FiltersComponent, { placement: 'right', size: 'md', data: { … } });
 *   ref.closed.subscribe((result) => …);
 * }
 * ```
 *
 * Inside the content component/template: `inject(DIALOG_DATA)` for the data and
 * `inject(DialogRef)` to close (both re-exported from this entry point).
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Injectable({ providedIn: 'root' })
export class DmDrawerService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly defaults = inject(DRAWER_DEFAULTS);

  open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplate: ComponentType<C> | TemplateRef<C>,
    config: DmDrawerConfig<D> = {},
  ): DialogRef<R, C> {
    const placement = config.placement ?? this.defaults.placement;
    const size = config.size ?? this.defaults.size;
    const backdrop = config.backdrop ?? this.defaults.backdrop;

    return this.dialog.open<R, D, C>(componentOrTemplate, {
      data: config.data,
      disableClose: config.disableClose ?? this.defaults.disableClose,
      ariaLabel: config.ariaLabel,
      role: 'dialog',
      // Modal only while a backdrop dims the page; a backdrop-less drawer
      // leaves the rest of the page interactive, so it must not claim aria-modal.
      ariaModal: backdrop,
      hasBackdrop: backdrop,
      positionStrategy: this.positionFor(placement),
      panelClass: [
        'dm-drawer-panel',
        `dm-drawer-panel--${placement}`,
        `dm-drawer-panel--${size}`,
        ...(config.panelClass ? [config.panelClass].flat() : []),
      ],
      backdropClass: 'dm-drawer-backdrop',
    });
  }

  /** Closes every open drawer. */
  closeAll(): void {
    this.dialog.closeAll();
  }

  /** Pins the panel flush to the requested edge; CSS sets its box dimensions. */
  private positionFor(placement: DmDrawerPlacement): GlobalPositionStrategy {
    const position = this.overlay.position().global();
    switch (placement) {
      case 'left':
        return position.left('0').top('0');
      case 'top':
        return position.top('0').left('0');
      case 'bottom':
        return position.bottom('0').left('0');
      case 'right':
      default:
        return position.right('0').top('0');
    }
  }
}
