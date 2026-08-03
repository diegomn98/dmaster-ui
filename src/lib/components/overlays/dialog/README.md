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
  protected readonly data = inject(DIALOG_DATA); // re-exported by ngx-dmaster-ui
  private readonly ref = inject(DialogRef); // re-exported by ngx-dmaster-ui
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
