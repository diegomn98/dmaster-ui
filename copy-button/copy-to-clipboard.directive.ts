import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, HostListener, inject, input, output, signal } from '@angular/core';

import { writeToClipboard } from './clipboard';

/**
 * Copies text to the clipboard when the host element is clicked. Attach it to
 * any button (or other interactive element) you already have — it adds the
 * copy behaviour without imposing a look.
 *
 * ```html
 * <button dmCopyToClipboard="dm_a1B2c3D4e5" #cp="dmCopyToClipboard">
 *   {{ cp.isCopied() ? 'Copied!' : 'Copy' }}
 * </button>
 * ```
 *
 * Exposed as `dmCopyToClipboard`, so a template reference gives you the
 * `isCopied()` signal for feedback. Emits `(copied)` with the copied text on
 * success and `(copyError)` if the clipboard write fails. SSR-safe: the copy
 * runs through the injected `Document` and is a no-op on the server.
 */
@Directive({
  selector: '[dmCopyToClipboard]',
  exportAs: 'dmCopyToClipboard',
})
export class DmCopyToClipboardDirective {
  private readonly document = inject(DOCUMENT);
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  /** Text written to the clipboard on click. */
  readonly value = input.required<string>({ alias: 'dmCopyToClipboard' });

  /** How long `isCopied()` stays `true` after a successful copy (ms). */
  readonly resetDelay = input<number>(2000);

  /** Emitted with the copied text after a successful copy. */
  readonly copied = output<string>();

  /** Emitted when the clipboard write fails (denied, insecure context, SSR). */
  readonly copyError = output<unknown>();

  /** `true` for `resetDelay` ms after a successful copy — drive feedback off it. */
  readonly isCopied = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  @HostListener('click')
  protected async onClick(): Promise<void> {
    const text = this.value();
    let ok = false;
    try {
      ok = await writeToClipboard(this.document, text);
    } catch (error) {
      this.copyError.emit(error);
      return;
    }

    if (!ok) {
      this.copyError.emit(new Error('Clipboard copy failed'));
      return;
    }

    this.isCopied.set(true);
    this.copied.emit(text);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.isCopied.set(false), this.resetDelay());
  }
}
