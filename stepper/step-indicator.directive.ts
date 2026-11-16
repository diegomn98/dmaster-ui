import { Directive, TemplateRef, inject } from '@angular/core';

/** Template context available inside an `ng-template[dmStepIndicator]`. */
export interface DmStepIndicatorContext {
  /** Zero-based position of the step (`let-index="index"`). */
  index: number;
  /** True while this is the stepper's active step. */
  active: boolean;
  /** Whether the step is marked `completed`. */
  completed: boolean;
  /** Whether the step is flagged `error`. */
  error: boolean;
}

/**
 * Custom indicator content for `dm-stepper`, declared ONCE on the stepper and
 * applied to EVERY step header. It replaces only the indicator's inner content
 * (the number / check / error glyph); the indicator circle, its `data-state`
 * styling hooks and the header `<button>` semantics stay untouched.
 *
 * ```html
 * <dm-stepper [(activeStep)]="step">
 *   <ng-template dmStepIndicator let-index="index" let-completed="completed">
 *     @if (completed) {
 *       <dm-icon size="1em">check_circle</dm-icon>
 *     } @else {
 *       {{ index + 1 }}
 *     }
 *   </ng-template>
 *   <dm-step label="Account">…</dm-step>
 *   <dm-step label="Shipping">…</dm-step>
 * </dm-stepper>
 * ```
 */
@Directive({ selector: 'ng-template[dmStepIndicator]' })
export class DmStepIndicatorDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmStepIndicatorContext>);
}
