import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmSpinnerComponent } from '../../primitives/spinner';
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

  /** Semantic color. */
  readonly color = input<DmButtonColor>(this.defaults.color);

  /** Visual variant. */
  readonly variant = input<DmButtonVariant>(this.defaults.variant);

  /** Corner rounding. `full` is pill-shaped. */
  readonly radius = input<DmButtonRadius>(this.defaults.radius);

  /** Control size; heights follow the 32/40/48px scale. */
  readonly size = input<DmSize>(this.defaults.size);

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

  /** Emitted on click, only while the button is interactive. */
  readonly clicked = output<MouseEvent>();

  protected readonly isLoading = computed(() => this.state() === 'loading');
  protected readonly isDisabled = computed(() => this.disabled() || this.isLoading());

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
