import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
} from '@angular/core';

import { toCssSize } from '../../../core/utils/css';
import { DmAvatarFallbackDirective } from './avatar-fallback.directive';
import { AVATAR_DEFAULTS } from './avatar.tokens';
import { DmAvatarColor, DmAvatarShape, DmAvatarSize } from './avatar.types';

/**
 * Avatar with automatic fallback chain: image → initials → custom fallback
 * (`[dmAvatarFallback]`) → generic icon. A failed image load falls back to
 * initials without flashing.
 *
 * ```html
 * <dm-avatar src="/u/diego.png" alt="Diego Maestro" initials="DM" />
 * <dm-avatar initials="DM" size="lg" />
 * <dm-avatar shape="square" />
 * ```
 */
@Component({
  selector: 'dm-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-shape]': 'shape()',
    '[attr.data-color]': 'color()',
    // Only expose an `img` role when we can actually name it (alt/initials).
    // A nameless fallback (generic icon) is decorative — no role, no violation.
    '[attr.role]': 'hostLabel() ? "img" : null',
    '[attr.aria-label]': 'hostLabel()',
    '[style.width]': 'cssSize()',
    '[style.height]': 'cssSize()',
    '[style.font-size]': 'fontSize()',
  },
})
export class DmAvatarComponent {
  private readonly defaults = inject(AVATAR_DEFAULTS);

  /** Projected custom fallback (`[dmAvatarFallback]`). When present the generic icon is not rendered. */
  protected readonly customFallback = contentChild(DmAvatarFallbackDirective);

  /** Image URL. Falls back to `initials` (then a generic icon) on error. */
  readonly src = input<string | null>(null);

  /** Alt text for the image / accessible label for the fallback. */
  readonly alt = input<string>('');

  /** Initials shown when there is no (working) image. */
  readonly initials = input<string>('');

  /** Named size (`sm | md | lg`), pixels (number) or CSS length (string). */
  readonly size = input<DmAvatarSize>(this.defaults.size);

  /** Shape. */
  readonly shape = input<DmAvatarShape>(this.defaults.shape);

  /** Semantic color of the initials tint. */
  readonly color = input<DmAvatarColor>(this.defaults.color);

  /** Resets automatically whenever `src` changes. */
  protected readonly failed = linkedSignal({
    source: this.src,
    computation: () => false,
  });

  protected readonly showImage = computed(() => !!this.src() && !this.failed());

  /**
   * Accessible name for the host when the image isn't showing. Null while the
   * `<img>` is visible (it carries its own alt) or when the fallback is the
   * generic icon with no name to give — in which case the host stays decorative.
   */
  protected readonly hostLabel = computed(() =>
    this.showImage() ? null : this.alt() || this.initials() || null,
  );

  protected readonly cssSize = computed(() => {
    const size = this.size();
    if (size === 'sm') {
      return '2rem';
    }
    if (size === 'md') {
      return '2.5rem';
    }
    if (size === 'lg') {
      return '3rem';
    }
    return toCssSize(size) ?? '2.5rem';
  });

  protected readonly fontSize = computed(() => {
    const size = this.size();
    if (size === 'sm') {
      return '0.75rem';
    }
    if (size === 'md') {
      return '0.875rem';
    }
    if (size === 'lg') {
      return '1.0625rem';
    }
    return typeof size === 'number' ? `${Math.round(size * 0.38)}px` : null;
  });
}
