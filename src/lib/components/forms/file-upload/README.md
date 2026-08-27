# File upload (`dm-file-upload`)

Drag-and-drop dropzone backed by a hidden native `<input type="file">`, with a
selected-file list, image thumbnails, optional per-file progress, and built-in
validation (`accept` / `maxSize` / `maxFiles`). No Angular Material dependency.

It is **controlled**, not a `ControlValueAccessor`: `File` objects don't map
cleanly onto forms, so the current selection is a two-way `[(files)]` model.

## Usage

```ts
import { DmFileUploadComponent } from '@dmaster/ui';
```

```html
<!-- Single file (default): a new pick replaces the previous one -->
<dm-file-upload [(files)]="files" accept="image/*" />

<!-- Multiple, with size + count limits and a hint -->
<dm-file-upload
  multiple
  accept="image/*,.pdf"
  [maxSize]="5 * 1024 * 1024"
  [maxFiles]="5"
  hint="PNG, JPG or PDF · up to 5 MB each"
  [(files)]="files"
  (filesAdded)="upload($event)"
  (fileRejected)="notify($event)"
/>

<!-- Feed live upload progress back in (0–100, keyed by file name) -->
<dm-file-upload [(files)]="files" [progress]="{ 'photo.png': 62 }" />
```

## API

### Inputs

| Input         | Type                             | Default          | Description                                                    |
| ------------- | -------------------------------- | ---------------- | -------------------------------------------------------------- |
| `files`       | `model<File[]>`                  | `[]`             | Two-way accepted-files model. Also emits `(filesChange)`.      |
| `multiple`    | `boolean` (attr)                 | `false`          | Allow more than one file. Bare attribute `multiple`.           |
| `accept`      | `string`                         | `''`             | Native filter (`'image/*,.pdf'`); also enforced in validation. |
| `maxSize`     | `number \| null`                 | `null`           | Max bytes per file (`null` = no limit).                        |
| `maxFiles`    | `number \| null`                 | `null`           | Max files kept at once (`null` = no cap).                      |
| `disabled`    | `boolean` (attr)                 | `false`          | Disables clicking, dropping and removing.                      |
| `ariaLabel`   | `string`                         | `''`             | Accessible label for the dropzone button.                      |
| `label`       | `string`                         | generic fallback | Dropzone headline copy.                                        |
| `hint`        | `string`                         | `''`             | Sub-text under the headline.                                   |
| `removeLabel` | `string`                         | `'Remove'`       | Prefix for each remove button's aria-label.                    |
| `messages`    | `DmFileUploadMessages`           | generic English  | Copy for the three rejection reasons.                          |
| `progress`    | `Record<string, number> \| null` | `null`           | Per-file progress (0–100), keyed by file name.                 |

### Outputs

| Output         | Payload           | When                                             |
| -------------- | ----------------- | ------------------------------------------------ |
| `filesChange`  | `File[]`          | The accepted-files model changed (from `files`). |
| `filesAdded`   | `File[]`          | New files passed validation and were appended.   |
| `fileRejected` | `DmFileRejection` | A file failed `accept` / `maxSize` / `maxFiles`. |
| `fileRemoved`  | `File`            | A file was removed via its × button.             |

`DmFileRejection` is `{ file: File; reason: 'type' | 'size' | 'count' }`.

## Global defaults

```ts
providers: [provideFileUploadDefaults({ multiple: true, maxSize: 5 * 1024 * 1024 })];
```

Or provide `FILE_UPLOAD_DEFAULTS` directly.

## Helpers

`formatFileSize(bytes)` — the pure byte formatter the list uses (`'820 KB'`,
`'3.4 MB'`); exported for consumer hints.

## Theming

Every surface decision is exposed as a `--dm-file-upload-*` CSS variable — see
the [Design tokens](#design-tokens) table below. The drag-over state switches
text/icon to `--dm-primary-text` (AA contrast on the tint).

## Accessibility

- The dropzone is a real `<button>`: Enter/Space open the picker; the hidden
  `<input type="file">` (with `accept`/`multiple`) is out of the tab order.
- The file list is a `<ul>`; each remove control is a `<button>` labelled
  `"<removeLabel> <filename>"`.
- Validation failures are announced through an inline `role="alert"`.
- Per-file progress bars expose `role="progressbar"` with `aria-valuenow`.
- `:focus-visible` shows the shared focus ring; interactive targets meet the
  44×44px minimum; motion is disabled under `prefers-reduced-motion`.
- SSR-safe: object-URL thumbnails are created only when the DOM is available and
  revoked on removal and on destroy.

## Design tokens

CSS variables, overridable at any scope (global, theme or a subtree). Each one
falls back to the default shown, so nothing changes until you set it:

| Token                            | Default                    | Description                          |
| -------------------------------- | -------------------------- | ------------------------------------ |
| `--dm-file-upload-bg`            | `transparent`              | Dropzone surface at rest.            |
| `--dm-file-upload-fg`            | `var(--dm-fg-muted)`       | Dropzone base text color.            |
| `--dm-file-upload-border`        | `var(--dm-border-strong)`  | Dashed dropzone border color.        |
| `--dm-file-upload-radius`        | `var(--dm-radius-lg)`      | Dropzone corner rounding.            |
| `--dm-file-upload-border-active` | `var(--dm-primary)`        | Dropzone border while dragging over. |
| `--dm-file-upload-bg-active`     | `var(--dm-primary-subtle)` | Dropzone fill while dragging over.   |
| `--dm-file-upload-item-bg`       | `var(--dm-bg-muted)`       | Selected-file list row surface.      |
| `--dm-file-upload-item-radius`   | `var(--dm-radius-md)`      | Selected-file list row rounding.     |
