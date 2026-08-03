# Loading Button (`dm-loading-button`)

Button with built-in loading / success / error states. Stable width (no layout shift), integrated spinner, disabled while loading and screen-reader announcements via a polite live region. No Angular Material dependency.

## Usage

```ts
import { DmLoadingButtonComponent } from 'ngx-dmaster-ui';
```

```html
<dm-loading-button
  [state]="saving() ? 'loading' : 'idle'"
  loadingLabel="Saving changes"
  (clicked)="save()"
>
  Save changes
</dm-loading-button>

<dm-loading-button variant="outline" size="sm">Cancel</dm-loading-button>
<dm-loading-button variant="danger" state="error" errorLabel="Something failed">
  Delete
</dm-loading-button>
```

## API

| Input          | Type                                                           | Default     | Description                                                     |
| -------------- | -------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `variant`      | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style.                                                   |
| `size`         | `'sm' \| 'md' \| 'lg'`                                         | `'md'`      | Heights follow the global density tokens.                       |
| `state`        | `'idle' \| 'loading' \| 'success' \| 'error'`                  | `'idle'`    | `loading` disables the button; `success`/`error` flash an icon. |
| `disabled`     | `boolean`                                                      | `false`     | Also disabled automatically while loading.                      |
| `type`         | `'button' \| 'submit' \| 'reset'`                              | `'button'`  | Native button type.                                             |
| `loadingLabel` | `string`                                                       | `''`        | Announced while loading (the library ships no copy of its own). |
| `successLabel` | `string`                                                       | `''`        | Announced on success.                                           |
| `errorLabel`   | `string`                                                       | `''`        | Announced on error.                                             |

| Output    | Type         | Description                                             |
| --------- | ------------ | ------------------------------------------------------- |
| `clicked` | `MouseEvent` | Emitted on click, only while the button is interactive. |

## Global defaults

```ts
providers: [provideLoadingButtonDefaults({ variant: 'outline', size: 'lg' })];
```

Or provide `LOADING_BUTTON_DEFAULTS` directly.

## Accessibility

- `aria-busy="true"` + `disabled` on the internal button while loading — no duplicate submissions.
- State changes are announced through a visually hidden `aria-live="polite"` region using the labels you provide.
- The label keeps its space while the indicator shows: the button never resizes (no layout shift).
- `prefers-reduced-motion: reduce` stops the spinner rotation and makes transitions instant.
- `sm` buttons keep a ≥44px hit area on coarse pointers.
