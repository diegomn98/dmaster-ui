/**
 * SSR-safe clipboard write shared by `dm-copy-button` and the
 * `dmCopyToClipboard` directive.
 *
 * Prefers the async Clipboard API (secure contexts, requires a user gesture)
 * and falls back to a hidden `<textarea>` + `execCommand('copy')` for insecure
 * or older contexts. Never touches a global `window`/`navigator` — everything
 * goes through the injected `Document`, so it is a no-op (resolves `false`)
 * during server-side rendering where there is no browser view.
 *
 * @returns `true` when the text reached the clipboard, `false` otherwise.
 */
export async function writeToClipboard(doc: Document, text: string): Promise<boolean> {
  const clipboard = doc.defaultView?.navigator?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or not a secure context — fall through to the legacy path.
    }
  }

  // Legacy fallback: select a hidden textarea and ask the document to copy it.
  try {
    const textarea = doc.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    doc.body.appendChild(textarea);
    textarea.select();
    const ok = doc.execCommand?.('copy') ?? false;
    doc.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
