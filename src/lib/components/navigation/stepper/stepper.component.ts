import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { STEPPER_DEFAULTS } from './stepper.tokens';
import { DmStepperColor, DmStepperOrientation, DmStepperSize } from './stepper.types';
import type { DmStepComponent } from './step.component';

/**
 * Composite stepper container. Owns the active-step state, the ordered list of
 * projected `<dm-step>` children and the linear-progression rules. It is a
 * navigational list of steps — NOT a tablist: each step header is a `<button>`,
 * the active one carries `aria-current="step"`, and connects to its own panel
 * via `aria-controls` / `aria-labelledby`.
 *
 * ```html
 * <dm-stepper [(activeStep)]="step" color="primary" linear>
 *   <dm-step label="Account"><!-- panel body --></dm-step>
 *   <dm-step label="Shipping" [completed]="shippingDone()">…</dm-step>
 *   <dm-step label="Payment" optional>…</dm-step>
 * </dm-stepper>
 * ```
 */
@Component({
  selector: 'dm-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    class: 'dm-stepper',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-color]': 'color()',
    '[attr.data-size]': 'size()',
    '[attr.data-linear]': "linear() ? '' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class DmStepperComponent {
  private readonly defaults = inject(STEPPER_DEFAULTS);

  /** Zero-based index of the active step. Two-way: `[(activeStep)]`. */
  readonly activeStep = model<number>(0);

  /** Layout direction. */
  readonly orientation = input<DmStepperOrientation>(this.defaults.orientation);

  /**
   * Linear mode: a step further ahead than the active one can only be selected
   * once every step before it is `completed`. Going back is always allowed.
   */
  readonly linear = input(false, { transform: booleanAttribute });

  /** Semantic accent color of the active / completed indicators. */
  readonly color = input<DmStepperColor>(this.defaults.color);

  /** Size scale (indicator diameter + type). */
  readonly size = input<DmStepperSize>(this.defaults.size);

  /** Accessible label for the step list. */
  readonly ariaLabel = input<string>('');

  /**
   * Emitted when `next()` is called on the last reachable step — i.e. the user
   * confirmed the final step and the flow is done (wire a submit here).
   */
  readonly completed = output<void>();

  /** Registered `<dm-step>` children, in projection (DOM) order. @internal */
  readonly _steps = signal<DmStepComponent[]>([]);

  /** Number of registered steps. */
  readonly stepCount = computed(() => this._steps().length);

  /** @internal */
  registerStep(step: DmStepComponent): void {
    this._steps.update((list) => [...list, step]);
  }

  /** @internal */
  unregisterStep(step: DmStepComponent): void {
    this._steps.update((list) => list.filter((s) => s !== step));
  }

  /** Position of a step in the ordered list, or `-1` if not registered. @internal */
  indexOf(step: DmStepComponent): number {
    return this._steps().indexOf(step);
  }

  /**
   * Whether the step at `index` may be activated. Disabled steps never can;
   * in linear mode a step ahead of the active one needs every prior step
   * completed. Going to the current step or backwards is always allowed.
   */
  isReachable(index: number): boolean {
    const steps = this._steps();
    const step = steps[index];
    if (!step || step.disabled()) {
      return false;
    }
    if (!this.linear() || index <= this.activeStep()) {
      return true;
    }
    for (let i = 0; i < index; i++) {
      if (!steps[i]?.completed()) {
        return false;
      }
    }
    return true;
  }

  /** Activates the step at `index` (no-op if it is disabled or unreachable). */
  select(index: number): void {
    if (!this.isReachable(index)) {
      return;
    }
    this.activeStep.set(index);
  }

  /**
   * Advances to the next reachable step. When there is none (already on the
   * last reachable step), emits `(completed)` instead of doing nothing.
   */
  next(): void {
    const from = this.activeStep();
    const steps = this._steps();
    for (let i = from + 1; i < steps.length; i++) {
      if (this.isReachable(i)) {
        this.activeStep.set(i);
        return;
      }
    }
    this.completed.emit();
  }

  /** Returns to the previous enabled step, if any. */
  previous(): void {
    const from = this.activeStep();
    const steps = this._steps();
    for (let i = from - 1; i >= 0; i--) {
      if (!steps[i]?.disabled()) {
        this.activeStep.set(i);
        return;
      }
    }
  }

  // ---- Roving focus across the step headers ---------------------------------

  focusNext(from: DmStepComponent): void {
    this.moveFocus(from, 1);
  }

  focusPrev(from: DmStepComponent): void {
    this.moveFocus(from, -1);
  }

  focusFirst(): void {
    this._steps()
      .find((s) => !s.disabled())
      ?.focus();
  }

  focusLast(): void {
    const enabled = this._steps().filter((s) => !s.disabled());
    enabled[enabled.length - 1]?.focus();
  }

  private moveFocus(from: DmStepComponent, delta: 1 | -1): void {
    const enabled = this._steps().filter((s) => !s.disabled());
    if (enabled.length === 0) {
      return;
    }
    const idx = enabled.indexOf(from);
    const base = idx === -1 ? (delta === 1 ? -1 : 0) : idx;
    const nextIdx = (((base + delta) % enabled.length) + enabled.length) % enabled.length;
    enabled[nextIdx].focus();
  }
}
