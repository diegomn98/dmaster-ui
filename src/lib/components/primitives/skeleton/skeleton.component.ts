import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { DmCssSize } from '../../../core/types/common.types';
import { toCssSize } from '../../../core/utils/css';
import { SKELETON_DEFAULTS } from './skeleton.tokens';
import { DmSkeletonAnimation, DmSkeletonRounded, DmSkeletonVariant } from './skeleton.types';

/**
 * Loading placeholder that mirrors the shape of the content it replaces.
 *
 * ```html
 * <dm-skeleton />
 * <dm-skeleton variant="circular" [width]="48" [height]="48" />
 * <dm-skeleton variant="rounded" height="8rem" animation="wave" />
 * <dm-skeleton [count]="3" />
 * ```
 */
@Component({
  selector: 'dm-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-busy': 'true',
    'aria-live': 'polite',
  },
})
export class DmSkeletonComponent {
  private readonly defaults = inject(SKELETON_DEFAULTS);

  /** Shape of the placeholder. */
  readonly variant = input<DmSkeletonVariant>(this.defaults.variant);

  /** Width. Numbers are pixels; strings pass through (`'50%'`, `'clamp(...)'`). Defaults to the container width. */
  readonly width = input<DmCssSize | null>(null);

  /** Height. Numbers are pixels; strings pass through. Defaults per variant. */
  readonly height = input<DmCssSize | null>(null);

  /** Loading animation. */
  readonly animation = input<DmSkeletonAnimation>(this.defaults.animation);

  /** Border-radius scale, only meaningful with `variant="rounded"`. */
  readonly rounded = input<DmSkeletonRounded>(this.defaults.rounded);

  /** Number of placeholder lines/blocks to render. */
  readonly count = input<number>(this.defaults.count);

  protected readonly items = computed<undefined[]>(() =>
    Array.from({ length: Math.max(1, Math.floor(this.count())) }),
  );

  protected readonly cssWidth = computed(() => toCssSize(this.width()));
  protected readonly cssHeight = computed(() => toCssSize(this.height()));
}
