# Command palette (`dm-command`)

A ⌘K command palette — a centered modal with a search box over a flat, grouped
list of actions, in the spirit of Linear / Vercel / Raycast. Declared **once**
(typically at the app root), controlled by state, and toggled from anywhere by a
global hotkey.

```html
<dm-command [items]="commands" [(open)]="paletteOpen" (selected)="run($event)" />
```

```ts
readonly commands: DmCommandItem[] = [
  { id: 'new', label: 'New file', group: 'File', shortcut: '⌘N', keywords: ['create'] },
  { id: 'open', label: 'Open file…', group: 'File', shortcut: '⌘O' },
  { id: 'settings', label: 'Open settings', group: 'General' },
];

readonly paletteOpen = signal(false);

run(item: DmCommandItem): void {
  // The palette closes itself; you decide the action.
  this.router.navigateByUrl(`/${item.id}`);
}
```

## How it works

- **Rendered in a CDK overlay** with a `GlobalPositionStrategy` — centered
  horizontally, pinned ~20vh from the top — a blurred backdrop and a blocking
  scroll strategy. The panel box and its entrance animation are **encapsulated**
  in the component (it is a `TemplatePortal`, so it keeps the component's
  styling scope); only the backdrop is a global style.
- **Two-way `open`** drives the whole lifecycle. Set it, bind it, or let the
  hotkey / backdrop / Escape / a selection flip it back to `false`.
- **`hotkey`** (default `'mod+k'`) registers a document-level listener where
  `mod` resolves to ⌘ on macOS and Ctrl elsewhere. `''` disables it. The
  listener is browser-only (never runs during SSR prerender) and is cleaned up
  on destroy.
- **Filtering** is a case-insensitive substring match over each item's `label`
  plus its `keywords`. Results are bucketed by `group`, preserving the order in
  which each group first appears; items with no `group` render without a
  heading.
- **Keyboard** follows the combobox + listbox pattern: focus stays in the input
  while `aria-activedescendant` tracks the highlighted row. Type to filter,
  ↑/↓ to move (wrapping, skipping disabled), Home/End to jump, ↵ to activate,
  Esc to close. Selecting an item emits `selected` and closes; disabled items
  are never selectable.

## Accessibility

- The panel is `role="dialog"` `aria-modal="true"` with an `aria-label`; focus
  is trapped inside (`cdkTrapFocus`) and restored to the previously-focused
  element on close.
- The input is `role="combobox"` `aria-expanded="true"`, `aria-controls` the
  listbox and `aria-activedescendant` the active option.
- The list is `role="listbox"`; each row is `role="option"` with a unique `id`,
  `aria-selected` and `aria-disabled`. Groups are `role="group"` labelled by
  their heading.
- The footer spells out the shortcuts with `dm-kbd`.

## API

| Input / Output | Type                    | Default              | Notes                                       |
| -------------- | ----------------------- | -------------------- | ------------------------------------------- |
| `items`        | `DmCommandItem[]`       | — (required)         | Actions to render.                          |
| `open`         | `model<boolean>`        | `false`              | Two-way open state.                         |
| `hotkey`       | `string`                | `'mod+k'`            | Global toggle combo; `''` disables.         |
| `placeholder`  | `string`                | `'Search…'`          | Search input placeholder.                   |
| `emptyLabel`   | `string`                | `'No results found'` | Shown when nothing matches.                 |
| `ariaLabel`    | `string`                | `'Command palette'`  | Accessible name for the dialog.             |
| `selected`     | `output<DmCommandItem>` | —                    | Emitted on activation; palette then closes. |

`DmCommandItem`: `{ id; label; group?; keywords?; shortcut?; disabled?; icon? }`.
`icon` is reserved (not rendered in v1).

Override the copy app-wide:

```ts
providers: [provideCommandDefaults({ hotkey: 'mod+p', placeholder: 'Jump to…' })];
```

Requires the CDK structural styles once per app:

```json
"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", "..."]
```

## Design tokens

| Token                        | Default                           | Description                                     |
| ---------------------------- | --------------------------------- | ----------------------------------------------- |
| `--dm-command-bg`            | `var(--dm-bg-elevated)`           | Panel background surface.                       |
| `--dm-command-fg`            | `var(--dm-fg)`                    | Panel text color.                               |
| `--dm-command-border`        | `var(--dm-border)`                | Panel border color.                             |
| `--dm-command-radius`        | `var(--dm-radius-xl)`             | Panel corner radius.                            |
| `--dm-command-shadow`        | `var(--dm-shadow-lg)`             | Panel elevation shadow.                         |
| `--dm-command-width`         | `min(40rem, 92vw)`                | Panel width.                                    |
| `--dm-command-max-height`    | `min(70dvh, calc(100dvh - 4rem))` | Maximum panel height.                           |
| `--dm-command-active-bg`     | `var(--dm-default-subtle)`        | Background of the active (highlighted) option.  |
| `--dm-command-active-fg`     | `var(--dm-fg)`                    | Text color of the active option.                |
| `--dm-command-option-radius` | `var(--dm-radius-md)`             | Corner radius of each option row.               |
| `--dm-command-divider-color` | `var(--dm-border)`                | Color of the header and footer separator lines. |
| `--dm-command-footer-bg`     | `var(--dm-bg-subtle)`             | Background of the keyboard-hints footer.        |
