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

import { dmUid } from '../../../core/utils/uid';
import { SWITCH_DEFAULTS } from './switch.tokens';
import { DmSwitchColor, DmSwitchSize } from './switch.types';

/**
 * Toggle switch (`role="switch"`). Works standalone with `[(checked)]` and
 * with Angular forms via `ControlValueAccessor`.
 *
 * ```html
 * <dm-switch [(checked)]="notifications">Notifications</dm-switch>
 * <dm-switch [formControl]="control" ariaLabel="Dark mode" />
 * ```
 */
@Component({
  selector: 'dm-switch',
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmSwitchComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.data-color]': 'color()',
  },
})
export class DmSwitchComponent implements ControlValueAccessor {
  private readonly defaults = inject(SWITCH_DEFAULTS);
  private readonly uid = dmUid('dm-switch');

  /** Checked state. Two-way: `[(checked)]`. */
  readonly checked = model<boolean>(false);

  /** Semantic color of the checked track. */
  readonly color = input<DmSwitchColor>(this.defaults.color);

  /** Disables the control (combined with the forms `disabled` state). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Size scale. */
  readonly size = input<DmSwitchSize>(this.defaults.size);

  /** Id for the internal button, so external `<label for>` works. */
  readonly inputId = input<string>('');

  /** Accessible label when no visible label content is projected. */
  readonly ariaLabel = input<string>('');

  protected readonly labelId = `${this.uid}-label`;
  protected readonly buttonId = computed(() => this.inputId() || this.uid);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.checked.update((checked) => !checked);
    this.onChange(this.checked());
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
