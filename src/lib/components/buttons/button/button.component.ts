import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmSpinnerComponent } from '../../primitives/spinner';
import { DM_BUTTON_GROUP } from '../button-group/button-group.types';
import { BUTTON_DEFAULTS } from './button.tokens';
import {
  DmButtonColor,
  DmButtonRadius,
  DmButtonState,
  DmButtonType,
  DmButtonVariant,
} from './button.types';

/**
 * Button with a color × variant API and built-in loading /
 * success / error states. Stable width (no layout shift), integrated spinner
 * and screen-reader announcements via a polite live region.
 *
 * ```html
 * <dm-button color="primary" variant="shadow" (clicked)="save()">
 *   Save changes
 * </dm-button>
 *
 * <!-- Common case: a boolean drives the spinner + disabled state. -->
 * <dm-button [loading]="saving()" (clicked)="save()">Save</dm-button>
 *
 * <!-- Advanced: the full idle → loading → success → error machine. -->
 * <dm-button color="danger" variant="flat" [state]="state()">
 *   Delete
 * </dm-button>
 * ```
 *
 * Inside a `<dm-button-group>`, appearance not set on the button itself is
 * inherited from the group (`color`, `variant`, `size`, `radius`, `disabled`).
 *
 * The library ships no copy of its own: pass `loadingLabel` / `successLabel` /
 * `errorLabel` for the live announcements.
 */
@Component({
  selector: 'dm-button',
  imports: [DmSpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmButtonComponent {
  private readonly defaults = inject(BUTTON_DEFAULTS);

  /** Optional parent group; group-level appearance cascades to this button. */
  private readonly group = inject(DM_BUTTON_GROUP, { optional: true });

  /** Semantic color. Unset inside a group → inherits the group's. */
  readonly color = input<DmButtonColor | undefined>(undefined);

  /** Visual variant. Unset inside a group → inherits the group's. */
  readonly variant = input<DmButtonVariant | undefined>(undefined);

  /** Corner rounding. `full` is pill-shaped. Unset inside a group → inherits. */
  readonly radius = input<DmButtonRadius | undefined>(undefined);

  /** Control size; heights follow the 32/40/48px scale. Unset inside a group → inherits. */
  readonly size = input<DmSize | undefined>(undefined);

  /**
   * Shows the spinner and disables the button while `true`. The ergonomic
   * shortcut for the common async case — accepts a bare attribute
   * (`<dm-button loading>`). For the full idle → loading → success → error
   * flow, use {@link state} instead.
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Full state machine: `loading` disables the button and shows the spinner;
   * `success` / `error` flash an icon. An explicit non-`idle` value takes
   * precedence over the boolean {@link loading}. For a simple spinner, prefer
   * `loading`.
   */
  readonly state = input<DmButtonState>('idle');

  /** Disables the button (it is also disabled automatically while loading). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Native button type. */
  readonly type = input<DmButtonType>('button');

  /**
   * Renders the button as a compact square (width equals height) instead of a
   * text pill — it drops the min-width and horizontal padding so an icon-only
   * button doesn't stretch to a label's width. Pair it with `ariaLabel` for the
   * accessible name. Use it whenever the button holds only a glyph.
   */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  /** Announced to screen readers while loading. */
  readonly loadingLabel = input<string>('');

  /** Announced on success. */
  readonly successLabel = input<string>('');

  /** Announced on error. */
  readonly errorLabel = input<string>('');

  /**
   * Accessible name for the inner `<button>`. Required for icon-only buttons,
   * whose glyph carries no text — set this so screen readers announce the
   * action. Placed on the real button, not the host wrapper.
   */
  readonly ariaLabel = input<string>('');

  /** Emitted on click, only while the button is interactive. */
  readonly clicked = output<MouseEvent>();

  // Resolution order: own input → parent group → injected defaults.
  protected readonly resolvedColor = computed<DmButtonColor>(
    () => this.color() ?? this.group?.color() ?? this.defaults.color,
  );

  protected readonly resolvedVariant = computed<DmButtonVariant>(
    () => this.variant() ?? this.group?.variant() ?? this.defaults.variant,
  );

  protected readonly resolvedRadius = computed<DmButtonRadius>(
    () => this.radius() ?? this.group?.radius() ?? this.defaults.radius,
  );

  protected readonly resolvedSize = computed<DmSize>(
    () => this.size() ?? this.group?.size() ?? this.defaults.size,
  );

  /**
   * Effective state driving the view. An explicit non-`idle` `state` wins
   * (keeps the success/error machine working); otherwise the boolean `loading`
   * shortcut promotes to `loading`.
   */
  protected readonly resolvedState = computed<DmButtonState>(() => {
    const state = this.state();
    if (state !== 'idle') return state;
    return this.loading() ? 'loading' : 'idle';
  });

  protected readonly isLoading = computed(() => this.resolvedState() === 'loading');
  protected readonly isDisabled = computed(
    () => this.disabled() || this.isLoading() || (this.group?.isDisabled() ?? false),
  );

  protected readonly liveMessage = computed(() => {
    switch (this.resolvedState()) {
      case 'loading':
        return this.loadingLabel();
      case 'success':
        return this.successLabel();
      case 'error':
        return this.errorLabel();
      default:
        return '';
    }
  });

  protected onClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.clicked.emit(event);
    }
  }
}
