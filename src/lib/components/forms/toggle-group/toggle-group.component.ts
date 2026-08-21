import {
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

import { TOGGLE_GROUP_DEFAULTS } from './toggle-group.tokens';
import {
  DmToggleGroupColor,
  DmToggleGroupOrientation,
  DmToggleGroupSize,
} from './toggle-group.types';
import type { DmToggleComponent } from './toggle.component';

/**
 * Segmented control / toggle group. Wraps a row of `<dm-toggle>` items inside a
 * single flat, rounded surface. Two independent modes:
 *
 * - **single** (default) — behaves like a radio group: one active segment,
 *   `[(value)]`, `role="radiogroup"` with a roving-tabindex arrow-key model.
 * - **multiple** (bare `multiple` attribute) — independent on/off toggles,
 *   `[(values)]` (an array), `role="group"` with `aria-pressed` buttons.
 *
 * Both models are separate so switching to `multiple` never rewrites the
 * single `value`. Integrates with Angular forms via `ControlValueAccessor`
 * (the written value is the single value, or the array in multiple mode).
 *
 * ```html
 * <dm-toggle-group [(value)]="view" ariaLabel="Layout">
 *   <dm-toggle value="list">List</dm-toggle>
 *   <dm-toggle value="grid">Grid</dm-toggle>
 * </dm-toggle-group>
 *
 * <dm-toggle-group multiple [(values)]="format" ariaLabel="Text format">
 *   <dm-toggle value="bold" ariaLabel="Bold"><strong>B</strong></dm-toggle>
 *   <dm-toggle value="italic" ariaLabel="Italic"><em>I</em></dm-toggle>
 * </dm-toggle-group>
 * ```
 */
@Component({
  selector: 'dm-toggle-group',
  templateUrl: './toggle-group.component.html',
  styleUrl: './toggle-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmToggleGroupComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[attr.aria-label]': 'ariaLabel() || null',
    // aria-orientation is only a supported attribute on role="radiogroup" —
    // role="group" (multiple mode) doesn't allow it (axe: aria-allowed-attr).
    '[attr.aria-orientation]': 'multiple() ? null : orientation()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-size]': 'size()',
    '[attr.data-color]': 'color()',
    '[attr.data-full-width]': 'fullWidth() ? "true" : null',
  },
})
export class DmToggleGroupComponent implements ControlValueAccessor {
  private readonly defaults = inject(TOGGLE_GROUP_DEFAULTS);

  /** Multi-select mode: independent toggles instead of one exclusive choice. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Selected value in single mode. Two-way: `[(value)]`. Ignored when multiple. */
  readonly value = model<unknown>(null);

  /** Selected values in multiple mode. Two-way: `[(values)]`. Ignored when single. */
  readonly values = model<unknown[]>([]);

  /** Disables every segment (combined with the forms `disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Semantic color of the selected segment(s). */
  readonly color = input<DmToggleGroupColor>(this.defaults.color);

  /** Control size applied to every segment. */
  readonly size = input<DmToggleGroupSize>(this.defaults.size);

  /** Layout direction of the segments. */
  readonly orientation = input<DmToggleGroupOrientation>(this.defaults.orientation);

  /** Stretches the group to fill its container, segments sharing the width. */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  /** Accessible label of the group when there's no visible caption. */
  readonly ariaLabel = input<string>('');

  /** Registered `<dm-toggle>` children — internal, used for roving tabindex. */
  readonly _registeredToggles = signal<DmToggleComponent[]>([]);

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  register(toggle: DmToggleComponent): void {
    this._registeredToggles.update((toggles) => [...toggles, toggle]);
  }

  unregister(toggle: DmToggleComponent): void {
    this._registeredToggles.update((toggles) => toggles.filter((t) => t !== toggle));
  }

  /** True when the given value is currently selected (either mode). */
  isSelected(value: unknown): boolean {
    return this.multiple() ? this.values().includes(value) : this.value() === value;
  }

  /** Single mode: exclusive select. Multiple mode: toggle membership. */
  activate(value: unknown): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.multiple()) {
      const next = this.values().includes(value)
        ? this.values().filter((v) => v !== value)
        : [...this.values(), value];
      this.values.set(next);
      this.onChange(next);
    } else if (this.value() !== value) {
      this.value.set(value);
      this.onChange(value);
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
    this.focusIndex(this.enabledToggles().length - 1);
  }

  private enabledToggles(): DmToggleComponent[] {
    return this._registeredToggles().filter((t) => !t.isDisabled());
  }

  private focusRelative(step: number): void {
    const toggles = this.enabledToggles();
    if (!toggles.length) {
      return;
    }
    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    let currentIdx = toggles.findIndex((t) => t.contains(activeEl));
    if (currentIdx === -1) {
      currentIdx = toggles.findIndex((t) => t.selected());
    }
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + step + toggles.length) % toggles.length;
    this.focusIndex(nextIdx);
  }

  private focusIndex(index: number): void {
    const toggles = this.enabledToggles();
    if (!toggles.length) {
      return;
    }
    const wrapped = ((index % toggles.length) + toggles.length) % toggles.length;
    const target = toggles[wrapped];
    target.focus();
    // Single mode follows the radio roving convention: arrows move AND select.
    // Multiple mode only moves focus; toggling stays on Space/Enter.
    if (!this.multiple()) {
      this.activate(target.value());
    }
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: unknown): void {
    if (this.multiple()) {
      this.values.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(value);
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
