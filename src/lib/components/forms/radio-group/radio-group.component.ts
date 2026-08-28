import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { RADIO_DEFAULTS } from './radio-group.tokens';
import { DmRadioColor, DmRadioOrientation, DmRadioSize } from './radio-group.types';
import type { DmRadioComponent } from './radio.component';

/**
 * Radio group (single choice). Wraps a list of `<dm-radio>` items, manages the
 * selected value with a roving-tabindex ARIA pattern and integrates with
 * Angular forms via `ControlValueAccessor`. A hidden input carries the value
 * inside a plain `<form>`.
 *
 * ```html
 * <dm-radio-group name="plan" [(value)]="plan" ariaLabel="Pricing plan">
 *   <dm-radio value="free">Free</dm-radio>
 *   <dm-radio value="pro">Pro</dm-radio>
 * </dm-radio-group>
 *
 * <dm-radio-group name="theme" [formControl]="theme" color="secondary">
 *   <dm-radio value="light">Light</dm-radio>
 *   <dm-radio value="dark">Dark</dm-radio>
 * </dm-radio-group>
 * ```
 */
@Component({
  selector: 'dm-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class DmRadioGroupComponent implements ControlValueAccessor {
  private readonly defaults = inject(RADIO_DEFAULTS);
  private readonly document = inject(DOCUMENT);

  /** Attribute `name` used by the hidden input for plain `<form>` submission. */
  readonly name = input.required<string>();

  /** Currently selected value. Two-way: `[(value)]`. */
  readonly value = model<unknown>(null);

  /** Disables every radio in the group (combined with the forms `disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Semantic color applied to every child radio. */
  readonly color = input<DmRadioColor>(this.defaults.color);

  /** Size applied to every child radio. */
  readonly size = input<DmRadioSize>(this.defaults.size);

  /** Layout direction of the radio items. */
  readonly orientation = input<DmRadioOrientation>(this.defaults.orientation);

  /** Accessible label of the group when there's no visible caption. */
  readonly ariaLabel = input<string>('');

  /** Registered `<dm-radio>` children — internal, used for roving tabindex. */
  readonly _registeredRadios = signal<DmRadioComponent[]>([]);

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  register(radio: DmRadioComponent): void {
    this._registeredRadios.update((radios) => [...radios, radio]);
  }

  unregister(radio: DmRadioComponent): void {
    this._registeredRadios.update((radios) => radios.filter((r) => r !== radio));
  }

  select(value: unknown): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.value() !== value) {
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
    this.focusIndex(this.enabledRadios().length - 1);
  }

  private enabledRadios(): DmRadioComponent[] {
    return this._registeredRadios().filter((r) => !r.isDisabled());
  }

  private focusRelative(step: number): void {
    const radios = this.enabledRadios();
    if (!radios.length) {
      return;
    }
    // Find the radio that currently owns focus; fall back to the selected one.
    const activeEl = this.document.activeElement;
    let currentIdx = radios.findIndex((r) => r.contains(activeEl));
    if (currentIdx === -1) {
      currentIdx = radios.findIndex((r) => r.checked());
    }
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + step + radios.length) % radios.length;
    this.focusIndex(nextIdx);
  }

  private focusIndex(index: number): void {
    const radios = this.enabledRadios();
    if (!radios.length) {
      return;
    }
    const wrapped = ((index % radios.length) + radios.length) % radios.length;
    const target = radios[wrapped];
    target.focus();
    // Roving pattern: arrow keys select AND move focus (WAI-ARIA convention).
    this.select(target.value());
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(value);
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
