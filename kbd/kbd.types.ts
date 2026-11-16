/**
 * Named key that `dm-kbd` renders as its canonical keyboard symbol
 * (e.g. `'command'` → `⌘`). Anything not in this list (single letters,
 * digits) is passed through content projection instead.
 */
export type DmKbdKey =
  | 'command'
  | 'shift'
  | 'ctrl'
  | 'option'
  | 'alt'
  | 'enter'
  | 'escape'
  | 'delete'
  | 'backspace'
  | 'tab'
  | 'capslock'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'space'
  | 'pageup'
  | 'pagedown'
  | 'home'
  | 'end';

/** Size scale. `sm` is more compact. */
export type DmKbdSize = 'sm' | 'md';

/** Glyph + screen-reader label a named key resolves to. */
export interface DmKbdKeyMeta {
  /** The character drawn on the key (rendered `aria-hidden`). */
  symbol: string;
  /** Human-readable label exposed to assistive tech via `aria-label`. */
  label: string;
}

/** Lookup of every {@link DmKbdKey} to its symbol and accessible label. */
export type DmKbdKeyMap = Record<DmKbdKey, DmKbdKeyMeta>;
