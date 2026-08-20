import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { FILE_UPLOAD_DEFAULTS } from './file-upload.tokens';
import { DmFileRejectReason, DmFileRejection, DmFileUploadMessages } from './file-upload.types';

/** Internal view-model for one row of the selected-file list. */
interface DmFileEntry {
  file: File;
  name: string;
  size: string;
  isImage: boolean;
  url: string | null;
}

/** Upload lifecycle of one row, derived from its `progress` value. */
type DmFileStatus = 'idle' | 'uploading' | 'done';

/** A file entry merged with its live upload status for the template. */
interface DmFileRow extends DmFileEntry {
  value: number | null;
  status: DmFileStatus;
}

/** Generic English fallbacks for the rejection alert (override via `messages`). */
const DM_FILE_UPLOAD_FALLBACK_MESSAGES: DmFileUploadMessages = {
  type: 'File type not allowed',
  size: 'File is too large',
  count: 'Too many files',
};

/**
 * Drag-and-drop dropzone backed by a hidden native `<input type="file">`.
 * Controlled through a two-way `[(files)]` (File objects don't fit CVA
 * cleanly). Validates each dropped/picked file against `accept`, `maxSize`
 * and `maxFiles`; accepted files append (or replace when not `multiple`),
 * rejected ones emit `(fileRejected)` and surface an inline `role="alert"`.
 *
 * ```html
 * <dm-file-upload
 *   multiple
 *   accept="image/*,.pdf"
 *   [maxSize]="5 * 1024 * 1024"
 *   [(files)]="files"
 *   (fileRejected)="notify($event)"
 * />
 * ```
 */
@Component({
  selector: 'dm-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class DmFileUploadComponent {
  private readonly defaults = inject(FILE_UPLOAD_DEFAULTS);
  private readonly document = inject(DOCUMENT);
  protected readonly uid = dmUid('dm-file-upload');

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  // ---- Model ---------------------------------------------------------------
  /** The currently accepted files. Two-way: `[(files)]`, or `(filesChange)`. */
  readonly files = model<File[]>([]);

  // ---- Inputs --------------------------------------------------------------
  /** Allow selecting/dropping more than one file (bare attribute `multiple`). */
  readonly multiple = input(this.defaults.multiple, { transform: booleanAttribute });

  /** Native `accept` filter (`'image/*,.pdf'`); also enforced in validation. */
  readonly accept = input<string>('');

  /** Maximum accepted size per file, in bytes. `null` disables the check. */
  readonly maxSize = input<number | null>(this.defaults.maxSize);

  /** Maximum number of files kept at once. `null` disables the cap. */
  readonly maxFiles = input<number | null>(this.defaults.maxFiles);

  /** Disables the whole control (bare attribute `disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible label for the dropzone button (overrides the visible copy). */
  readonly ariaLabel = input<string>('');

  /** Dropzone headline (consumer-supplied copy; generic fallback provided). */
  readonly label = input<string>('Drag & drop files here, or click to browse');

  /** Sub-text under the headline (e.g. accepted types / size limit). */
  readonly hint = input<string>('');

  /** Prefix for each remove button's aria-label → `"<removeLabel> <filename>"`. */
  readonly removeLabel = input<string>('Remove');

  /** Shown next to a file once its `progress` reaches 100 (generic fallback). */
  readonly uploadedLabel = input<string>('Uploaded');

  /** Localisable copy for the three rejection reasons. */
  readonly messages = input<DmFileUploadMessages>(DM_FILE_UPLOAD_FALLBACK_MESSAGES);

  /** Optional per-file progress (0–100), keyed by file name. */
  readonly progress = input<Record<string, number> | null>(null);

  // ---- Outputs -------------------------------------------------------------
  /** Emits the newly accepted files after a successful add. */
  readonly filesAdded = output<File[]>();

  /** Emits once per file turned away by validation. */
  readonly fileRejected = output<DmFileRejection>();

  /** Emits the file removed via its × button. */
  readonly fileRemoved = output<File>();

  // ---- State ---------------------------------------------------------------
  protected readonly hintId = `${this.uid}-hint`;

  /** True while a drag is hovering the dropzone (drives `data-dragging`). */
  protected readonly dragging = signal(false);

  /** Most recent rejection, or `null`. Drives the inline `role="alert"`. */
  protected readonly rejection = signal<DmFileRejection | null>(null);

  /** Human text for the rejection alert. */
  protected readonly rejectionText = computed(() => {
    const rejection = this.rejection();
    if (!rejection) {
      return '';
    }
    const message = this.messages()[rejection.reason] ?? '';
    return rejection.reason === 'count' ? message : `${rejection.file.name}: ${message}`;
  });

  /** Rows of the selected-file list (with object-URL thumbnails for images). */
  protected readonly entries = signal<DmFileEntry[]>([]);

  /**
   * The rendered rows: each entry merged with its live upload status derived
   * from `progress`. `idle` (no progress reported) → just the size; `uploading`
   * (0–99) → bar + percentage; `done` (≥100) → success check, no bar.
   */
  protected readonly rows = computed<DmFileRow[]>(() => {
    const progress = this.progress();
    return this.entries().map((entry) => {
      const value = progress?.[entry.name];
      const status: DmFileStatus = value == null ? 'idle' : value >= 100 ? 'done' : 'uploading';
      return { ...entry, value: value ?? null, status };
    });
  });

  private urls = new Map<File, string>();

  constructor() {
    // Keep the list view-model (and image object-URLs) in sync with the model.
    effect(() => this.syncEntries(this.files() ?? []));
    inject(DestroyRef).onDestroy(() => this.revokeAll());
  }

  // ---- Interaction ---------------------------------------------------------
  /** Opens the native picker (also reached via Enter/Space on the button). */
  protected open(): void {
    if (this.disabled()) {
      return;
    }
    this.inputRef().nativeElement.click();
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.ingest(input.files ? Array.from(input.files) : []);
    // Reset so picking the same file again still fires `change`.
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    // Preventing default is required for the drop event to fire.
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    // Ignore leaves into a descendant (moving over the icon/label counts as
    // still inside the zone).
    const zone = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (related && zone.contains(related)) {
      return;
    }
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.disabled()) {
      return;
    }
    const dropped = event.dataTransfer?.files;
    this.ingest(dropped ? Array.from(dropped) : []);
  }

  protected remove(file: File): void {
    if (this.disabled()) {
      return;
    }
    const next = (this.files() ?? []).filter((current) => current !== file);
    this.files.set(next);
    this.fileRemoved.emit(file);
  }

  // ---- Validation & ingest -------------------------------------------------
  private ingest(incoming: File[]): void {
    this.rejection.set(null);
    if (this.disabled() || incoming.length === 0) {
      return;
    }

    const multiple = this.multiple();
    const cap = multiple ? (this.maxFiles() ?? Number.POSITIVE_INFINITY) : 1;
    // Single mode replaces; multiple mode appends to what's already there.
    const base = multiple ? [...(this.files() ?? [])] : [];
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!this.acceptsType(file)) {
        this.reject(file, 'type');
        continue;
      }
      const max = this.maxSize();
      if (max != null && file.size > max) {
        this.reject(file, 'size');
        continue;
      }
      if (base.length + accepted.length >= cap) {
        this.reject(file, 'count');
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) {
      return;
    }
    this.files.set([...base, ...accepted]);
    this.filesAdded.emit(accepted);
  }

  private reject(file: File, reason: DmFileRejectReason): void {
    this.rejection.set({ file, reason });
    this.fileRejected.emit({ file, reason });
  }

  /** Mirrors the browser's `accept` matching (MIME, `type/*`, `.ext`). */
  private acceptsType(file: File): boolean {
    const accept = this.accept().trim();
    if (!accept) {
      return true;
    }
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accept
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length > 0)
      .some((token) => {
        if (token.startsWith('.')) {
          return name.endsWith(token);
        }
        if (token.endsWith('/*')) {
          return type.startsWith(token.slice(0, -1));
        }
        return type === token;
      });
  }

  // ---- Thumbnails ----------------------------------------------------------
  private syncEntries(files: File[]): void {
    const next = new Map<File, string>();
    const list: DmFileEntry[] = files.map((file) => {
      const isImage = file.type.startsWith('image/');
      let url: string | null = null;
      if (isImage) {
        url = this.urls.get(file) ?? this.createUrl(file);
        if (url) {
          next.set(file, url);
        }
      }
      return { file, name: file.name, size: formatFileSize(file.size), isImage, url };
    });
    // Revoke object-URLs whose file is no longer present.
    for (const [file, url] of this.urls) {
      if (!next.has(file)) {
        this.revoke(url);
      }
    }
    this.urls = next;
    this.entries.set(list);
  }

  /** SSR-safe object-URL creation; returns `null` when unavailable. */
  private createUrl(file: File): string | null {
    const url = this.document.defaultView?.URL;
    if (!url || typeof url.createObjectURL !== 'function') {
      return null;
    }
    try {
      return url.createObjectURL(file);
    } catch {
      return null;
    }
  }

  private revoke(objectUrl: string): void {
    try {
      this.document.defaultView?.URL?.revokeObjectURL?.(objectUrl);
    } catch {
      // Best-effort: some environments lack revokeObjectURL.
    }
  }

  private revokeAll(): void {
    for (const url of this.urls.values()) {
      this.revoke(url);
    }
    this.urls.clear();
  }
}

/**
 * Formats a byte count as a compact, human-readable string (`'820 KB'`,
 * `'3.4 MB'`). Pure; exported for reuse in consumer hints.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded =
    value >= 10 || Number.isInteger(value) ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}
