import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmSpinnerComponent } from '../../primitives/spinner';
import { LOADING_BUTTON_DEFAULTS } from './loading-button.tokens';
import {
  DmLoadingButtonState,
  DmLoadingButtonType,
  DmLoadingButtonVariant,
} from './loading-button.types';

/**
 * Button with built-in loading / success / error states, stable width
 * (no layout shift) and screen-reader announcements via a polite live region.
 *
 * ```html
 * <dm-loading-button [state]="saving() ? 'loading' : 'idle'" (clicked)="save()">
 *   Save changes
 * </dm-loading-button>
 * ```
 *
 * The library ships no copy of its own: pass `loadingLabel` / `successLabel` /
 * `errorLabel` for the live announcements.
 */
@Component({
  selector: 'dm-loading-button',
  imports: [DmSpinnerComponent],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmLoadingButtonComponent {
  private readonly defaults = inject(LOADING_BUTTON_DEFAULTS);

  /** Visual style. */
  readonly variant = input<DmLoadingButtonVariant>(this.defaults.variant);

  /** Control size; heights follow the global density tokens. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Current state. `loading` disables the button and shows the spinner. */
  readonly state = input<DmLoadingButtonState>('idle');

  /** Disables the button (it is also disabled automatically while loading). */
  readonly disabled = input<boolean>(false);

  /** Native button type. */
  readonly type = input<DmLoadingButtonType>('button');

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
