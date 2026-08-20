import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

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

  /** Current state. `loading` disables the button and shows the spinner. */
  readonly state = input<DmButtonState>('idle');

  /** Disables the button (it is also disabled automatically while loading). */
  readonly disabled = input<boolean>(false);

  /** Native button type. */
  readonly type = input<DmButtonType>('button');

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

  protected readonly isLoading = computed(() => this.state() === 'loading');
  protected readonly isDisabled = computed(
    () => this.disabled() || this.isLoading() || (this.group?.isDisabled() ?? false),
  );

  protected readonly liveMessage = computed(() => {
    switch (this.state()) {
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
