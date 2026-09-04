import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmChipSetSelection } from './chip.types';
import type { DmChipComponent } from './chip.component';

/**
 * Container for a group of `<dm-chip>`. Three jobs:
 *
 * 1. **Layout** — a wrapping, gapped row of chips.
 * 2. **Keyboard** — roving tabindex: `←`/`→` (`↑`/`↓`) move focus between chips,
 *    `Home`/`End` jump to the ends. When a chip is removed, focus moves to the
 *    next (or previous) chip so keyboard users never lose their place.
 * 3. **Selection** (optional) — coordinates its selectable chips:
 *    - `single` — choice chips, one at a time, `[(value)]`.
 *    - `multiple` — filter chips, any number, `[(values)]`.
 *    - `none` (default) — pure layout/keyboard; each chip owns its `[(selected)]`.
 *
 * Integrates with Angular forms via `ControlValueAccessor` (the single value,
 * or the array in multiple mode) whenever a selection mode is set.
 *
 * ```html
 * <dm-chip-set selection="multiple" [(values)]="tags" ariaLabel="Filters">
 *   <dm-chip selectable value="new">New</dm-chip>
 *   <dm-chip selectable value="sale">On sale</dm-chip>
 * </dm-chip-set>
 * ```
 */
@Component({
  selector: 'dm-chip-set',
  template: '<ng-content />',
  styleUrl: './chip-set.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmChipSetComponent),
      multi: true,
    },
  ],
  host: {
    // A group of chips. Selection is expressed on each chip (aria-pressed on
    // its toggle button), so the set stays a plain group — role="group" doesn't
    // allow aria-orientation/aria-multiselectable, which keeps axe happy.
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
  },
})
export class DmChipSetComponent implements ControlValueAccessor {
  private readonly document = inject(DOCUMENT);

  /** Selection coordination mode. `none` = layout + keyboard only. */
  readonly selection = input<DmChipSetSelection>('none');

  /** Selected value in `single` mode. Two-way: `[(value)]`. */
  readonly value = model<unknown>(null);

  /** Selected values in `multiple` mode. Two-way: `[(values)]`. */
  readonly values = model<unknown[]>([]);

  /** Disables every chip in the set (combined with the forms `disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible label of the set when there's no visible caption. */
  readonly ariaLabel = input<string>('');

  /** Registered `<dm-chip>` children — internal, used for roving tabindex. */
  readonly _registeredChips = signal<DmChipComponent[]>([]);

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /**
   * Flips to true once the set has painted. Chips registered after that were
   * added to a live set (user action) and play the entrance animation; the
   * initial render never pops. Browser-only by construction (`afterNextRender`
   * never runs on the server).
   */
  private readonly settled = signal(false);

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    afterNextRender(() => this.settled.set(true));
  }

  /** True once the initial render is done — later-registered chips animate in. */
  isSettled(): boolean {
    return this.settled();
  }

  register(chip: DmChipComponent): void {
    this._registeredChips.update((chips) => [...chips, chip]);
  }

  unregister(chip: DmChipComponent): void {
    this._registeredChips.update((chips) => chips.filter((c) => c !== chip));
  }

  /** True when the given chip value is currently selected (single/multiple). */
  isSelected(value: unknown): boolean {
    return this.selection() === 'multiple'
      ? this.values().includes(value)
      : this.value() === value;
  }

  /** Single mode: exclusive select. Multiple mode: toggle membership. */
  toggle(value: unknown): void {
    if (this.isDisabled() || this.selection() === 'none') {
      return;
    }
    if (this.selection() === 'multiple') {
      const next = this.values().includes(value)
        ? this.values().filter((v) => v !== value)
        : [...this.values(), value];
      this.values.set(next);
      this.onChange(next);
    } else {
      // single: clicking the selected chip clears it (toggle-off).
      const next = this.value() === value ? null : value;
      this.value.set(next);
      this.onChange(next);
    }
    this.onTouched();
  }

  focusNext(): void {
    this.focusRelative(1);
  }

  focusPrev(): void {
    this.focusRelative(-1);
  }

  focusFirst(): void {
    this.focusIndex(0);
  }

  focusLast(): void {
    this.focusIndex(this.focusableChips().length - 1);
  }

  /**
   * After a chip is removed, put focus on its neighbour (next, else previous)
   * so keyboard users keep a sensible position. Called by the chip itself
   * right before it emits `(removed)`.
   */
  focusAfterRemoval(removed: DmChipComponent): void {
    const chips = this.focusableChips();
    const idx = chips.indexOf(removed);
    const rest = chips.filter((c) => c !== removed);
    if (!rest.length) {
      return;
    }
    const target = rest[Math.min(idx, rest.length - 1)] ?? rest[0];
    // Defer: the removed chip may still be in the DOM this tick.
    queueMicrotask(() => target.focus());
  }

  private focusableChips(): DmChipComponent[] {
    return this._registeredChips().filter((c) => c.isFocusable());
  }

  private focusRelative(step: number): void {
    const chips = this.focusableChips();
    if (!chips.length) {
      return;
    }
    const activeEl = this.document.activeElement;
    const currentIdx = chips.findIndex((c) => c.contains(activeEl));
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + step + chips.length) % chips.length;
    this.focusIndex(nextIdx);
  }

  private focusIndex(index: number): void {
    const chips = this.focusableChips();
    if (!chips.length) {
      return;
    }
    const wrapped = ((index % chips.length) + chips.length) % chips.length;
    chips[wrapped].focus();
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: unknown): void {
    if (this.selection() === 'multiple') {
      this.values.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(value ?? null);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
