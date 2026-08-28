import { A11yModule } from '@angular/cdk/a11y';
import {
  CdkConnectedOverlay,
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  OverlayModule,
  ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { POPOVER_DEFAULTS } from './popover.tokens';
import { DmPopoverPlacement, DmPopoverSide } from './popover.types';

type Align = 'center' | 'start' | 'end';

/** Nominal side of a placement (`'top-start'` → `'top'`). */
function sideOf(placement: DmPopoverPlacement): DmPopoverSide {
  return placement.split('-')[0] as DmPopoverSide;
}

/** Cross-axis alignment encoded in a placement (`'-start'` / `'-end'`). */
function alignOf(placement: DmPopoverPlacement): Align {
  if (placement.endsWith('-start')) {
    return 'start';
  }
  if (placement.endsWith('-end')) {
    return 'end';
  }
  return 'center';
}

/** Builds a single CDK connected position for a side + alignment + offset. */
function position(side: DmPopoverSide, align: Align, offset: number): ConnectedPosition {
  switch (side) {
    case 'top':
      return {
        originX: align,
        originY: 'top',
        overlayX: align,
        overlayY: 'bottom',
        offsetY: -offset,
      };
    case 'bottom':
      return {
        originX: align,
        originY: 'bottom',
        overlayX: align,
        overlayY: 'top',
        offsetY: offset,
      };
    case 'left':
      return {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offsetX: -offset,
      };
    case 'right':
      return {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offsetX: offset,
      };
  }
}

const OPPOSITE: Record<DmPopoverSide, DmPopoverSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** Primary placement plus the opposite-side fallback the CDK flips to. */
function buildPositions(placement: DmPopoverPlacement, offset: number): ConnectedPosition[] {
  const side = sideOf(placement);
  const align = alignOf(placement);
  return [position(side, align, offset), position(OPPOSITE[side], align, offset)];
}

/** Maps the position the CDK actually resolved back to a side (for the arrow). */
function sideOfConnection(pos: ConnectedPosition): DmPopoverSide {
  if (pos.overlayY === 'bottom') {
    return 'top';
  }
  if (pos.overlayY === 'top') {
    return 'bottom';
  }
  if (pos.overlayX === 'end') {
    return 'left';
  }
  return 'right';
}

/**
 * Rich floating panel anchored to a trigger — the tooltip's bigger sibling:
 * opened by click, holds arbitrary interactive content, and manages focus.
 *
 * ```html
 * <button [dmPopoverTrigger]="info">Details</button>
 * <dm-popover #info placement="bottom" ariaLabel="Account details">
 *   <h3>Ada Lovelace</h3>
 *   <p>ada@analytical.engine</p>
 * </dm-popover>
 * ```
 *
 * The panel renders in a CDK overlay anchored to the trigger, flips to fit,
 * closes on outside click / Escape, and returns focus to the trigger.
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Component({
  selector: 'dm-popover',
  imports: [OverlayModule, A11yModule],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmPopoverComponent {
  private readonly defaults = inject(POPOVER_DEFAULTS);
  private readonly document = inject(DOCUMENT);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);

  /** Stable id used by the trigger's `aria-controls` and the panel element. */
  readonly panelId = dmUid('dm-popover');

  // ---- Inputs --------------------------------------------------------------
  /** Preferred placement; flips to the opposite side when there is no room. */
  readonly placement = input<DmPopoverPlacement>(this.defaults.placement);

  /** Renders the little arrow pointing at the trigger. */
  readonly showArrow = input(this.defaults.showArrow, { transform: booleanAttribute });

  /** Gap between the trigger and the panel, in pixels. */
  readonly offset = input<number>(this.defaults.offset);

  /** Traps keyboard focus inside the panel while open (for menu-like content). */
  readonly trapFocus = input(false, { transform: booleanAttribute });

  /** Accessible name for the dialog when it has no visible heading. */
  readonly ariaLabel = input<string>();

  // ---- Outputs -------------------------------------------------------------
  /** Emitted right after the panel opens. */
  readonly opened = output<void>();

  /** Emitted right after the panel closes. */
  readonly closed = output<void>();

  // ---- State ---------------------------------------------------------------
  private readonly _open = signal(false);
  /** Whether the panel is currently open. */
  readonly isOpen = this._open.asReadonly();

  /** Trigger element registered by `DmPopoverTriggerDirective`; the overlay origin. */
  readonly triggerRef = signal<ElementRef<HTMLElement> | null>(null);

  /** Side the panel ended up on after flipping — drives the arrow + origin. */
  protected readonly resolvedSide = signal<DmPopoverSide>(sideOf(this.defaults.placement));

  protected readonly positions = computed<ConnectedPosition[]>(() =>
    buildPositions(this.placement(), this.offset()),
  );

  protected readonly scrollStrategy = this.scrollStrategies.reposition();

  private readonly cdkOverlay = viewChild.required(CdkConnectedOverlay);

  // ---- Trigger wiring ------------------------------------------------------
  /** Called by the trigger directive to register itself as the overlay origin. */
  registerTrigger(ref: ElementRef<HTMLElement>): void {
    this.triggerRef.set(ref);
  }

  // ---- Open / close --------------------------------------------------------
  toggle(): void {
    if (this._open()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this._open()) {
      return;
    }
    this.resolvedSide.set(sideOf(this.placement()));
    this._open.set(true);
    this.opened.emit();
  }

  /**
   * Closes the panel. When `returnFocus` is omitted it returns focus to the
   * trigger only if focus was inside the panel (so Escape/Tab-out feel right,
   * while an outside click leaves focus where the user clicked).
   */
  close(returnFocus?: boolean): void {
    if (!this._open()) {
      return;
    }
    const shouldReturn = returnFocus ?? this.isFocusInsidePanel();
    this._open.set(false);
    this.closed.emit();
    if (shouldReturn) {
      this.focusTrigger();
    }
  }

  /**
   * Returns focus to the trigger, or to its first focusable descendant when the
   * trigger host itself is not focusable (e.g. a `<dm-button>` wrapping a button).
   */
  private focusTrigger(): void {
    const el = this.triggerRef()?.nativeElement;
    if (!el) {
      return;
    }
    const selector = 'a[href], button, input, select, textarea, [tabindex]';
    const target = el.matches(selector) ? el : el.querySelector<HTMLElement>(selector);
    target?.focus();
  }

  // ---- Overlay event handlers (browser only) -------------------------------
  protected onAttached(): void {
    const overlayEl = this.cdkOverlay().overlayRef?.overlayElement;
    const panel = overlayEl?.querySelector<HTMLElement>('.dm-popover__panel');
    panel?.focus({ preventScroll: true });
  }

  protected onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.resolvedSide.set(sideOfConnection(change.connectionPair));
  }

  protected onOutsideClick(event: MouseEvent): void {
    // The trigger's own click toggles us; ignore it here to avoid a double close.
    const trigger = this.triggerRef()?.nativeElement;
    const target = event.target as Node | null;
    if (trigger && target && trigger.contains(target)) {
      return;
    }
    this.close(false);
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      this.close(true);
    }
  }

  private isFocusInsidePanel(): boolean {
    const overlayEl = this.cdkOverlay().overlayRef?.overlayElement;
    const active = this.document.activeElement;
    return !!(overlayEl && active && overlayEl.contains(active));
  }
}
