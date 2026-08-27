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

Content component:

```ts
export class SettingsDialogComponent {
  protected readonly data = inject(DIALOG_DATA); // re-exported by @dmaster/ui
  private readonly ref = inject(DialogRef); // re-exported by @dmaster/ui
  close(): void {
    this.ref.close('saved');
  }
}
```

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

| Token                      | Default                | Description                                                    |
| -------------------------- | ---------------------- | -------------------------------------------------------------- |
| `--dm-dialog-bg`           | `var(--dm-bg-elevated)` | Background of the dialog panel.                                |
| `--dm-dialog-fg`           | `var(--dm-fg)`         | Text color inside the dialog panel.                            |
| `--dm-dialog-radius`       | `var(--dm-radius-xl)`  | Corner radius of the dialog panel.                             |
| `--dm-dialog-padding`      | `var(--dm-space-5)` (`var(--dm-space-6)` from `sm` up) | Inner padding of the dialog panel.     |
| `--dm-dialog-width-sm`     | `22rem`                | Panel width for `size: 'sm'` (viewport-capped).                |
| `--dm-dialog-width-md`     | `30rem`                | Panel width for `size: 'md'` (viewport-capped).                |
| `--dm-dialog-width-lg`     | `42rem`                | Panel width for `size: 'lg'` (viewport-capped).                |
| `--dm-dialog-backdrop-bg`  | `rgb(0 0 0 / 50%)`     | Backdrop scrim color behind the dialog.                        |

The panel is attached to the CDK overlay container at the document root, so set these tokens globally (e.g. on `:root`/`html`) or scope them via `panelClass` in `DmDialogConfig`.
