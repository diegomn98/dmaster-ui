import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { ReducedMotionService } from '../../../core/services/reduced-motion.service';
import { DmChipSetComponent } from './chip-set.component';
import { CHIP_DEFAULTS } from './chip.tokens';
import { DmChipColor, DmChipRadius, DmChipSize, DmChipVariant } from './chip.types';

/**
 * Compact, interactive chip — the interactive sibling of `dm-badge`. One
 * component covers the three chip archetypes:
 *
 * - **Input / tag** (`removable`) — a trailing ✕ removes it; `Delete`/`Backspace`
 *   removes it from the keyboard. Emits `(removed)` after a collapse animation.
 * - **Filter / choice** (`selectable` + `[(selected)]`) — a toggle chip that
 *   flips a check on select. Coordinate a group with `<dm-chip-set selection>`.
 * - **Action** (`clickable`) — emits `(chipClick)` like a compact button.
 *
 * Everything is token-pure (`color` × `variant`) and keyboard-accessible.
 *
 * ```html
 * <dm-chip removable (removed)="drop('ng')">Angular</dm-chip>
 * <dm-chip selectable [(selected)]="onSale" color="primary">On sale</dm-chip>
 * <dm-chip clickable (chipClick)="add()"><dm-icon dm-chip-leading name="plus" />Add</dm-chip>
 * ```
 */
@Component({
  selector: 'dm-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-color]': 'color()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-radius]': 'radius()',
    '[attr.data-selected]': 'selectable() && effectiveSelected() ? "true" : null',
    '[attr.data-interactive]': 'interactive() ? "true" : null',
    '[attr.data-removable]': 'removable() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-removing]': 'removing() ? "true" : null',
    '[attr.data-entering]': 'entering() ? "true" : null',
    '(animationend)': 'onHostAnimationEnd($event)',
  },
})
export class DmChipComponent implements OnInit, OnDestroy {
  private readonly defaults = inject(CHIP_DEFAULTS);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reducedMotion = inject(ReducedMotionService);

  /** Optional parent set — drives roving focus and (single/multiple) selection. */
  protected readonly set = inject<DmChipSetComponent | null>(
    forwardRef(() => DmChipSetComponent),
    { optional: true },
  );

  /** Semantic color. */
  readonly color = input<DmChipColor>(this.defaults.color);

  /** Visual variant. */
  readonly variant = input<DmChipVariant>(this.defaults.variant);

  /** Size scale. */
  readonly size = input<DmChipSize>(this.defaults.size);

  /** Corner rounding. `full` is pill-shaped. */
  readonly radius = input<DmChipRadius>(this.defaults.radius);

  /** Shows a trailing ✕ and enables keyboard removal. */
  readonly removable = input(false, { transform: booleanAttribute });

  /** Makes the chip a toggle (filter/choice). Pair with `[(selected)]`. */
  readonly selectable = input(false, { transform: booleanAttribute });

  /** Makes the chip an action button. Pair with `(chipClick)`. */
  readonly clickable = input(false, { transform: booleanAttribute });

  /** Disables the chip (combined with the parent set's `disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Selected state of a `selectable` chip. Two-way: `[(selected)]`. */
  readonly selected = model(false);

  /** Value carried in a coordinated `<dm-chip-set>` (compared by strict equality). */
  readonly value = input<unknown>(undefined);

  /** Accessible name for the chip body — required for icon-only action chips. */
  readonly ariaLabel = input<string>('');

  /** Accessible name for the remove button (icon-only). */
  readonly removeLabel = input<string>('Remove');

  /** Emitted after the chip finishes its removal (collapse) animation. */
  readonly removed = output<void>();

  /** Emitted when an action (`clickable`) chip is activated. */
  readonly chipClick = output<MouseEvent>();

  private readonly bodyEl = viewChild<ElementRef<HTMLElement>>('bodyEl');
  private readonly removeEl = viewChild<ElementRef<HTMLElement>>('removeEl');

  /** True while the exit animation runs (host `data-removing`). */
  protected readonly removing = signal(false);
  private removedEmitted = false;

  /**
   * True while the entrance animation runs (host `data-entering`). Only chips
   * added to an already-rendered set animate in — the initial render is still.
   */
  protected readonly entering = signal(false);

  /** Selectable or clickable → the body is a `<button>`. */
  protected readonly interactive = computed(() => this.selectable() || this.clickable());

  /** True when a parent set coordinates this chip's selection. */
  private readonly inCoordinatedSet = computed(() => !!this.set && this.set.selection() !== 'none');

  /** Effective selected state: the set's when coordinated, else the local model. */
  readonly effectiveSelected = computed(() =>
    this.inCoordinatedSet() ? this.set!.isSelected(this.value()) : this.selected(),
  );

  /** Combined disabled state: own input OR the set's. */
  readonly isDisabled = computed(() => this.disabled() || (this.set?.isDisabled() ?? false));

  /**
   * Roving tabindex for the primary focusable (body button, or the remove
   * button on a removable-only chip). Standalone chips are plain tab stops;
   * inside a set only one chip is the tab stop at a time.
   */
  protected readonly tabIndex = computed<number>(() => {
    if (!this.isFocusable()) {
      return -1;
    }
    if (!this.set) {
      return 0;
    }
    const chips = this.set._registeredChips().filter((c) => c.isFocusable());
    if (this.inCoordinatedSet()) {
      if (this.effectiveSelected()) {
        return 0;
      }
      const anySelected = chips.some((c) => c.effectiveSelected());
      return !anySelected && chips[0] === this ? 0 : -1;
    }
    return chips[0] === this ? 0 : -1;
  });

  ngOnInit(): void {
    this.set?.register(this);
    if (this.set?.isSettled() && !this.reducedMotion.reducedMotion()) {
      this.entering.set(true);
    }
  }

  ngOnDestroy(): void {
    this.set?.unregister(this);
  }

  /** Whether this chip can receive focus (used by the set's roving nav). */
  isFocusable(): boolean {
    return (this.interactive() || this.removable()) && !this.isDisabled();
  }

  /** Focuses the chip's primary focusable element. */
  focus(): void {
    const el = this.interactive() ? this.bodyEl() : this.removable() ? this.removeEl() : undefined;
    el?.nativeElement.focus();
  }

  /** True when the given DOM node lives inside this chip (roving nav). */
  contains(el: Element | null): boolean {
    return el != null && this.hostRef.nativeElement.contains(el);
  }

  protected onBodyClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.selectable()) {
      if (this.inCoordinatedSet()) {
        this.set!.toggle(this.value());
      } else {
        this.selected.set(!this.selected());
      }
    } else if (this.clickable()) {
      this.chipClick.emit(event);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.handleNavKeys(event);
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.removable()) {
      event.preventDefault();
      this.triggerRemove();
    }
  }

  protected onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.triggerRemove();
  }

  protected onRemoveKeydown(event: KeyboardEvent): void {
    // The remove ✕ is the primary focusable on a removable-only chip, so it
    // handles roving too. Enter/Space fire the native button click.
    this.handleNavKeys(event);
  }

  /** Arrow / Home / End roving inside a parent set. */
  private handleNavKeys(event: KeyboardEvent): void {
    if (!this.set || this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.set.focusNext();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.set.focusPrev();
        break;
      case 'Home':
        event.preventDefault();
        this.set.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.set.focusLast();
        break;
      default:
        break;
    }
  }

  private triggerRemove(): void {
    if (this.isDisabled() || this.removing()) {
      return;
    }
    this.set?.focusAfterRemoval(this);
    if (this.reducedMotion.reducedMotion()) {
      this.emitRemoved();
      return;
    }
    // Play the collapse animation, then emit on animationend (see SCSS). The
    // collapse animates max-width from the chip's real width down to 0 so the
    // neighbours slide in instead of jumping — hand the measurement to CSS.
    const host = this.hostRef.nativeElement;
    host.style.setProperty('--dm-chip-w', `${host.getBoundingClientRect().width}px`);
    this.removing.set(true);
  }

  protected onHostAnimationEnd(event: AnimationEvent): void {
    // Emulated encapsulation scopes keyframe names with a PREFIX
    // (`_ngcontent-xxx_dm-chip-collapse`), so match the tail, never the head.
    if (this.removing() && event.animationName.endsWith('dm-chip-collapse')) {
      this.emitRemoved();
    } else if (this.entering() && event.animationName.endsWith('dm-chip-in')) {
      this.entering.set(false);
    }
  }

  private emitRemoved(): void {
    if (this.removedEmitted) {
      return;
    }
    this.removedEmitted = true;
    this.removed.emit();
  }
}
