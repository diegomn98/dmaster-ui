import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmStepIndicatorContext } from './step-indicator.directive';
import { DmStepperComponent } from './stepper.component';
import { DmStepState } from './stepper.types';

/**
 * A single step inside `<dm-stepper>`. Renders its own header button (indicator
 * + label) and its panel body (projected content), shown only while the step is
 * active. Not meant to be used standalone.
 *
 * ```html
 * <dm-step label="Shipping" optional [completed]="done()">
 *   <!-- panel body -->
 * </dm-step>
 * ```
 */
@Component({
  selector: 'dm-step',
  imports: [NgTemplateOutlet],
  templateUrl: './step.component.html',
  styleUrl: './step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dm-step',
    '[attr.data-orientation]': 'parent.orientation()',
    '[attr.data-state]': 'state()',
  },
})
export class DmStepComponent implements OnInit, OnDestroy {
  protected readonly parent = inject<DmStepperComponent>(forwardRef(() => DmStepperComponent));
  private readonly headerRef = viewChild<ElementRef<HTMLButtonElement>>('header');

  /** Stable ids for the header ↔ panel ARIA wiring. */
  protected readonly headerId = dmUid('dm-step');
  protected readonly panelId = dmUid('dm-step-panel');

  /** Short label shown in the step header. */
  readonly label = input<string>('');

  /** Marks the step as optional; renders the `optionalLabel` hint. */
  readonly optional = input(false, { transform: booleanAttribute });

  /** Free-text hint shown under the label when `optional`. Copy comes from the consumer. */
  readonly optionalLabel = input<string>('Optional');

  /** Whether the step has been completed (drives the check glyph + linear gating). */
  readonly completed = input(false, { transform: booleanAttribute });

  /** Flags the step as errored (warning glyph, danger accent). */
  readonly error = input(false, { transform: booleanAttribute });

  /** Disables the step: not selectable, skipped by keyboard navigation. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Zero-based position of this step within the parent. */
  readonly index = computed(() => this.parent.indexOf(this));

  /** True when this is the parent's active step. */
  readonly isActive = computed(() => this.parent.activeStep() === this.index());

  /** Whether the step can currently be activated (linear gating + disabled). */
  protected readonly reachable = computed(() => this.parent.isReachable(this.index()));

  /** Locked = not disabled outright, but blocked by linear progression. */
  protected readonly locked = computed(() => !this.disabled() && !this.reachable());

  /** Custom indicator template declared on the parent stepper, or `null` for the built-ins. */
  protected readonly indicatorTemplate = computed(
    () => this.parent._indicator()?.templateRef ?? null,
  );

  /** Context handed to the custom `dmStepIndicator` template. */
  protected readonly indicatorContext = computed<DmStepIndicatorContext>(() => ({
    index: this.index(),
    active: this.isActive(),
    completed: this.completed(),
    error: this.error(),
  }));

  /** Visual/interaction state reflected on the host. */
  readonly state = computed<DmStepState>(() => {
    if (this.disabled()) return 'disabled';
    if (this.error()) return 'error';
    if (this.isActive()) return 'active';
    if (this.completed()) return 'completed';
    return 'upcoming';
  });

  ngOnInit(): void {
    this.parent.registerStep(this);
  }

  ngOnDestroy(): void {
    this.parent.unregisterStep(this);
  }

  /** Focuses this step's header button (used by the parent for roving nav). */
  focus(): void {
    this.headerRef()?.nativeElement.focus();
  }

  protected onClick(): void {
    this.parent.select(this.index());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const vertical = this.parent.orientation() === 'vertical';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        this.parent.focusNext(this);
        return;
      case prevKey:
        event.preventDefault();
        this.parent.focusPrev(this);
        return;
      case 'Home':
        event.preventDefault();
        this.parent.focusFirst();
        return;
      case 'End':
        event.preventDefault();
        this.parent.focusLast();
        return;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.parent.select(this.index());
        return;
      default:
        return;
    }
  }
}
