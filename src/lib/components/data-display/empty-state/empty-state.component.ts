import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { EMPTY_STATE_DEFAULTS } from './empty-state.tokens';
import { DmEmptyStateSize } from './empty-state.types';

/**
 * Placeholder for "there is nothing here yet": an icon, a short explanation
 * and an optional call to action. Use it inside tables, lists, search results
 * or entire pages when the data set is empty.
 *
 * ```html
 * <dm-empty-state title="No projects yet" description="Create your first project to get started.">
 *   <dm-button color="primary">New project</dm-button>
 * </dm-empty-state>
 * ```
 *
 * The built-in inbox glyph can be replaced by projecting any element marked
 * with the `dmEmptyStateIcon` attribute (a `dm-icon`, an `<svg>`, an image):
 *
 * ```html
 * <dm-empty-state title="No results">
 *   <dm-icon dmEmptyStateIcon>search_off</dm-icon>
 * </dm-empty-state>
 * ```
 */
@Component({
  selector: 'dm-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class DmEmptyStateComponent {
  private readonly defaults = inject(EMPTY_STATE_DEFAULTS);

  /** Bold headline. Keep it short ("No results", "Your inbox is empty"). */
  readonly title = input<string>();

  /** Supporting copy under the title. Free content can also be projected. */
  readonly description = input<string>();

  /** Visual scale. Defaults from `EMPTY_STATE_DEFAULTS`. */
  readonly size = input<DmEmptyStateSize>(this.defaults.size);

  /** Hides the icon area entirely (built-in glyph and projected icon alike). */
  readonly hideIcon = input(false, { transform: booleanAttribute });
}
