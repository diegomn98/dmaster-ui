# Dialog (`DmDialogService`)

Thin wrapper over the CDK Dialog with the library look. Focus trap, Escape/backdrop handling and `aria-modal` come from the CDK; panel/backdrop styling ships in the library's global stylesheet.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
private readonly dialog = inject(DmDialogService);

openSettings(): void {
  const ref = this.dialog.open(SettingsDialogComponent, { size: 'lg', data: { userId: 7 } });
  ref.closed.subscribe((result) => …);
}
```

Content component (or a `TemplateRef` — `open()` accepts both):

```ts
export class SettingsDialogComponent {
  protected readonly data = inject(DIALOG_DATA); // re-exported by @dmaster/ui
  private readonly ref = inject(DialogRef); // re-exported by @dmaster/ui
  close(): void {
    this.ref.close('saved');
  }
}
```

## Templates

`open()` also takes a `TemplateRef`, so a one-off dialog needs no dedicated component:

```html
<ng-template #preview><img [src]="url()" alt="Preview" /></ng-template>
```

```ts
readonly preview = viewChild.required<TemplateRef<unknown>>('preview');

openPreview(): void {
  this.dialog.open(this.preview(), { size: 'lg', ariaLabel: 'Preview' });
}
```

## Confirm helper

`confirm()` opens a ready-made confirmation dialog (title, optional message, cancel + confirm footer) and resolves with the user's choice — `true` on confirm, `false` on cancel, Escape or backdrop click. The library ships no copy of its own, so `title`, `confirmLabel` and `cancelLabel` are required:

```ts
const confirmed = await this.dialog.confirm({
  title: 'Delete this file?',
  message: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  color: 'danger',
});
```

The content component (`DmConfirmDialogComponent`) is exported for reference, but is meant to be opened through `confirm()`.

### `DmConfirmOptions`

| Option         | Type                                                                          | Default     | Description                                           |
| -------------- | ----------------------------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| `title`        | `string`                                                                      | required    | Heading; doubles as the dialog's accessible name.     |
| `message`      | `string`                                                                      | —           | Optional supporting text under the title.             |
| `confirmLabel` | `string`                                                                      | required    | Label of the confirming button (resolves `true`).     |
| `cancelLabel`  | `string`                                                                      | required    | Label of the cancel button (resolves `false`).        |
| `color`        | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Semantic color of the confirming button.              |
| `size`         | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Panel width (22rem / 30rem / 42rem, viewport-capped). |
| `disableClose` | `boolean`                                                                     | `false`     | Blocks backdrop click and Escape.                     |
| `panelClass`   | `string \| readonly string[]`                                                 | —           | Extra panel class(es) — same as `DmDialogConfig`.     |

## `DmDialogConfig`

| Option         | Type                   | Default | Description                                           |
| -------------- | ---------------------- | ------- | ----------------------------------------------------- |
| `data`         | `D`                    | —       | Injected via `DIALOG_DATA`.                           |
| `size`         | `'sm' \| 'md' \| 'lg'` | `'md'`  | Panel width (22rem / 30rem / 42rem, viewport-capped). |
| `disableClose` | `boolean`              | `false` | Blocks backdrop click and Escape.                     |
| `ariaLabel`    | `string`               | —       | Accessible name of the dialog.                        |

## Accessibility

- CDK: focus trap, focus restore on close, `role="dialog"` + `aria-modal`.
- Entrance animations honor reduced-motion via the duration tokens.

## Design tokens

| Token                     | Default                                                | Description                                     |
| ------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `--dm-dialog-bg`          | `var(--dm-bg-elevated)`                                | Background of the dialog panel.                 |
| `--dm-dialog-fg`          | `var(--dm-fg)`                                         | Text color inside the dialog panel.             |
| `--dm-dialog-radius`      | `var(--dm-radius-xl)`                                  | Corner radius of the dialog panel.              |
| `--dm-dialog-padding`     | `var(--dm-space-5)` (`var(--dm-space-6)` from `sm` up) | Inner padding of the dialog panel.              |
| `--dm-dialog-width-sm`    | `22rem`                                                | Panel width for `size: 'sm'` (viewport-capped). |
| `--dm-dialog-width-md`    | `30rem`                                                | Panel width for `size: 'md'` (viewport-capped). |
| `--dm-dialog-width-lg`    | `42rem`                                                | Panel width for `size: 'lg'` (viewport-capped). |
| `--dm-dialog-backdrop-bg` | `rgb(0 0 0 / 50%)`                                     | Backdrop scrim color behind the dialog.         |

The panel is attached to the CDK overlay container at the document root, so set these tokens globally (e.g. on `:root`/`html`) or scope them via `panelClass` in `DmDialogConfig`.
