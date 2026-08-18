# Button (`dm-button`)

Button with a **color × variant** API and built-in loading / success / error states. Stable width (no layout shift), integrated spinner, disabled while loading and screen-reader announcements via a polite live region. No Angular Material dependency.

## Usage

```ts
import { DmButtonComponent } from '@dmaster/ui';
```

```html
<dm-button color="primary" variant="solid">Solid</dm-button>
<dm-button color="primary" variant="flat">Flat</dm-button>
<dm-button color="primary" variant="faded">Faded</dm-button>
<dm-button color="secondary" variant="bordered">Bordered</dm-button>
<dm-button color="danger" variant="shadow">Shadow</dm-button>
<dm-button color="success" variant="flat" radius="full">Pill</dm-button>

<dm-button [state]="saving() ? 'loading' : 'idle'" loadingLabel="Saving changes" (clicked)="save()">
  Save changes
</dm-button>
```

## API

| Input          | Type                                                                           | Default     | Description                                                     |
| -------------- | ------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------- |
| `color`        | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'`  | `'primary'` | Semantic color.                                                 |
| `variant`      | `'solid' \| 'flat' \| 'faded' \| 'bordered' \| 'light' \| 'ghost' \| 'shadow'` | `'solid'`   | Visual variant. `shadow` casts a colored glow.                  |
| `radius`       | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                     | `'md'`      | Corner rounding. `full` is pill-shaped.                         |
| `size`         | `'sm' \| 'md' \| 'lg'`                                                         | `'md'`      | 32px / 40px / 48px heights.                                     |
| `state`        | `'idle' \| 'loading' \| 'success' \| 'error'`                                  | `'idle'`    | `loading` disables the button; `success`/`error` flash an icon. |
| `disabled`     | `boolean`                                                                      | `false`     | Also disabled automatically while loading.                      |
| `type`         | `'button' \| 'submit' \| 'reset'`                                              | `'button'`  | Native button type.                                             |
| `loadingLabel` | `string`                                                                       | `''`        | Announced while loading (the library ships no copy of its own). |
| `successLabel` | `string`                                                                       | `''`        | Announced on success.                                           |
| `errorLabel`   | `string`                                                                       | `''`        | Announced on error.                                             |

| Output    | Type         | Description                                             |
| --------- | ------------ | ------------------------------------------------------- |
| `clicked` | `MouseEvent` | Emitted on click, only while the button is interactive. |

## Global defaults

```ts
providers: [provideButtonDefaults({ variant: 'flat', radius: 'lg' })];
```

Or provide `BUTTON_DEFAULTS` directly.

## Accessibility

- `aria-busy="true"` + `disabled` on the internal button while loading — no duplicate submissions.
- State changes are announced through a visually hidden `aria-live="polite"` region using the labels you provide.
- The label keeps its space while the indicator shows: the button never resizes (no layout shift).
- `prefers-reduced-motion: reduce` stops the spinner rotation and makes transitions instant.
- `sm` buttons keep a ≥44px hit area on coarse pointers.
