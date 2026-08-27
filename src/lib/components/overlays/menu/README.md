# Menu (`dm-menu`)

Accessible dropdown menu following the WAI-ARIA **menu** pattern. A directive turns any element into the trigger; the panel is portalised into a CDK overlay with automatic flipping, roving-focus keyboard navigation (`FocusKeyManager`), type-ahead, sections, dividers and per-item shortcuts.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
import {
  DmMenuComponent,
  DmMenuTriggerDirective,
  DmMenuItemComponent,
  DmMenuSectionComponent,
  DmMenuDividerComponent,
} from '@dmaster/ui';
```

```html
<button [dmMenuTrigger]="actions">Actions</button>

<dm-menu #actions ariaLabel="Row actions">
  <dm-menu-section heading="Edit">
    <dm-menu-item shortcut="⌘C" (selected)="copy()">Copy</dm-menu-item>
    <dm-menu-item shortcut="⌘V" (selected)="paste()">Paste</dm-menu-item>
  </dm-menu-section>
  <dm-menu-divider />
  <dm-menu-item color="danger" shortcut="⌫" (selected)="remove()">Delete</dm-menu-item>
</dm-menu>
```

The trigger accepts any element, including a `dm-button`:

```html
<dm-button [dmMenuTrigger]="actions" variant="flat">Actions</dm-button>
```

## Pieces

| Selector          | Kind      | Purpose                                                            |
| ----------------- | --------- | ------------------------------------------------------------------ |
| `[dmMenuTrigger]` | directive | Opens the referenced `<dm-menu>`; owns the overlay + trigger ARIA. |
| `dm-menu`         | component | The `role="menu"` panel, focus manager and open/close lifecycle.   |
| `dm-menu-item`    | component | A `role="menuitem"` row; supports `disabled`, `color`, `shortcut`. |
| `dm-menu-section` | component | Groups items under an optional heading (`role="group"`).           |
| `dm-menu-divider` | component | A subtle `role="separator"` rule.                                  |

## API

### `[dmMenuTrigger]`

| Input           | Type              | Default | Description                              |
| --------------- | ----------------- | ------- | ---------------------------------------- |
| `dmMenuTrigger` | `DmMenuComponent` | —       | The menu to open. Bind the template ref. |

### `dm-menu`

| Input           | Type                                                         | Default          | Description                                     |
| --------------- | ------------------------------------------------------------ | ---------------- | ----------------------------------------------- |
| `placement`     | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | Preferred placement; flips when space is tight. |
| `closeOnSelect` | `boolean`                                                    | `true`           | Close the menu when an item is activated.       |
| `ariaLabel`     | `string`                                                     | `''`             | Accessible name for the `role="menu"` panel.    |

| Output   | Payload | Description                     |
| -------- | ------- | ------------------------------- |
| `opened` | `void`  | Emitted after the panel opens.  |
| `closed` | `void`  | Emitted after the panel closes. |

### `dm-menu-item`

| Input      | Type                    | Default     | Description                                      |
| ---------- | ----------------------- | ----------- | ------------------------------------------------ |
| `disabled` | `boolean`               | `false`     | Skipped by keyboard navigation; not activatable. |
| `color`    | `'default' \| 'danger'` | `'default'` | `danger` tints the row and its hover state red.  |
| `shortcut` | `string`                | —           | Keyboard-shortcut hint rendered in a `<kbd>`.    |

| Output     | Payload | Description                               |
| ---------- | ------- | ----------------------------------------- |
| `selected` | `void`  | Item activated via Enter / Space / click. |

Projection slots: `[dmMenuItemStart]` (leading icon) and `[dmMenuItemEnd]` (trailing content).

### `dm-menu-section`

| Input     | Type     | Default | Description                                |
| --------- | -------- | ------- | ------------------------------------------ |
| `heading` | `string` | `''`    | Uppercase group label (`aria-labelledby`). |

Global defaults: `provideMenuDefaults({ placement, closeOnSelect })` / `MENU_DEFAULTS`.

## Keyboard & focus

| Key                                        | Action                                                   |
| ------------------------------------------ | -------------------------------------------------------- |
| **Click**                                  | Toggle; opens with focus on the panel.                   |
| **ArrowDown / Enter / Space** (on trigger) | Open, focus the **first** item.                          |
| **ArrowUp** (on trigger)                   | Open, focus the **last** item.                           |
| **ArrowUp / ArrowDown**                    | Move between items, wrapping and skipping disabled ones. |
| **Home / End**                             | Jump to the first / last item.                           |
| **A–Z / 0–9**                              | Type-ahead: focus the item whose label matches.          |
| **Enter / Space**                          | Activate the focused item.                               |
| **Escape**                                 | Close and return focus to the trigger.                   |
| **Tab**                                    | Close and return focus to the trigger.                   |
| **Outside click**                          | Close (focus is not forced back to the trigger).         |

## Accessibility

- Trigger exposes `aria-haspopup="menu"`, reactive `aria-expanded`, and `aria-controls` pointing at the panel.
- Panel is `role="menu"` (labelled by `ariaLabel`); items are `role="menuitem"` with `tabindex="-1"`, driven by a roving `FocusKeyManager`.
- Sections are `role="group"` labelled by their heading; dividers are `role="separator"`.
- Disabled items carry `aria-disabled="true"` and are skipped by keyboard navigation.
- Motion (the scale/fade pop-in and the elastic press) is disabled under `prefers-reduced-motion`.

## Design tokens

| Token                      | Default                           | Description                                 |
| -------------------------- | --------------------------------- | ------------------------------------------- |
| `--dm-menu-bg`             | `var(--dm-bg-elevated)`           | Panel background surface.                   |
| `--dm-menu-fg`             | `var(--dm-fg)`                    | Panel text color.                           |
| `--dm-menu-border`         | `var(--dm-border)`                | Panel border color.                         |
| `--dm-menu-radius`         | `var(--dm-radius-lg)`             | Panel corner radius.                        |
| `--dm-menu-shadow`         | `var(--dm-shadow-lg)`             | Panel elevation shadow.                     |
| `--dm-menu-padding`        | `var(--dm-space-1)`               | Inner padding of the panel.                 |
| `--dm-menu-min-width`      | `12rem`                           | Minimum panel width.                        |
| `--dm-menu-max-width`      | `20rem`                           | Maximum panel width.                        |
| `--dm-menu-max-height`     | `min(24rem, calc(100dvh - 2rem))` | Maximum panel height before scrolling.      |
| `--dm-menu-item-fg`        | `var(--dm-fg)`                    | Default item text color.                    |
| `--dm-menu-item-active-bg` | `var(--dm-default-subtle)`        | Background of the active / hovered item.    |
| `--dm-menu-item-radius`    | `var(--dm-radius-md)`             | Corner radius of each item row.             |
| `--dm-menu-divider-color`  | `var(--dm-border)`                | Color of the `dm-menu-divider` rule.        |
