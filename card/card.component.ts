import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { CARD_DEFAULTS } from './card.tokens';
import { DmCardAppearance, DmCardPadding } from './card.types';

/**
 * Surface primitive. Declares `container-type: inline-size`, so content can
 * use container queries to adapt to the card, not the viewport.
 *
 * ```html
 * <dm-card>…</dm-card>
 * <dm-card appearance="outlined" padding="lg">…</dm-card>
 * <dm-card [interactive]="true">…</dm-card>
 * ```
 */
@Component({
  selector: 'dm-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-padding]': 'padding()',
    '[attr.data-interactive]': "interactive() ? '' : null",
  },
})
export class DmCardComponent {
  private readonly defaults = inject(CARD_DEFAULTS);

  /** Surface treatment. */
  readonly appearance = input<DmCardAppearance>(this.defaults.appearance);

  /** Inner padding scale. */
  readonly padding = input<DmCardPadding>(this.defaults.padding);

  /** Hover lift for clickable cards (wrap in `<a>`/`<button>` or handle click outside). */
  readonly interactive = input(false, { transform: booleanAttribute });
}
