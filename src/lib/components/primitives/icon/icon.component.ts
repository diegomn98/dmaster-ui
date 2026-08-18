import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { toCssSize } from '../../../core/utils/css';
import { DmIconRegistry } from './icon.registry';
import { ICON_DEFAULTS } from './icon.tokens';
import { DmIconColor, DmIconFamily, DmIconSize } from './icon.types';

const TOKEN_COLORS = new Set(['primary', 'secondary', 'success', 'warning', 'danger']);

/**
 * A single icon. Three ways to draw one, simplest first:
 *
 * ```html
 * <dm-icon>home</dm-icon>                       <!-- Material Symbols font ligature -->
 * <dm-icon name="check" />                      <!-- registered SVG (curated set / custom) -->
 * <dm-icon><svg viewBox="0 0 24 24">…</svg></dm-icon>  <!-- project a raw SVG -->
 * ```
 *
 * Font mode (text content) needs the Material Symbols font loaded once, exactly
 * like Angular Material's `mat-icon`; `fill`, `weight` and `family` map to the
 * variable-font axes (outlined ⇄ filled, weight, rounded/sharp). Color is a
 * one-liner via `color` (a semantic token or any CSS color); otherwise the icon
 * inherits `currentColor`. Decorative by default — pass `label` to expose it.
 */
@Component({
  selector: 'dm-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-svg]': "svg() ? '' : null",
    '[attr.data-family]': 'family()',
    '[attr.data-spin]': "spin() ? '' : null",
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[style.width]': 'cssSize()',
    '[style.height]': 'cssSize()',
    '[style.font-size]': 'cssSize()',
    '[style.color]': 'cssColor()',
    '[style.--dm-icon-fill]': 'fill() ? 1 : 0',
    '[style.--dm-icon-weight]': 'weight()',
  },
})
export class DmIconComponent {
  private readonly defaults = inject(ICON_DEFAULTS);
  private readonly registry = inject(DmIconRegistry);

  /** Registered SVG icon name (see `provideDmasterIcons`). For font icons, use content. */
  readonly name = input<string>('');

  /** Named size (`sm | md | lg`), pixels (number) or CSS length (string). */
  readonly size = input<DmIconSize>(this.defaults.size);

  /** Semantic color token (`primary`, `success`, …) or any CSS color. Empty inherits. */
  readonly color = input<DmIconColor>('');

  /** Font mode: filled (`true`) vs outlined (`false`). Maps to the `FILL` axis. */
  readonly fill = input<boolean>(false);

  /** Font mode: stroke weight (100–700). Maps to the `wght` axis. */
  readonly weight = input<number>(this.defaults.weight);

  /** Font mode family: `outlined` (default), `rounded` or `sharp`. */
  readonly family = input<DmIconFamily>(this.defaults.family);

  /** Spin the icon continuously — for loaders. Off under `prefers-reduced-motion`. */
  readonly spin = input<boolean>(false);

  /** Accessible label. Empty → decorative (`aria-hidden="true"`). */
  readonly label = input<string>('');

  /** Trusted markup for the registered `name`, or `null` (font/projected content shows). */
  protected readonly svg = computed(() => {
    const name = this.name();
    return name ? this.registry.get(name) : null;
  });

  protected readonly cssSize = computed(() => {
    const size = this.size();
    if (size === 'sm') {
      return '1rem';
    }
    if (size === 'md') {
      return '1.5rem';
    }
    if (size === 'lg') {
      return '2rem';
    }
    return toCssSize(size) ?? '1.5rem';
  });

  protected readonly cssColor = computed(() => {
    const color = this.color().trim();
    if (!color) {
      return null;
    }
    if (color === 'default') {
      return 'var(--dm-fg)';
    }
    return TOKEN_COLORS.has(color) ? `var(--dm-${color})` : color;
  });
}
