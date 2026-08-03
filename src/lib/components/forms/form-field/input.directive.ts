import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Aplica el estilo de campo de la librería a controles nativos y permite a
 * `dm-form-field` cablear ids y atributos ARIA automáticamente.
 *
 * Los estilos de `.dm-input` son globales (styles/_forms.scss): una directiva
 * no puede llevar hoja de estilos propia.
 *
 * ```html
 * <input dmInput type="email" />
 * <textarea dmInput rows="4"></textarea>
 * <select dmInput>…</select>
 * ```
 */
@Directive({
  selector: 'input[dmInput], textarea[dmInput], select[dmInput]',
  host: { class: 'dm-input' },
})
export class DmInputDirective {
  /** Elemento nativo, expuesto para el cableado de `dm-form-field`. */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
