# Copy button

`dm-copy-button` copies text to the clipboard and flips its icon to a check for
a moment as confirmation. It is a thin wrapper over [`dm-button`](../button),
so it shares the same `color` × `variant` × `size` × `radius` API and every
`--dm-button-*` token — it presses, focuses and themes like any other button.

For adding copy behaviour to a button you already have, use the
`dmCopyToClipboard` directive instead.

## Usage

```html
<!-- Component: icon-only, next to a snippet -->
<dm-copy-button value="ng add @dmaster/ui" ariaLabel="Copy install command" />

<!-- Component: with a visible label -->
<dm-copy-button value="hello world" variant="bordered" copyLabel="Copy" copiedLabel="Copied!" />

<!-- Directive: on any element you already style -->
<button dmCopyToClipboard="ng add @dmaster/ui" #cp="dmCopyToClipboard">
  {{ cp.isCopied() ? 'Copied!' : 'Copy' }}
</button>
```

Both are SSR-safe: the copy runs through the injected `Document` and the async
Clipboard API, falling back to a hidden `<textarea>` + `execCommand('copy')`
when the Clipboard API is unavailable. On the server it is a no-op and emits
`(copyError)`.

The library ships no built-in copy: set `ariaLabel` (required for the icon-only
form), `copiedAriaLabel` (announced on success) and any visible `copyLabel` /
`copiedLabel` yourself.

## API — `dm-copy-button`

| Input             | Type                  | Default   | Description                                             |
| ----------------- | --------------------- | --------- | ------------------------------------------------------- |
| `value`           | `string` (required)   | —         | Text written to the clipboard on click.                 |
| `color`           | `DmCopyButtonColor`   | `default` | Semantic color, forwarded to `dm-button`.               |
| `variant`         | `DmCopyButtonVariant` | `flat`    | Visual variant, forwarded to `dm-button`.               |
| `radius`          | `DmCopyButtonRadius`  | `md`      | Corner rounding, forwarded to `dm-button`.              |
| `size`            | `DmSize`              | `md`      | Control size (32/40/48px).                              |
| `resetDelay`      | `number`              | `2000`    | How long the check state lasts, in ms.                  |
| `copyLabel`       | `string`              | `''`      | Optional visible label. Empty = icon-only.              |
| `copiedLabel`     | `string`              | `''`      | Visible label while copied (falls back to `copyLabel`). |
| `ariaLabel`       | `string`              | `''`      | Accessible name. **Required for the icon-only form.**   |
| `copiedAriaLabel` | `string`              | `''`      | Announced to screen readers on a successful copy.       |

| Output      | Type      | Description                              |
| ----------- | --------- | ---------------------------------------- |
| `copied`    | `string`  | Emitted with the copied text on success. |
| `copyError` | `unknown` | Emitted when the clipboard write fails.  |

## API — `dmCopyToClipboard` directive

| Binding             | Type      | Default | Description                                           |
| ------------------- | --------- | ------- | ----------------------------------------------------- |
| `dmCopyToClipboard` | `string`  | —       | Text written to the clipboard on click (the value).   |
| `resetDelay`        | `number`  | `2000`  | How long `isCopied()` stays `true`, in ms.            |
| `(copied)`          | `string`  | —       | Emitted with the copied text on success.              |
| `(copyError)`       | `unknown` | —       | Emitted when the clipboard write fails.               |
| `isCopied()`        | `Signal`  | —       | Read via `exportAs="dmCopyToClipboard"` for feedback. |

## Design tokens

| Token                        | Default   | Description                           |
| ---------------------------- | --------- | ------------------------------------- |
| `--dm-copy-button-icon-size` | `1.125em` | Width/height of the copy/check glyph. |

Everything else — surface, radius, height, padding, press — is controlled by the
inner button's [`--dm-button-*`](../button) tokens.

## Accessibility

- The glyph is `aria-hidden`; the button's accessible name comes from `ariaLabel`
  (icon-only) or the visible label. A polite `role="status"` live region
  announces `copiedAriaLabel` on a successful copy.
- Focus, press and keyboard activation come from the underlying native `<button>`.

## Defaults

Override app- or route-wide with `provideCopyButtonDefaults({ … })` /
`COPY_BUTTON_DEFAULTS`.
