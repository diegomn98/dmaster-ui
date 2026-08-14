import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { DIVIDER_DEFAULTS } from './divider.tokens';
import { DmDividerLabelPlacement, DmDividerOrientation } from './divider.types';

/**
 * Thin rule that separates content, with an optional projected label.
 *
 * ```html
 * <dm-divider />
 * <dm-divider>OR</dm-divider>
 * <dm-divider labelPlacement="start">Billing</dm-divider>
 * <dm-divider orientation="vertical" />
 * ```
 *
 * Without projected content it renders a single continuous line; with content
 * the line splits around the label according to `labelPlacement`.
 */
@Component({
  selector: 'dm-divider',
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-label-placement]': 'labelPlacement()',
  },
})
export class DmDividerComponent {
  private readonly defaults = inject(DIVIDER_DEFAULTS);

  /** Direction of the line. `vertical` stretches to the parent's cross size. */
  readonly orientation = input<DmDividerOrientation>(this.defaults.orientation);

  /** Where the projected label sits along the line. */
  readonly labelPlacement = input<DmDividerLabelPlacement>(this.defaults.labelPlacement);
}
