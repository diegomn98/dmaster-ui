import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmTooltipPanelComponent } from './tooltip-panel.component';
import { TOOLTIP_DEFAULTS } from './tooltip.tokens';
import { DmTooltipPosition } from './tooltip.types';

const POSITIONS: Record<DmTooltipPosition, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  ],
};

/**
 * Tooltip de texto sobre cualquier elemento. Se muestra con hover (con delay)
 * y con foco de teclado (inmediato); Escape lo cierra.
 *
 * ```html
 * <button dmTooltip="Copy to clipboard">…</button>
 * <button dmTooltip="Delete" dmTooltipPosition="right">…</button>
 * ```
 */
@Directive({
  selector: '[dmTooltip]',
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'scheduleHide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class DmTooltipDirective {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly defaults = inject(TOOLTIP_DEFAULTS);
  private readonly panelId = dmUid('dm-tooltip');

  /** Tooltip text. Empty → never shown. */
  readonly dmTooltip = input.required<string>();

  /** Preferred placement; flips to the opposite side when there is no room. */
  readonly dmTooltipPosition = input<DmTooltipPosition>(this.defaults.position);

  private overlayRef: OverlayRef | null = null;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.clearTimers();
      this.overlayRef?.dispose();
    });
  }

  protected scheduleShow(): void {
    this.clearTimers();
    this.showTimer = setTimeout(() => this.show(), this.defaults.showDelay);
  }

  protected scheduleHide(): void {
    this.clearTimers();
    this.hideTimer = setTimeout(() => this.hide(), this.defaults.hideDelay);
  }

  protected show(): void {
    this.clearTimers();
    if (!this.dmTooltip() || this.overlayRef?.hasAttached()) {
      return;
    }

    this.overlayRef?.dispose();
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions(POSITIONS[this.dmTooltipPosition()]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    const panel = this.overlayRef.attach(new ComponentPortal(DmTooltipPanelComponent));
    panel.instance.text.set(this.dmTooltip());
    this.overlayRef.overlayElement.id = this.panelId;
    this.elementRef.nativeElement.setAttribute('aria-describedby', this.panelId);
  }

  protected hide(): void {
    this.clearTimers();
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
    }
    this.elementRef.nativeElement.removeAttribute('aria-describedby');
  }

  private clearTimers(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  }
}
