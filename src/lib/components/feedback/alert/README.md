# Alert (`dm-alert`)

Contextual feedback banner with a HeroUI-style color × variant API, a semantic icon per color, an optional dismiss button and an action slot. No Angular Material dependency.

## Usage

```ts
import { DmAlertComponent } from '@dmaster/ui';
```

```html
<!-- Basic -->
<dm-alert color="success" title="Payment received" description="We emailed the receipt." />

<!-- Free body content (projected below the description, if any) -->
<dm-alert color="warning" title="Storage almost full">
  <p>You have used 92% of your quota.</p>
</dm-alert>

<!-- Dismissible with an action -->
<dm-alert color="danger" variant="faded" title="Message deleted" [dismissible]="true">
  <dm-button dmAlertAction size="sm" variant="light" color="danger">Undo</dm-button>
</dm-alert>
```

## API

| Input          | Type                                                                          | Default     | Description                                                     |
| -------------- | ----------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `color`        | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Semantic color. It also selects the built-in icon.              |
| `variant`      | `'flat' \| 'faded' \| 'solid' \| 'bordered'`                                  | `'flat'`    | Visual variant.                                                 |
| `title`        | `string`                                                                      | —           | Bold first line.                                                |
| `description`  | `string`                                                                      | —           | Supporting text under the title.                                |
| `hideIcon`     | `boolean`                                                                     | `false`     | Hides the semantic icon.                                        |
| `dismissible`  | `boolean`                                                                     | `false`     | Shows the dismiss button.                                       |
| `dismissLabel` | `string`                                                                      | `'Dismiss'` | Accessible label of the dismiss button (from `ALERT_DEFAULTS`). |

| Output   | Payload | Description                               |
| -------- | ------- | ----------------------------------------- |
| `closed` | `void`  | Emitted after the alert dismisses itself. |

### Content slots

- Default `<ng-content>` — free body, rendered inside the content column **after** the `description` input (both render when both are present).
- `<ng-content select="[dmAlertAction]" />` — action slot aligned to the end (e.g. an "Undo" `dm-button`). The slot collapses when nothing is projected.

### Icons

The icon is picked by `color`: info circle for `default`/`primary`/`secondary`, check circle for `success`, warning triangle for `warning`, x circle for `danger`. Inline SVG, `currentColor`, 20px, Heroicons-outline style.

## Dismiss behavior (self-dismissing)

Pressing the dismiss button hides the alert itself (`display: none` on the host, which also removes it from the accessibility tree) and emits `closed`. The component does **not** re-show itself: to display it again, re-create it with an `@if` in the consumer:

```html
@if (alertVisible()) {
<dm-alert title="Saved" [dismissible]="true" (closed)="alertVisible.set(false)" />
} @else {
<dm-button size="sm" variant="flat" (clicked)="alertVisible.set(true)">Show again</dm-button>
}
```

Driving visibility only from your own signal (as above) keeps the internal state and yours in sync, because the `@if` re-instantiates a fresh, visible alert.

## Global defaults

```ts
providers: [provideAlertDefaults({ variant: 'faded', dismissLabel: 'Cerrar' })];
```

Or provide `ALERT_DEFAULTS` directly. `dismissLabel` is the only built-in copy (same policy as the toast) — override it per app language.

## Theming

CSS variables (all with fallback, overridable at any scope):

- `--dm-alert-radius` — corner rounding (defaults to `--dm-radius-lg`).
- `--dm-alert-padding` — outer padding (defaults to `--dm-space-3` / `--dm-space-4`).
- `--dm-alert-gap` — gap between icon, content, action and dismiss (defaults to `--dm-space-3`).

Colors map to generic local variables (`--dm-alert`, `--dm-alert-fg`, `--dm-alert-soft`, `--dm-alert-line`, `--dm-alert-accent`, `--dm-alert-icon-bg`) consumed by the variants — the flat/faded text tone mixes the color with `--dm-fg`, so it darkens on light themes and lightens on dark ones automatically.

## Accessibility

- Host is `role="alert"`: assistive technology announces the content as soon as the alert renders.
- The dismiss button is a real `<button>` with `aria-label` (`dismissLabel`), a visible focus ring and a ≥44px touch target.
- Icons are decorative (`aria-hidden="true"`); meaning is always carried by the text.
- The entry animation is disabled under `prefers-reduced-motion`.
- Note: `title` shadows the native HTML attribute — when set statically (`title="…"`) the browser may also show its default tooltip on hover; bind it (`[title]="…"`) to avoid that.
