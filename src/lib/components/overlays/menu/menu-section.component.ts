import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { dmUid } from '../../../core/utils/uid';

/**
 * Groups related `<dm-menu-item>`s under an optional uppercase heading.
 * Exposes `role="group"` + `aria-labelledby` so the heading names the group
 * for assistive tech.
 *
 * ```html
 * <dm-menu-section heading="Account">
 *   <dm-menu-item>Profile</dm-menu-item>
 *   <dm-menu-item>Settings</dm-menu-item>
 * </dm-menu-section>
 * ```
 */
@Component({
  selector: 'dm-menu-section',
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'labelledBy()',
  },
})
export class DmMenuSectionComponent {
  /** Optional heading; when empty the group renders unlabelled. */
  readonly heading = input<string>('');

  /** Stable id the group is labelled by. */
  protected readonly headingId = dmUid('dm-menu-section');

  protected readonly labelledBy = computed(() => (this.heading() ? this.headingId : null));
}
