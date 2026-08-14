import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { KBD_DEFAULTS } from './kbd.tokens';
import { DmKbdKey, DmKbdKeyMap, DmKbdKeyMeta, DmKbdSize } from './kbd.types';

/**
 * Canonical symbol + accessible label for every named {@link DmKbdKey}.
 * The symbol is drawn on the key (`aria-hidden`); the label is exposed to
 * assistive tech on the `<kbd>` element.
 */
const KBD_KEY_META: DmKbdKeyMap = {
  command: { symbol: '⌘', label: 'Command' },
  shift: { symbol: '⇧', label: 'Shift' },
  ctrl: { symbol: '⌃', label: 'Control' },
  option: { symbol: '⌥', label: 'Option' },
  alt: { symbol: '⌥', label: 'Alt' },
  enter: { symbol: '↵', label: 'Enter' },
  escape: { symbol: '⎋', label: 'Escape' },
  delete: { symbol: '⌦', label: 'Delete' },
  backspace: { symbol: '⌫', label: 'Backspace' },
  tab: { symbol: '⇥', label: 'Tab' },
  capslock: { symbol: '⇪', label: 'Caps Lock' },
  up: { symbol: '↑', label: 'Arrow Up' },
  down: { symbol: '↓', label: 'Arrow Down' },
  left: { symbol: '←', label: 'Arrow Left' },
  right: { symbol: '→', label: 'Arrow Right' },
  space: { symbol: '␣', label: 'Space' },
  pageup: { symbol: '⇞', label: 'Page Up' },
  pagedown: { symbol: '⇟', label: 'Page Down' },
  home: { symbol: '↖', label: 'Home' },
  end: { symbol: '↘', label: 'End' },
};

/**
 * Renders keyboard keys with the look of a physical key cap (HeroUI-style).
 * Named keys resolve to their symbol (`command` → `⌘`); literal letters and
 * digits go through content projection.
 *
 * ```html
 * <dm-kbd keys="command">K</dm-kbd>
 * <dm-kbd [keys]="['shift', 'command']">P</dm-kbd>
 * <dm-kbd keys="escape" />
 * <dm-kbd>Ctrl</dm-kbd>
 * ```
 */
@Component({
  selector: 'dm-kbd',
  templateUrl: './kbd.component.html',
  styleUrl: './kbd.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class DmKbdComponent {
  private readonly defaults = inject(KBD_DEFAULTS);

  /** Named key(s) rendered as their keyboard symbol, in order. */
  readonly keys = input<DmKbdKey | DmKbdKey[] | undefined>(undefined);

  /** Size scale. */
  readonly size = input<DmKbdSize>(this.defaults.size);

  /** Normalized list of resolved key metadata to render. */
  protected readonly keyList = computed<DmKbdKeyMeta[]>(() => {
    const value = this.keys();
    if (value == null) {
      return [];
    }
    const names = Array.isArray(value) ? value : [value];
    return names.map((name) => KBD_KEY_META[name]).filter((meta): meta is DmKbdKeyMeta => !!meta);
  });
}
