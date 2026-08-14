import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { PROGRESS_DEFAULTS } from './progress.tokens';
import { DmProgressColor, DmProgressFormatFn, DmProgressSize } from './progress.types';

/** Default value label: rounded percentage of the covered range. */
const DEFAULT_FORMAT_VALUE: DmProgressFormatFn = (value, max) =>
  max > 0 ? `${Math.round((value / max) * 100)}%` : '0%';

/**
 * Linear progress bar with an optional label row, determinate and
 * indeterminate modes, semantic colors and a striped fill.
 *
 * ```html
 * <dm-progress [value]="64" label="Uploading" [showValueLabel]="true" />
 * <dm-progress [value]="30" color="success" size="lg" />
 * <dm-progress label="Syncing" />                       <!-- indeterminate -->
 * <dm-progress [value]="70" [striped]="true" />
 * ```
 */
@Component({
  selector: 'dm-progress',
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clampedValue()',
    '[attr.aria-valuetext]': 'indeterminate() ? null : displayValue()',
    '[attr.aria-label]': 'resolvedAriaLabel()',
    '[attr.data-color]': 'color()',
    '[attr.data-size]': 'size()',
    '[attr.data-striped]': "striped() ? '' : null",
    '[attr.data-indeterminate]': "indeterminate() ? '' : null",
  },
})
export class DmProgressComponent {
  private readonly defaults = inject(PROGRESS_DEFAULTS);

  /** Current value. `null` renders the indeterminate sweep. */
  readonly value = input<number | null>(null);

  /** Upper bound of the range (the lower bound is always 0). */
  readonly max = input<number>(100);

  /** Semantic color of the fill. */
  readonly color = input<DmProgressColor>(this.defaults.color);

  /** Track thickness. */
  readonly size = input<DmProgressSize>(this.defaults.size);

  /** Text shown above the bar. */
  readonly label = input<string>('');

  /** Shows the formatted value at the end of the label row. */
  readonly showValueLabel = input<boolean>(false);

  /** Formats the value label. Defaults to a rounded percentage (`73%`). */
  readonly formatValue = input<DmProgressFormatFn>(DEFAULT_FORMAT_VALUE);

  /** Overlays diagonal stripes on the fill. */
  readonly striped = input<boolean>(false);

  /** Accessible name. Falls back to `label`. */
  readonly ariaLabel = input<string>('');

  protected readonly indeterminate = computed(() => this.value() === null);

  /** Value clamped to `[0, max]` — drives both the fill width and ARIA. */
  protected readonly clampedValue = computed(() => {
    const max = Math.max(this.max(), 0);
    return Math.min(Math.max(this.value() ?? 0, 0), max);
  });

  protected readonly percent = computed(() => {
    const max = this.max();
    return max > 0 ? (this.clampedValue() / max) * 100 : 0;
  });

  protected readonly displayValue = computed(() =>
    this.formatValue()(this.clampedValue(), this.max()),
  );

  protected readonly resolvedAriaLabel = computed(() => this.ariaLabel() || this.label() || null);

  protected readonly hasLabelRow = computed(
    () => !!this.label() || (this.showValueLabel() && !this.indeterminate()),
  );
}
