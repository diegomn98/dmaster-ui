import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A subtle horizontal rule separating groups of items inside a `<dm-menu>`.
 * Renders as an ARIA `separator`.
 *
 * ```html
 * <dm-menu-item>Edit</dm-menu-item>
 * <dm-menu-divider />
 * <dm-menu-item color="danger">Delete</dm-menu-item>
 * ```
 */
@Component({
  selector: 'dm-menu-divider',
  template: '',
  styles: `
    :host {
      display: block;
      height: 1px;
      margin: var(--dm-space-1) calc(var(--dm-space-1) * -1);
      background: var(--dm-menu-divider-color, var(--dm-border));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    'aria-orientation': 'horizontal',
  },
})
export class DmMenuDividerComponent {}
