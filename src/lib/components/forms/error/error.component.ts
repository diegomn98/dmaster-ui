import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { ERROR_DEFAULTS } from './error.tokens';
import { DmErrorSize } from './error.types';

/**
 * A validation error message for form fields — the standalone sibling of
 * `mat-error` / HeroUI's FieldError.
 *
 * ```html
 * <dm-error>Email is required</dm-error>
 * ```
 *
 * Renders as a `role="alert"` line in danger color with a subtle entrance
 * animation, so assistive tech announces it the moment it appears. The
 * content is fully projected — plain text, rich markup, or your own icon —
 * so `dm-error` carries no icon of its own; add one (e.g. `<dm-icon>`) inside
 * when you want one:
 *
 * ```html
 * <dm-error><dm-icon name="warning" size="sm" />Email is required</dm-error>
 * ```
 *
 * The host is `display: flex` with a small gap, so it lines up whatever you
 * project — size your own icon (`dm-icon`'s `size` input, or plain CSS on an
 * `<svg>`). Drop it inside `dm-form-field` and it is positioned + wired
 * automatically; elsewhere, render it conditionally next to any control.
 */
@Component({
  selector: 'dm-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dm-error',
    role: 'alert',
    '[attr.data-size]': 'size()',
  },
})
export class DmErrorComponent {
  private readonly defaults = inject(ERROR_DEFAULTS);

  /** Text scale. */
  readonly size = input<DmErrorSize>(this.defaults.size);
}
