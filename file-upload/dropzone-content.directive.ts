import { Directive } from '@angular/core';

/**
 * Marks a projected element as the custom body of the `dm-file-upload`
 * dropzone. When present it replaces the built-in cloud icon + `label` +
 * `hint` block; drag & drop, click-to-browse, keyboard interaction and the
 * focus ring stay untouched. Import it alongside the file-upload component.
 *
 * ```html
 * <dm-file-upload [(files)]="files">
 *   <span dmDropzoneContent>
 *     <dm-icon name="image" size="2rem" />
 *     <strong>Drop your screenshots here</strong>
 *   </span>
 * </dm-file-upload>
 * ```
 *
 * The projected content lives inside the dropzone `<button>`, so it becomes
 * part of the button's accessible name — keep it text-bearing (or set
 * `ariaLabel`), and never nest interactive elements in it.
 */
@Directive({
  selector: '[dmDropzoneContent]',
  host: { class: 'dm-file-upload-dropzone-content' },
})
export class DmDropzoneContentDirective {}
