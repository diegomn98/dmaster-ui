# Toast (`DmToastService`)

Notification queue. Toasts stack bottom-right by default (configurable via the `position` default), auto-dismiss (configurable) and are announced politely (`role="status"`).

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

| Option        | Type                                              | Default     | Description                                         |
| ------------- | ------------------------------------------------- | ----------- | --------------------------------------------------- |
| `variant`     | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Semantic color + icon.                              |
| `duration`    | `number`                                          | `4000`      | Auto-dismiss in ms; `0` disables it.                |
| `dismissible` | `boolean`                                         | `true`      | Shows the dismiss button.                           |
| `title`       | `string`                                          | —           | Bold title rendered above the message.              |
| `action`      | `DmToastAction`                                   | —           | Action button; running it also dismisses the toast. |

Global defaults (including `dismissLabel`, the only built-in copy — override per app language, and `position`): `provideToastDefaults({...})` / `TOAST_DEFAULTS`.

### Title & action

`title` renders bold above the message; `action` renders a compact button that runs `handler()` and then dismisses that toast (its `afterDismissed` promise resolves as usual).

```ts
this.toast.show('Conversation archived', {
  title: 'Archived',
  action: { label: 'Undo', handler: () => this.restore() },
});
```

### Position

`position` (`'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center'`, default `'bottom-right'`) is a **global default**, not a per-toast option: all toasts share one container, and the value is read once when the first toast creates it.

```ts
providers: [provideToastDefaults({ position: 'top-center' })]
```

## Accessibility

- Each toast is `role="status"`: announced without interrupting.
- Dismiss button with configurable `aria-label` and ≥44px touch target.
- Entrance animation honors reduced-motion via the duration tokens.

## Design tokens

| Token                        | Default                                                      | Description                                   |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `--dm-toast-bg`              | `color-mix(in srgb, var(--dm-bg-elevated) 85%, transparent)` | Toast surface (translucent glass by default). |
| `--dm-toast-fg`              | `var(--dm-fg)`                                               | Toast text color.                             |
| `--dm-toast-radius`          | `var(--dm-radius-lg)`                                        | Toast corner radius.                          |
| `--dm-toast-shadow`          | `var(--dm-shadow-lg)`                                        | Toast elevation shadow.                       |
| `--dm-toast-width`           | `min(22rem, calc(100vw - 2rem))`                             | Width of the toast stack.                     |
| `--dm-toast-gap`             | `var(--dm-space-3)`                                          | Vertical gap between stacked toasts.          |
| `--dm-toast-title-weight`    | `var(--dm-font-semibold)`                                    | Font weight of the optional title.            |
| `--dm-toast-action-fg`       | `var(--dm-primary-text)`                                     | Action button label color.                    |
| `--dm-toast-action-bg-hover` | `var(--dm-primary-subtle)`                                   | Action button hover wash.                     |
