import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { DmButtonColor, DmButtonRadius, DmButtonVariant } from '../button/button.types';
import { BUTTON_GROUP_DEFAULTS } from './button-group.tokens';
import {
  DM_BUTTON_GROUP,
  DmButtonGroupContext,
  DmButtonGroupOrientation,
} from './button-group.types';

/**
 * Joins a row (or column) of `<dm-button>`s into a single attached control:
 * outer corners keep the pill radius, inner corners flatten, and the group
 * draws a subtle 1px seam between segments (bordered buttons collapse their
 * shared border instead). The elastic per-button press is disabled inside the
 * bar so the group stays rigid.
 *
 * Appearance set on the group **cascades** to every button — `color`,
 * `variant`, `size`, `radius` and `disabled` — while each button's own inputs
 * still win:
 *
 * ```html
 * <dm-button-group color="primary" ariaLabel="Pager">
 *   <dm-button ariaLabel="Previous"><dm-icon>chevron_left</dm-icon></dm-button>
 *   <dm-button>Page 3</dm-button>
 *   <dm-button ariaLabel="Next"><dm-icon>chevron_right</dm-icon></dm-button>
 * </dm-button-group>
 * ```
 *
 * A **split button** is a group of two: the main action plus a caret that
 * opens a `dmMenuTrigger` menu (see the docs page).
 *
 * `ViewEncapsulation.None` is intentional: the group must reach the inner
 * `.dm-button` of each projected button to flatten its radius. Every rule is
 * scoped under `.dm-button-group`, so nothing leaks.
 */
@Component({
  selector: 'dm-button-group',
  template: '<ng-content />',
  styleUrl: './button-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DM_BUTTON_GROUP,
      useExisting: forwardRef(() => DmButtonGroupComponent),
    },
  ],
  host: {
    class: 'dm-button-group',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-full-width]': 'fullWidth() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
})
export class DmButtonGroupComponent implements DmButtonGroupContext {
  private readonly defaults = inject(BUTTON_GROUP_DEFAULTS);

  /** Semantic color applied to every button (each button may override). */
  readonly color = input<DmButtonColor | undefined>(undefined);

  /** Visual variant applied to every button (each button may override). */
  readonly variant = input<DmButtonVariant | undefined>(undefined);

  /** Control size applied to every button (each button may override). */
  readonly size = input<DmSize | undefined>(undefined);

  /** Corner rounding of the group's outer corners (each button may override). */
  readonly radius = input<DmButtonRadius | undefined>(undefined);

  /** Disables every button in the group. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Layout direction of the grouped buttons. */
  readonly orientation = input<DmButtonGroupOrientation>(this.defaults.orientation);

  /** Stretch the group to fill its container; buttons share the width equally. */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  /** Accessible label describing the set of actions (e.g. "Text alignment"). */
  readonly ariaLabel = input<string>('');

  /** Group-level disabled exposed to the projected buttons. */
  readonly isDisabled = computed(() => this.disabled());
}
