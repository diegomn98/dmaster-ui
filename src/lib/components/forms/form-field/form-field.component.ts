import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmInputDirective } from './input.directive';

/**
 * Campo de formulario compuesto: label + control proyectado + hint/error.
 * Cablea automáticamente `id`, `for`, `aria-describedby` y `aria-invalid`
 * sobre el control `dmInput` proyectado.
 *
 * ```html
 * <dm-form-field label="Email" hint="Work address preferred" [required]="true">
 *   <input dmInput type="email" [formControl]="email" />
 * </dm-form-field>
 *
 * <dm-form-field label="Email" [error]="email.touched && email.invalid ? 'Invalid email' : ''">
 *   <input dmInput type="email" [formControl]="email" />
 * </dm-form-field>
 * ```
 */
@Component({
  selector: 'dm-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmFormFieldComponent {
  private readonly uid = dmUid('dm-form-field');
  private readonly inputRef = contentChild(DmInputDirective);

  /** Visible label. */
  readonly label = input<string>('');

  /** Help text shown under the control (hidden while `error` is set). */
  readonly hint = input<string>('');

  /** Error text. Non-empty → error state (`aria-invalid`, `role="alert"`). */
  readonly error = input<string>('');

  /** Shows the required marker next to the label. */
  readonly required = input<boolean>(false);

  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;
  protected readonly controlId = computed(() => {
    const el = this.inputRef()?.elementRef.nativeElement;
    return el?.id || `${this.uid}-control`;
  });

  constructor() {
    effect(() => {
      const el = this.inputRef()?.elementRef.nativeElement;
      if (!el) {
        return;
      }
      if (!el.id) {
        el.id = this.controlId();
      }
      el.setAttribute('aria-invalid', this.error() ? 'true' : 'false');

      const describedBy = this.error() ? this.errorId : this.hint() ? this.hintId : null;
      if (describedBy) {
        el.setAttribute('aria-describedby', describedBy);
      } else {
        el.removeAttribute('aria-describedby');
      }
    });
  }
}
