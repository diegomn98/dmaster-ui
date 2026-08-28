# Toast (`DmToastService`)

Notification queue. Toasts stack bottom-right, auto-dismiss (configurable) and are announced politely (`role="status"`).

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
private readonly toast = inject(DmToastService);

this.toast.success('Changes saved');
this.toast.danger('Something went wrong', { duration: 0 });
this.toast.show('Heads up', { variant: 'warning', dismissible: false });
```

## API

- `show(message, options?)` → `DmToastRef { id, dismiss(), afterDismissed }`
- `success | warning | danger(message, options?)` — variant helpers.
- `dismiss(id)` / `dismissAll()`
- `ref.afterDismissed` — a `Promise<void>` that resolves when the toast is gone (auto-dismiss, manual, or `dismissAll`).
- Signal `toasts` (read-only) with the active queue.

### `DmToastOptions`

| Option        | Type                                              | Default     | Description                          |
| ------------- | ------------------------------------------------- | ----------- | ------------------------------------ |
| `variant`     | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Semantic color + icon.               |
| `duration`    | `number`                                          | `4000`      | Auto-dismiss in ms; `0` disables it. |
| `dismissible` | `boolean`                                         | `true`      | Shows the dismiss button.            |

Global defaults (including `dismissLabel`, the only built-in copy — override per app language): `provideToastDefaults({...})` / `TOAST_DEFAULTS`.

## Accessibility

- Each toast is `role="status"`: announced without interrupting.
- Dismiss button with configurable `aria-label` and ≥44px touch target.
- Entrance animation honors reduced-motion via the duration tokens.

## Design tokens

| Token               | Default                                                      | Description                                   |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `--dm-toast-bg`     | `color-mix(in srgb, var(--dm-bg-elevated) 85%, transparent)` | Toast surface (translucent glass by default). |
| `--dm-toast-fg`     | `var(--dm-fg)`                                               | Toast text color.                             |
| `--dm-toast-radius` | `var(--dm-radius-lg)`                                        | Toast corner radius.                          |
| `--dm-toast-shadow` | `var(--dm-shadow-lg)`                                        | Toast elevation shadow.                       |
| `--dm-toast-width`  | `min(22rem, calc(100vw - 2rem))`                             | Width of the toast stack.                     |
| `--dm-toast-gap`    | `var(--dm-space-3)`                                          | Vertical gap between stacked toasts.          |
