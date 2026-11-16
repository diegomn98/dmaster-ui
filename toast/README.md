# Toast (`DmToastService`)

Notification queue. Toasts stack bottom-right by default (configurable via the `position` default), auto-dismiss (configurable) and are announced politely (`role="status"`; `role="alert"` for the danger variant).

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
private readonly toast = inject(DmToastService);

this.toast.success('Changes saved');
this.toast.danger('Something went wrong', { duration: 0 });
this.toast.show('Heads up', { variant: 'warning', dismissible: false });
```

The stack **pauses its timers while hovered or focused**, so a toast never vanishes mid-read; a toast can be **swiped away** with the pointer; and no more than `maxVisible` (default 4) show at once — the rest wait in a queue and appear as slots free (each one's timer starting only when it appears).

## API

- `show(message, options?)` → `DmToastRef`.
- `success | warning | danger(message, options?)` — variant helpers.
- `loading(message, options?)` — a spinner toast, sticky by default (call `update()` or `dismiss()` when done).
- `promise(input, messages, options?)` — track a Promise **or** Observable in one toast (see below).
- `dismiss(id)` / `dismissAll()`
- `pause()` / `resume()` — freeze / continue the auto-dismiss timers (the container calls these on hover / focus).
- Read-only signals: `toasts` (visible), `queued` (waiting count), `paused`.

### `DmToastRef`

```ts
interface DmToastRef {
  id: number;
  dismiss(): void;
  update(patch): void; // change message / variant / duration… in place; a new duration restarts the timer
  afterDismissed: Promise<void>; // resolves when the toast is gone (auto, manual, or dismissAll)
}
```

### `promise()`

Shows `loading` (a sticky, non-dismissible spinner), then **updates the same toast in place** to `success` or `danger` with the regular auto-dismiss. Accepts a Promise or an Observable (its first value); `success` / `error` may be functions of the resolved value / error.

```ts
this.toast.promise(this.api.save(), {
  loading: 'Saving…',
  success: (count) => `${count} changes saved`,
  error: (err) => `Could not save: ${err.message}`,
});
```

### `DmToastOptions`

| Option        | Type                                                           | Default     | Description                                         |
| ------------- | -------------------------------------------------------------- | ----------- | --------------------------------------------------- |
| `variant`     | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'neutral'` | Semantic color + icon (`loading` shows a spinner).  |
| `duration`    | `number`                                                       | `4000`      | Auto-dismiss in ms; `0` disables it.                |
| `dismissible` | `boolean`                                                      | `true`      | Shows the dismiss button.                           |
| `title`       | `string`                                                       | —           | Bold title rendered above the message.              |
| `action`      | `DmToastAction`                                                | —           | Action button; running it also dismisses the toast. |

Global defaults (`provideToastDefaults({...})` / `TOAST_DEFAULTS`): `duration`, `dismissible`, `dismissLabel` (the only built-in copy — override per app language), `position`, and `maxVisible` (default `4`).

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
providers: [provideToastDefaults({ position: 'top-center' })];
```

## Accessibility

- Each toast is `role="status"` — `role="alert"` for the danger variant — announced without stealing focus.
- Hovering or focusing the stack pauses every auto-dismiss timer, so a toast never disappears mid-read or while its buttons are in use.
- Dismiss button with configurable `aria-label` and ≥44px touch target; toasts can also be swiped away with the pointer.
- Entrance and exit animations honor reduced-motion via the duration tokens.

## Design tokens

| Token                        | Default                                                      | Description                                   |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `--dm-toast-bg`              | `color-mix(in srgb, var(--dm-bg-elevated) 85%, transparent)` | Toast surface (translucent glass by default). |
| `--dm-toast-fg`              | `var(--dm-fg)`                                               | Toast text color.                             |
| `--dm-toast-border`          | `var(--dm-border)`                                           | Hairline ring around the toast surface.       |
| `--dm-toast-radius`          | `var(--dm-radius-lg)`                                        | Toast corner radius.                          |
| `--dm-toast-shadow`          | `var(--dm-shadow-lg)`                                        | Toast elevation shadow.                       |
| `--dm-toast-width`           | `min(22rem, calc(100vw - 2rem))`                             | Width of the toast stack.                     |
| `--dm-toast-gap`             | `var(--dm-space-3)`                                          | Vertical gap between stacked toasts.          |
| `--dm-toast-title-weight`    | `var(--dm-font-semibold)`                                    | Font weight of the optional title.            |
| `--dm-toast-action-fg`       | `var(--dm-primary-text)`                                     | Action button label color.                    |
| `--dm-toast-action-bg-hover` | `var(--dm-primary-subtle)`                                   | Action button hover wash.                     |
