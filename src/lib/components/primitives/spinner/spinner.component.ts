import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { toCssSize } from '../../../core/utils/css';
import { SPINNER_DEFAULTS } from './spinner.tokens';
import { DmSpinnerSize } from './spinner.types';

/**
 * Indeterminate loading indicator. Inherits `currentColor`, so it adapts to
 * any surface (buttons, inputs, empty states) without extra inputs.
 *
 * ```html
 * <dm-spinner />
 * <dm-spinner size="lg" label="Loading results" />
 * <dm-spinner size="1em" [strokeWidth]="3" />   <!-- inside a button -->
 * ```
 *
 * With no `label` it is treated as decorative (`aria-hidden`); pass `label`
 * to expose it as a `role="status"` live region.
 */
@Component({
  selector: 'dm-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "label() ? 'status' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[style.width]': 'cssSize()',
    '[style.height]': 'cssSize()',
  },
})
export class DmSpinnerComponent {
  private readonly defaults = inject(SPINNER_DEFAULTS);

  /** Named size (`sm | md | lg`), pixels (number) or CSS length (string). */
  readonly size = input<DmSpinnerSize>(this.defaults.size);

  /** Stroke width in viewBox units (24). */
  readonly strokeWidth = input<number>(this.defaults.strokeWidth);

  /** Accessible label. Empty → decorative (`aria-hidden="true"`). */
  readonly label = input<string>('');

  protected readonly cssSize = computed(() => {
    const size = this.size();
    if (size === 'sm') {
      return '1rem';
    }
    if (size === 'md') {
      return '1.5rem';
    }
    if (size === 'lg') {
      return '2rem';
    }
    return toCssSize(size) ?? '1.5rem';
  });
}
