import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  input,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmErrorComponent } from '../error/error.component';
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
  /** A projected `<dm-error>`, if the consumer supplies one. */
  private readonly projectedError = contentChild(DmErrorComponent, { read: ElementRef });

  /** Visible label. */
  readonly label = input<string>('');

  /** Help text shown under the control (hidden while an error is shown). */
  readonly hint = input<string>('');

  /** Error text. Non-empty → error state (`aria-invalid`, `role="alert"`). */
  readonly error = input<string>('');

  /** Shows the required marker next to the label. */
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;
  private readonly projectedErrorId = `${this.uid}-errmsg`;

  /** Whether a `<dm-error>` is currently projected. */
  protected readonly hasProjectedError = computed(() => !!this.projectedError());

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

      // Ensure a projected error message has a stable id we can point at.
      const errEl = this.projectedError()?.nativeElement as HTMLElement | undefined;
      if (errEl && !errEl.id) {
        errEl.id = this.projectedErrorId;
      }

      const invalid = !!this.error() || this.hasProjectedError();
      el.setAttribute('aria-invalid', invalid ? 'true' : 'false');

      // Describe the control by whichever message is active: the `error` string,
      // then a projected <dm-error>, then the hint.
      const describedBy = this.error()
        ? this.errorId
        : errEl
          ? errEl.id
          : this.hint()
            ? this.hintId
            : null;
      if (describedBy) {
        el.setAttribute('aria-describedby', describedBy);
      } else {
        el.removeAttribute('aria-describedby');
      }
    });
  }
}
