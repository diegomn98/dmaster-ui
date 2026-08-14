import {
  ConnectedPosition,
  ConnectionPositionPair,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { DestroyRef, Directive, ElementRef, computed, inject, input, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import type { DmMenuComponent } from './menu.component';
import { DmMenuCloseHandle, DmMenuPlacement } from './menu.types';

/** Fallback position lists per placement: preferred first, then flips. */
const PLACEMENTS: Record<DmMenuPlacement, ConnectedPosition[]> = {
  'bottom-start': [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
  ],
  'bottom-end': [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
  ],
  'top-start': [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  ],
  'top-end': [
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  ],
};

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]';

/**
 * Turns any element into the trigger for a `<dm-menu>`. Wires up
 * `aria-haspopup` / `aria-expanded` / `aria-controls`, opens the panel in a CDK
 * overlay and drives the initial focus target per interaction:
 *
 * - **Click** toggles; opens with focus on the panel.
 * - **ArrowDown / Enter / Space** open with focus on the **first** item.
 * - **ArrowUp** opens with focus on the **last** item.
 *
 * ```html
 * <button [dmMenuTrigger]="menu">Open</button>
 * <dm-menu #menu> … </dm-menu>
 * ```
 */
@Directive({
  selector: '[dmMenuTrigger]',
  exportAs: 'dmMenuTrigger',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'controlsId()',
    '[attr.data-menu-open]': "isOpen() ? '' : null",
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DmMenuTriggerDirective implements DmMenuCloseHandle {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The menu this element opens. Bind the template ref: `[dmMenuTrigger]="menu"`. */
  readonly menu = input.required<DmMenuComponent>({ alias: 'dmMenuTrigger' });

  /** Whether the menu is currently open. */
  readonly isOpen = signal(false);

  protected readonly controlsId = computed(() => (this.isOpen() ? this.menu().panelId : null));

  private overlayRef: OverlayRef | null = null;
  private backdropSub?: Subscription;
  private positionSub?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardown());
  }

  protected onClick(): void {
    if (this.isOpen()) {
      this.close(true);
    } else {
      this.open('pointer');
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isOpen()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.open('first');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.open('last');
        break;
    }
  }

  /** @internal {@link DmMenuCloseHandle}: close the panel and dispose the overlay. */
  close(returnFocus: boolean): void {
    if (!this.isOpen()) {
      return;
    }
    this.teardown();
    this.isOpen.set(false);
    this.menu()._markClosed();
    if (returnFocus) {
      this.focusTrigger();
    }
  }

  private open(focus: 'first' | 'last' | 'pointer'): void {
    if (this.isOpen()) {
      return;
    }
    const menu = this.menu();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withPositions(PLACEMENTS[menu.placement()]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      disposeOnNavigation: true,
    });

    this.overlayRef.attach(menu._portal());
    const panelEl = this.overlayRef.overlayElement.querySelector<HTMLElement>('.dm-menu__panel');

    this.setOrigin(panelEl, menu.placement());
    this.positionSub = positionStrategy.positionChanges.subscribe((change) =>
      this.reflectPosition(panelEl, change.connectionPair),
    );
    this.backdropSub = this.overlayRef.backdropClick().subscribe(() => this.close(false));

    this.isOpen.set(true);
    menu._markOpened(this);

    if (focus === 'first') {
      menu._focusFirstItem();
    } else if (focus === 'last') {
      menu._focusLastItem();
    } else {
      menu._prepareKeyManager();
      panelEl?.focus();
    }
  }

  private teardown(): void {
    this.backdropSub?.unsubscribe();
    this.positionSub?.unsubscribe();
    this.backdropSub = undefined;
    this.positionSub = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  /** Reflect the requested placement onto the panel before the first measure. */
  private setOrigin(panelEl: HTMLElement | null, placement: DmMenuPlacement): void {
    if (!panelEl) {
      return;
    }
    const [side, align] = placement.split('-');
    panelEl.setAttribute('data-position', side === 'top' ? 'top' : 'bottom');
    panelEl.setAttribute('data-align', align === 'end' ? 'end' : 'start');
  }

  /** Keep the transform-origin correct after the overlay flips. */
  private reflectPosition(panelEl: HTMLElement | null, pair: ConnectionPositionPair): void {
    if (!panelEl) {
      return;
    }
    // overlayY 'bottom' → the panel's bottom sits on the trigger → panel above.
    panelEl.setAttribute('data-position', pair.overlayY === 'bottom' ? 'top' : 'bottom');
    panelEl.setAttribute('data-align', pair.overlayX === 'end' ? 'end' : 'start');
  }

  /** Return focus to the trigger — or its inner focusable, for wrapper components. */
  private focusTrigger(): void {
    const host = this.elementRef.nativeElement;
    const target = host.matches(FOCUSABLE) ? host : host.querySelector<HTMLElement>(FOCUSABLE);
    (target ?? host).focus();
  }
}
