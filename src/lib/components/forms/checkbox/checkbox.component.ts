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

import { CHECKBOX_DEFAULTS } from './checkbox.tokens';
import { DmCheckboxSize } from './checkbox.types';

/**
 * Checkbox sobre un `<input type="checkbox">` nativo (semántica de
 * formulario intacta) con caja custom. Soporta estado indeterminado y
 * Angular forms vía `ControlValueAccessor`.
 *
 * ```html
 * <dm-checkbox [(checked)]="accepted">Accept the terms</dm-checkbox>
 * <dm-checkbox [formControl]="control" [indeterminate]="someSelected" />
 * ```
 */
@Component({
  selector: 'dm-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmCheckboxComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class DmCheckboxComponent implements ControlValueAccessor {
  private readonly defaults = inject(CHECKBOX_DEFAULTS);

  /** Checked state. Two-way: `[(checked)]`. */
  readonly checked = model<boolean>(false);

  /** Visual indeterminate state (shown while not checked). */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  /** Disables the control (combined with the forms `disabled` state). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Size scale. */
  readonly size = input<DmCheckboxSize>(this.defaults.size);

  /** Id for the native input, so external `<label for>` works. */
  readonly inputId = input<string>('');

  /** Accessible label when no visible label content is projected. */
  readonly ariaLabel = input<string>('');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly showIndeterminate = computed(() => this.indeterminate() && !this.checked());

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected onNativeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: unknown): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
