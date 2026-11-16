import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
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
 *   The selection is drawn by ONE sliding thumb that glides between segments.
 * - **multiple** (bare `multiple` attribute) — independent on/off toggles,
 *   `[(values)]` (an array), `role="group"` with `aria-pressed` buttons; each
 *   pressed segment fills on its own.
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
    '[attr.data-thumb]': 'hasThumb() ? "" : null',
    '[attr.data-thumb-ready]': 'thumbReady() ? "" : null',
  },
})
export class DmToggleGroupComponent implements ControlValueAccessor {
  private readonly defaults = inject(TOGGLE_GROUP_DEFAULTS);
  private readonly document = inject(DOCUMENT);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

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

  /**
   * True once the sliding thumb has been measured onto the selected segment
   * (single mode, browser only). While false — server render, multiple mode,
   * nothing selected — each segment draws its own fill, so the prerendered
   * HTML already shows the selection and hydration never flashes.
   */
  readonly hasThumb = signal(false);

  /** Set one frame after the first geometry painted, so the thumb never slides in from 0. */
  protected readonly thumbReady = signal(false);

  /** Bumped by the ResizeObserver so the thumb re-measures on resize / font load. */
  private readonly resizeTick = signal(0);
  private resizeObserver: ResizeObserver | undefined;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    // Re-position the thumb after every render that can move the selected
    // segment: selection, mode, layout inputs, (un)registration, resize.
    afterRenderEffect(() => {
      this.value();
      this.multiple();
      this.orientation();
      this.size();
      this.fullWidth();
      this._registeredToggles();
      this.resizeTick();
      this.positionThumb();
    });

    // Segment widths change without a signal (font load, container resize,
    // a label switching language) — observe the track and every segment.
    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win?.ResizeObserver) return;
      this.resizeObserver = new win.ResizeObserver(() => this.resizeTick.update((n) => n + 1));
      this.resizeObserver.observe(this.hostRef.nativeElement);
      this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
      this.resizeTick.update((n) => n + 1);
    });
  }

  /** Measures the selected segment and writes the thumb geometry as CSS variables. */
  private positionThumb(): void {
    const selected = this.multiple()
      ? undefined
      : this._registeredToggles().find((t) => t.selected());
    if (!selected) {
      this.hasThumb.set(false);
      return;
    }
    for (const toggle of this._registeredToggles()) {
      this.resizeObserver?.observe(toggle.hostElement);
    }
    // Offsets are relative to the group's padding box (the host is positioned),
    // which is also where the absolutely positioned thumb originates.
    const el = selected.hostElement;
    const style = this.hostRef.nativeElement.style;
    style.setProperty('--dm-tg-x', `${el.offsetLeft}px`);
    style.setProperty('--dm-tg-y', `${el.offsetTop}px`);
    style.setProperty('--dm-tg-w', `${el.offsetWidth}px`);
    style.setProperty('--dm-tg-h', `${el.offsetHeight}px`);
    if (!this.hasThumb()) {
      this.hasThumb.set(true);
      if (!this.thumbReady()) {
        const win = this.document.defaultView;
        if (win) win.requestAnimationFrame(() => this.thumbReady.set(true));
      }
    }
  }

  register(toggle: DmToggleComponent): void {
    this._registeredToggles.update((toggles) => [...toggles, toggle]);
  }

  unregister(toggle: DmToggleComponent): void {
    this.resizeObserver?.unobserve(toggle.hostElement);
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
    const activeEl = this.document.activeElement;
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
