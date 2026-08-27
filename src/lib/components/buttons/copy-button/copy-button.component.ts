import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import type { DmSize } from '../../../core/types/common.types';
import { DmButtonComponent } from '../button';
import { COPY_BUTTON_DEFAULTS } from './copy-button.tokens';
import type {
  DmCopyButtonColor,
  DmCopyButtonRadius,
  DmCopyButtonVariant,
} from './copy-button.types';
import { DmCopyToClipboardDirective } from './copy-to-clipboard.directive';

/**
 * Icon button that copies `value` to the clipboard and flips to a check for a
 * moment as confirmation. A thin, opinionated wrapper over `dm-button` (same
 * `color` × `variant` × `size` × `radius`) driven by the `dmCopyToClipboard`
 * directive — so it presses, focuses and themes exactly like every other
 * button.
 *
 * ```html
 * <dm-copy-button value="dm_a1B2c3D4e5" ariaLabel="Copy API key" />
 *
 * <dm-copy-button value="hello" variant="bordered" copyLabel="Copy" copiedLabel="Copied!" />
 * ```
 *
 * Ships no copy of its own: pass `ariaLabel` (required for the icon-only form),
 * `copiedAriaLabel` (announced on success), and any visible `copyLabel` /
 * `copiedLabel`.
 */
@Component({
  selector: 'dm-copy-button',
  imports: [DmButtonComponent, DmCopyToClipboardDirective],
  templateUrl: './copy-button.component.html',
  styleUrl: './copy-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmCopyButtonComponent {
  private readonly defaults = inject(COPY_BUTTON_DEFAULTS);

  /** Text written to the clipboard on click. */
  readonly value = input.required<string>();

  /** Semantic color, forwarded to the inner `dm-button`. */
  readonly color = input<DmCopyButtonColor>(this.defaults.color);

  /** Visual variant, forwarded to the inner `dm-button`. */
  readonly variant = input<DmCopyButtonVariant>(this.defaults.variant);

  /** Corner rounding, forwarded to the inner `dm-button`. */
  readonly radius = input<DmCopyButtonRadius>(this.defaults.radius);

  /** Control size, forwarded to the inner `dm-button`. */
  readonly size = input<DmSize>(this.defaults.size);

  /** How long the copied (check) state lasts before reverting, in milliseconds. */
  readonly resetDelay = input<number>(this.defaults.resetDelay);

  /** Optional visible label beside the icon. Empty (default) = icon-only. */
  readonly copyLabel = input<string>('');

  /** Visible label shown while copied. Falls back to `copyLabel`. */
  readonly copiedLabel = input<string>('');

  /** Accessible name for the button. Required for the icon-only form. */
  readonly ariaLabel = input<string>('');

  /** Announced to screen readers after a successful copy. */
  readonly copiedAriaLabel = input<string>('');

  /** Emitted with the copied text after a successful copy. */
  readonly copied = output<string>();

  /** Emitted when the clipboard write fails. */
  readonly copyError = output<unknown>();
}
