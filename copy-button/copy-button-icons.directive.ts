import { Directive } from '@angular/core';

/**
 * Marks a projected element as the custom copy (idle) icon of a
 * `<dm-copy-button>`. When present it replaces the built-in copy glyph;
 * pair it with `dmCopiedIcon` to also swap the confirmation check. The
 * component does not size projected icons — size them yourself (the built-in
 * glyphs are `1.125em`).
 *
 * ```html
 * <dm-copy-button value="npm i @dmaster/ui" ariaLabel="Copy install command">
 *   <dm-icon dmCopyIcon size="1.125em">content_paste</dm-icon>
 *   <dm-icon dmCopiedIcon size="1.125em">done</dm-icon>
 * </dm-copy-button>
 * ```
 */
@Directive({
  selector: '[dmCopyIcon]',
  host: { class: 'dm-copy-button__copy-icon' },
})
export class DmCopyIconDirective {}

/**
 * Marks a projected element as the custom copied (confirmation) icon of a
 * `<dm-copy-button>`, shown while `isCopied()` is `true` in place of the
 * built-in check glyph. See {@link DmCopyIconDirective} for a usage example.
 */
@Directive({
  selector: '[dmCopiedIcon]',
  host: { class: 'dm-copy-button__copied-icon' },
})
export class DmCopiedIconDirective {}
