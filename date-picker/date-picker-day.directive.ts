import { Directive, TemplateRef, inject } from '@angular/core';

/** Template context available inside an `ng-template[dmDatePickerDay]`. */
export interface DmDatePickerDayContext {
  /** The day being rendered, at local midnight (`let-date`). */
  $implicit: Date;
  /**
   * The day is part of the current selection: the picked day in single mode,
   * or an endpoint / day inside the confirmed band in range mode (mirrors the
   * cell's `aria-selected`).
   */
  selected: boolean;
  /** The day is blocked by `min` / `max` / `isDateDisabled`. */
  disabled: boolean;
  /** The day is today. */
  today: boolean;
  /** The day belongs to an adjacent month (leading/trailing filler cell). */
  outside: boolean;
}

/**
 * Custom day-cell template for `dm-date-picker`. Replaces the plain day number
 * INSIDE each day button — event dots, prices, availability badges — while the
 * button itself keeps every class, state attribute (`data-selected`,
 * `data-in-range`…), ARIA wiring and interaction (click/keyboard selection,
 * range preview, roving focus). Works in single and range mode.
 *
 * ```html
 * <dm-date-picker label="Availability" [(value)]="date">
 *   <ng-template dmDatePickerDay let-date let-selected="selected">
 *     {{ date.getDate() }}
 *     @if (hasEvent(date)) {
 *       <span class="dot"></span>
 *     }
 *   </ng-template>
 * </dm-date-picker>
 * ```
 *
 * The template controls the day's inner RENDERING only: selection, constraints
 * and focus still come from the picker's own inputs (`min`, `max`,
 * `isDateDisabled`…).
 */
@Directive({ selector: 'ng-template[dmDatePickerDay]' })
export class DmDatePickerDayDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmDatePickerDayContext>);
}
