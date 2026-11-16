# Keyboard Key (`dm-kbd`)

Renders keyboard keys with the look of a physical key cap. Named
keys resolve to their canonical symbol (`command` → `⌘`); literal letters and
digits come through content projection.

## Usage

```ts
import { DmKbdComponent } from '@dmaster/ui';
```

```html
<!-- Named modifier + a projected letter → ⌘K -->
<dm-kbd keys="command">K</dm-kbd>

<!-- Multiple named keys → ⇧⌘P -->
<dm-kbd [keys]="['shift', 'command']">P</dm-kbd>

<!-- A single symbol key, no content -->
<dm-kbd keys="escape" />

<!-- A pure literal key -->
<dm-kbd>Esc</dm-kbd>

<!-- Compact -->
<dm-kbd keys="command" size="sm">S</dm-kbd>
```

## API

| Input  | Type                                  | Default     | Description                                               |
| ------ | ------------------------------------- | ----------- | --------------------------------------------------------- |
| `keys` | `DmKbdKey \| DmKbdKey[] \| undefined` | `undefined` | Named key(s) rendered as their keyboard symbol, in order. |
| `size` | `'sm' \| 'md'`                        | `'md'`      | Size scale.                                               |

Projected content (letters, digits, short words) is rendered as an extra key
cap after the named keys.

### `DmKbdKey`

`command · shift · ctrl · option · alt · enter · escape · delete · backspace ·
tab · capslock · up · down · left · right · space · pageup · pagedown · home ·
end`

Each maps to a symbol (`⌘ ⇧ ⌃ ⌥ ⌥ ↵ ⎋ ⌦ ⌫ ⇥ ⇪ ↑ ↓ ← → ␣ ⇞ ⇟ ↖ ↘`) and a
readable label (`Command`, `Shift`, …).

## Global defaults

```ts
providers: [provideKbdDefaults({ size: 'sm' })];
```

Or provide `KBD_DEFAULTS` directly.

## Accessibility

- Each named key is a real `<kbd>` element carrying an `aria-label`
  (`Command`, `Shift`…); its symbol glyph is `aria-hidden`.
- Projected letters are read verbatim.
- Non-interactive: no focus ring, no motion.

## Design tokens

| Token                | Default                                             | Description                   |
| -------------------- | --------------------------------------------------- | ----------------------------- |
| `--dm-kbd-bg`        | `var(--dm-bg-muted)`                                | Key cap surface.              |
| `--dm-kbd-fg`        | `var(--dm-fg-muted)`                                | Glyph color.                  |
| `--dm-kbd-border`    | `var(--dm-border)`                                  | Key cap 1px border color.     |
| `--dm-kbd-radius`    | `var(--dm-radius-sm)`                               | Key cap corner rounding.      |
| `--dm-kbd-size`      | `1.5rem` (md) / `1.25rem` (sm)                      | Key cap height and min-width. |
| `--dm-kbd-padding`   | `0.4em`                                             | Key cap inline padding.       |
| `--dm-kbd-font-size` | `var(--dm-text-sm)` (md) / `var(--dm-text-xs)` (sm) | Glyph font size.              |
| `--dm-kbd-gap`       | `0.25em`                                            | Gap between key caps.         |
