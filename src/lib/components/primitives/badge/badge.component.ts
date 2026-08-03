import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { BADGE_DEFAULTS } from './badge.tokens';
import { DmBadgeAppearance, DmBadgeSize, DmBadgeVariant } from './badge.types';

/**
 * Status label. Pure theming on top of the semantic status tokens.
 *
 * ```html
 * <dm-badge>Draft</dm-badge>
 * <dm-badge variant="success" [dot]="true">Active</dm-badge>
 * <dm-badge variant="danger" appearance="solid">Blocked</dm-badge>
 * <dm-badge variant="primary" appearance="outline" [pill]="true">v0.1.0</dm-badge>
 * ```
 */
@Component({
  selector: 'dm-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-size]': 'size()',
    '[attr.data-pill]': "pill() ? '' : null",
  },
})
export class DmBadgeComponent {
  private readonly defaults = inject(BADGE_DEFAULTS);

  /** Semantic color. */
  readonly variant = input<DmBadgeVariant>(this.defaults.variant);

  /** Visual treatment. */
  readonly appearance = input<DmBadgeAppearance>(this.defaults.appearance);

  /** Size scale. */
  readonly size = input<DmBadgeSize>(this.defaults.size);

  /** Fully rounded corners. */
  readonly pill = input<boolean>(false);

  /** Leading status dot, so color is not the only state carrier. */
  readonly dot = input<boolean>(false);
}
