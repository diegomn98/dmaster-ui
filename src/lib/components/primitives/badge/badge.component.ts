import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { BADGE_DEFAULTS } from './badge.tokens';
import { DmBadgeColor, DmBadgeRadius, DmBadgeSize, DmBadgeVariant } from './badge.types';

/**
 * Chip / status label with a color × variant API.
 *
 * ```html
 * <dm-badge>Draft</dm-badge>
 * <dm-badge color="success" variant="dot">Active</dm-badge>
 * <dm-badge color="danger" variant="solid">Blocked</dm-badge>
 * <dm-badge color="primary" variant="bordered">v0.1.0</dm-badge>
 * ```
 */
@Component({
  selector: 'dm-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-color]': 'color()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-radius]': 'radius()',
  },
})
export class DmBadgeComponent {
  private readonly defaults = inject(BADGE_DEFAULTS);

  /** Semantic color. */
  readonly color = input<DmBadgeColor>(this.defaults.color);

  /** Visual variant. `dot` shows a leading status dot. */
  readonly variant = input<DmBadgeVariant>(this.defaults.variant);

  /** Size scale. */
  readonly size = input<DmBadgeSize>(this.defaults.size);

  /** Corner rounding. `full` is pill-shaped. */
  readonly radius = input<DmBadgeRadius>(this.defaults.radius);

  protected readonly showDot = computed(() => this.variant() === 'dot');
}
