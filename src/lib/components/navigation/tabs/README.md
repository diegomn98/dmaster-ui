# Tabs (`dm-tabs`)

Composite tabs with a color × variant API, an **animated sliding indicator**, roving-tabindex keyboard navigation and full ARIA wiring. Panels are matched to their trigger by `value`. By default tabs are **full width** with an **underlined** look and a separator rule — a clean nav-bar out of the box.

## Usage

```ts
import { DmTabPanelComponent, DmTabComponent, DmTabsComponent } from '@dmaster/ui';
```

```html
<dm-tabs [(selectedValue)]="tab" color="primary" variant="solid" ariaLabel="Sections">
  <dm-tab value="overview">Overview</dm-tab>
  <dm-tab value="pricing">Pricing</dm-tab>
  <dm-tab value="faq" [disabled]="true">FAQ</dm-tab>

  <dm-tab-panel value="overview">…</dm-tab-panel>
  <dm-tab-panel value="pricing">…</dm-tab-panel>
  <dm-tab-panel value="faq">…</dm-tab-panel>
</dm-tabs>
```

If `selectedValue` is left undefined the first enabled tab becomes active on render — the component always has a resolved selection to drive its UI.

### Lazy panels

Add the bare `lazy` attribute to defer each panel's projected content until its tab is first activated. Once a panel has been visited it stays mounted (only hidden while inactive), so state inside it survives tab switches. The panel active on first render is instantiated immediately.

```html
<dm-tabs lazy ariaLabel="Sections">
  <dm-tab value="overview">Overview</dm-tab>
  <dm-tab value="reports">Reports</dm-tab>

  <dm-tab-panel value="overview">…</dm-tab-panel>
  <!-- Not created until the Reports tab is first opened. -->
  <dm-tab-panel value="reports"><app-heavy-report /></dm-tab-panel>
</dm-tabs>
```

## API — `<dm-tabs>`

| Input           | Type                                                                          | Default        | Description                                                  |
| --------------- | ----------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------ |
| `selectedValue` | `string \| undefined`                                                         | first tab      | Value of the active tab. Two-way (`[(selectedValue)]`).      |
| `color`         | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'`    | Semantic color.                                              |
| `variant`       | `'solid' \| 'bordered' \| 'light' \| 'underlined'`                            | `'underlined'` | Visual variant.                                              |
| `size`          | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`         | Size scale (32/40/48px tabs).                                |
| `radius`        | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`         | Corner rounding. Ignored by the `underlined` variant.        |
| `placement`     | `'top' \| 'start'`                                                            | `'top'`        | `start` renders the tablist vertically at the inline start.  |
| `fullWidth`     | `boolean`                                                                     | `true`         | Stretch tabs to share the row (horizontal) equally.          |
| `divider`       | `boolean`                                                                     | `true`         | Separator rule under the tablist (`light` / `underlined`).   |
| `lazy`          | `boolean`                                                                     | `false`        | Defer each panel's content until its tab is first activated. |
| `disabled`      | `boolean`                                                                     | `false`        | Disables the whole tablist.                                  |
| `ariaLabel`     | `string`                                                                      | `''`           | Accessible label for the tablist.                            |

## API — `<dm-tab>`

| Input      | Type      | Default | Description                                        |
| ---------- | --------- | ------- | -------------------------------------------------- |
| `value`    | `string`  | —       | Required. Matches the panel with the same `value`. |
| `disabled` | `boolean` | `false` | Disables the tab; keyboard navigation skips it.    |

## API — `<dm-tab-panel>`

| Input   | Type     | Default | Description                                      |
| ------- | -------- | ------- | ------------------------------------------------ |
| `value` | `string` | —       | Required. Matches the tab with the same `value`. |

## Global defaults

```ts
providers: [provideTabsDefaults({ variant: 'underlined', size: 'lg' })];
```

Or provide `TABS_DEFAULTS` directly.

## Theming

The tablist emits CSS variables that the tab consumes through DOM inheritance:

- `--dm-tab-h`, `--dm-tab-px`, `--dm-tab-fs` — size scale.
- `--dm-tab-r`, `--dm-tab-radius` — container radius / effective tab radius.
- `--dm-tab-active`, `--dm-tab-fg`, `--dm-tab-subtle`, `--dm-tab-line` — color mapping consumed by the variant-specific selected states.

Overriding any of these at a scope re-skins the tabs without touching the SCSS.

## Accessibility

- Tablist exposes `role="tablist"` with `aria-orientation` derived from `placement`.
- Tabs expose `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`.
- Panels expose `role="tabpanel"`, `aria-labelledby`, and receive `hidden` when inactive.
- Keyboard: `ArrowLeft` / `ArrowRight` (horizontal) or `ArrowUp` / `ArrowDown` (vertical) move focus and activation, `Home` / `End` jump to the first / last enabled tab, `Space` / `Enter` activate the focused tab.
- Focus ring uses the global `--dm-ring` token; press shrinks with `--dm-ease-snappy`.
- Motion is disabled under `prefers-reduced-motion` via the global duration tokens.

## Design tokens

Public CSS custom properties, consumed with local fallbacks — override them at any scope (globally, per theme, or on a subtree) without touching the SCSS. Where a default "varies by variant", overriding the token applies the same value to every variant.

| Token                           | Default                                            | Description                                                 |
| ------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `--dm-tabs-gap`                 | `var(--dm-space-4)` (`--dm-space-6` vertical)      | Gap between the tablist and the panels.                     |
| `--dm-tabs-list-bg`             | `var(--dm-bg-subtle)`                              | Container fill of the `solid` / `segment` tablist.          |
| `--dm-tabs-list-border`         | `var(--dm-border)` (`--dm-border-strong` bordered) | Container border color of `solid` / `bordered` / `segment`. |
| `--dm-tabs-indicator-bg`        | Varies by variant                                  | Fill of the sliding indicator (pill or underline rule).     |
| `--dm-tabs-indicator-thickness` | `2.5px` (horizontal) / `2px` (vertical)            | Thickness of the `underlined` indicator rule.               |
| `--dm-tabs-tab-fg`              | `var(--dm-fg-muted)`                               | Resting (unselected) tab text color.                        |
| `--dm-tabs-tab-fg-hover`        | `var(--dm-fg)`                                     | Tab text color on hover.                                    |
| `--dm-tabs-tab-bg-hover`        | `var(--dm-default-subtle)`                         | Hover wash behind a tab (contained variants).               |
| `--dm-tabs-tab-fg-selected`     | Varies by variant                                  | Selected tab text color.                                    |
