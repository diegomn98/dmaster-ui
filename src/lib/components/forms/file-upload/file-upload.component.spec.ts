import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmFileUploadComponent, formatFileSize } from './file-upload.component';
import { FILE_UPLOAD_DEFAULTS } from './file-upload.tokens';
import { DmFileRejection } from './file-upload.types';

describe('DmFileUploadComponent', () => {
  let fixture: ComponentFixture<DmFileUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(DmFileUploadComponent);
    fixture.detectChanges();
  });

  // ---- Helpers -------------------------------------------------------------
  const host = (): HTMLElement => fixture.nativeElement;
  const dropzone = (): HTMLButtonElement => host().querySelector('.dm-file-upload__dropzone')!;
  const nativeInput = (): HTMLInputElement => host().querySelector('.dm-file-upload__native')!;
  const items = (): HTMLElement[] => Array.from(host().querySelectorAll('.dm-file-upload__item'));
  const removeButtons = (): HTMLButtonElement[] =>
    Array.from(host().querySelectorAll('.dm-file-upload__remove'));
  const alert = (): HTMLElement | null => host().querySelector('[role="alert"]');

  function png(name: string, contents = 'x'): File {
    return new File([contents], name, { type: 'image/png' });
  }
  function txt(name: string, contents = 'x'): File {
    return new File([contents], name, { type: 'text/plain' });
  }

  /** Simulates the user picking files through the native input. */
  function pick(files: File[]): void {
    const input = nativeInput();
    Object.defineProperty(input, 'files', { configurable: true, value: files });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  // ---- Rendering & a11y ----------------------------------------------------
  it('renders the dropzone with label and hint', () => {
    fixture.componentRef.setInput('label', 'Drop your files');
    fixture.componentRef.setInput('hint', 'PNG up to 2 MB');
    fixture.detectChanges();

    expect(dropzone()).not.toBeNull();
    expect(dropzone().textContent).toContain('Drop your files');
    expect(host().querySelector('.dm-file-upload__hint')!.textContent).toContain('PNG up to 2 MB');
  });

  it('exposes accessible structure: button dropzone, hidden file input, aria label', () => {
    fixture.componentRef.setInput('ariaLabel', 'Upload avatar');
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    expect(dropzone().tagName).toBe('BUTTON');
    expect(dropzone().getAttribute('type')).toBe('button');
    expect(dropzone().getAttribute('aria-label')).toBe('Upload avatar');

    const input = nativeInput();
    expect(input.type).toBe('file');
    expect(input.getAttribute('accept')).toBe('image/*');
    expect(input.multiple).toBe(true);
    expect(input.getAttribute('tabindex')).toBe('-1');
  });

  it('starts with flat behavioural defaults (single, no limits)', () => {
    expect(fixture.componentInstance.multiple()).toBe(false);
    expect(fixture.componentInstance.maxSize()).toBeNull();
    expect(fixture.componentInstance.maxFiles()).toBeNull();
    expect(items().length).toBe(0);
  });

  // ---- Picking / adding ----------------------------------------------------
  it('adds picked files to the model and emits filesAdded', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    const added: File[][] = [];
    fixture.componentInstance.filesAdded.subscribe((f) => added.push(f));

    pick([txt('a.txt'), txt('b.txt')]);

    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
    expect(items().length).toBe(2);
    expect(added).toHaveLength(1);
    expect(added[0].map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
  });

  it('appends across picks in multiple mode', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    pick([txt('a.txt')]);
    pick([txt('b.txt')]);

    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
  });

  it('replaces the current file when not multiple', () => {
    pick([txt('a.txt')]);
    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['a.txt']);

    pick([txt('b.txt')]);
    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['b.txt']);
    expect(items().length).toBe(1);
  });

  // ---- Validation ----------------------------------------------------------
  it('rejects files that do not match `accept` and shows a role=alert', () => {
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();
    const rejected: DmFileRejection[] = [];
    fixture.componentInstance.fileRejected.subscribe((r) => rejected.push(r));

    pick([txt('notes.txt')]);

    expect(fixture.componentInstance.files()).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBe('type');
    expect(alert()).not.toBeNull();
    expect(alert()!.textContent).toContain('notes.txt');
  });

  it('accepts a matching type after rejecting a non-matching one', () => {
    fixture.componentRef.setInput('accept', 'image/*,.pdf');
    fixture.detectChanges();

    pick([png('logo.png')]);
    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['logo.png']);
    // A clean add clears the previous alert.
    expect(alert()).toBeNull();
  });

  it('rejects files larger than `maxSize`', () => {
    fixture.componentRef.setInput('maxSize', 2);
    fixture.detectChanges();
    const rejected: DmFileRejection[] = [];
    fixture.componentInstance.fileRejected.subscribe((r) => rejected.push(r));

    pick([txt('big.txt', 'abcdef')]); // 6 bytes > 2

    expect(fixture.componentInstance.files()).toHaveLength(0);
    expect(rejected[0].reason).toBe('size');
    expect(alert()).not.toBeNull();
  });

  it('enforces `maxFiles`, rejecting the overflow with reason "count"', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('maxFiles', 1);
    fixture.detectChanges();
    const rejected: DmFileRejection[] = [];
    fixture.componentInstance.fileRejected.subscribe((r) => rejected.push(r));

    pick([txt('a.txt'), txt('b.txt')]);

    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['a.txt']);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBe('count');
  });

  // ---- Removal -------------------------------------------------------------
  it('removes a file via its × button and emits fileRemoved', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    let removed: File | undefined;
    fixture.componentInstance.fileRemoved.subscribe((f) => (removed = f));

    pick([txt('a.txt'), txt('b.txt')]);
    expect(items().length).toBe(2);

    // Each remove button is labelled with its filename.
    expect(removeButtons()[0].getAttribute('aria-label')).toBe('Remove a.txt');
    removeButtons()[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['b.txt']);
    expect(items().length).toBe(1);
    expect(removed?.name).toBe('a.txt');
  });

  // ---- Progress ------------------------------------------------------------
  it('renders a progressbar for a file with a progress entry', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    pick([txt('a.txt')]);

    fixture.componentRef.setInput('progress', { 'a.txt': 40 });
    fixture.detectChanges();

    const bar = host().querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar!.getAttribute('aria-valuenow')).toBe('40');
  });

  it('swaps the bar for a "done" state once progress reaches 100', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    pick([txt('a.txt')]);

    fixture.componentRef.setInput('progress', { 'a.txt': 100 });
    fixture.detectChanges();

    // No progressbar at 100 — the row reads as complete instead.
    expect(host().querySelector('[role="progressbar"]')).toBeNull();
    const item = host().querySelector('.dm-file-upload__item');
    expect(item!.getAttribute('data-status')).toBe('done');
    expect(host().querySelector('.dm-file-upload__done')?.textContent).toContain('Uploaded');
    expect(host().querySelector('.dm-file-upload__badge')).not.toBeNull();
  });

  // ---- Disabled ------------------------------------------------------------
  it('blocks interaction when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const added: File[][] = [];
    fixture.componentInstance.filesAdded.subscribe((f) => added.push(f));

    expect(dropzone().disabled).toBe(true);
    expect(nativeInput().disabled).toBe(true);
    expect(host().getAttribute('data-disabled')).toBe('');

    pick([txt('a.txt')]);
    expect(fixture.componentInstance.files()).toHaveLength(0);
    expect(added).toHaveLength(0);
  });

  // ---- Defaults ------------------------------------------------------------
  it('honors injected defaults', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: FILE_UPLOAD_DEFAULTS, useValue: { multiple: true, maxSize: 2, maxFiles: 3 } },
      ],
    });
    const local = TestBed.createComponent(DmFileUploadComponent);
    local.detectChanges();

    expect(local.componentInstance.multiple()).toBe(true);
    expect(local.componentInstance.maxSize()).toBe(2);
    expect(local.componentInstance.maxFiles()).toBe(3);
  });
});

describe('formatFileSize', () => {
  it('formats bytes, KB, MB with sensible rounding', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('returns an empty string for invalid input', () => {
    expect(formatFileSize(Number.NaN)).toBe('');
    expect(formatFileSize(-1)).toBe('');
  });
});
