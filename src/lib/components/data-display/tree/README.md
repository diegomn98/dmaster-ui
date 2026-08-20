# Tree (`dm-tree`)

Hierarchical, data-driven tree view implementing the full WAI-ARIA Tree View
pattern — roving tabindex, complete keyboard model and correct ARIA metadata on
every node. No Angular Material dependency.

## Usage

```ts
import { DmTreeComponent, DmTreeNode } from '@dmaster/ui';
```

```ts
nodes: DmTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'app', label: 'app', children: [{ id: 'main.ts', label: 'main.ts' }] },
      { id: 'styles.scss', label: 'styles.scss' },
    ],
  },
  { id: 'readme', label: 'README.md', disabled: true },
];
```

```html
<dm-tree
  [nodes]="nodes"
  selectionMode="single"
  [(selectedIds)]="selected"
  [(expandedIds)]="expanded"
  ariaLabel="Project files"
  (nodeSelect)="open($event)"
  (nodeToggle)="onToggle($event)"
/>
```

`nodes` is always the full hierarchy; the tree derives the visible flat order
from `expandedIds`. Selection and expansion are both two-way models, so they can
be driven or observed from the outside. Get a template reference and call
`expandAll()` / `collapseAll()` imperatively.

## API

| Input            | Type                               | Default    | Description                                              |
| ---------------- | ---------------------------------- | ---------- | -------------------------------------------------------- |
| `nodes`          | `DmTreeNode[]`                     | `[]`       | The hierarchy to render.                                 |
| `selectionMode`  | `'none' \| 'single' \| 'multiple'` | `'single'` | Selection behaviour.                                     |
| `expandOnSelect` | `boolean`                          | `false`    | Clicking a parent row also toggles its expansion.        |
| `showGuides`     | `boolean`                          | `false`    | Draw connector guide lines along each level.             |
| `ariaLabel`      | `string`                           | `''`       | Accessible label for the `role="tree"` element.          |
| `ariaLabelledby` | `string`                           | `''`       | Id of an external labelling element (`aria-labelledby`). |

| Model         | Type       | Description                                                  |
| ------------- | ---------- | ------------------------------------------------------------ |
| `selectedIds` | `string[]` | Ids of selected nodes (`single` keeps at most one). Two-way. |
| `expandedIds` | `string[]` | Ids of expanded parent nodes. Two-way.                       |

| Output       | Payload      | Description                                      |
| ------------ | ------------ | ------------------------------------------------ |
| `nodeSelect` | `DmTreeNode` | A node became selected (or toggled in multiple). |
| `nodeToggle` | `DmTreeNode` | A node's expanded state was toggled.             |

| Method          | Description                |
| --------------- | -------------------------- |
| `expandAll()`   | Expands every parent node. |
| `collapseAll()` | Collapses every node.      |

### `DmTreeNode`

```ts
interface DmTreeNode {
  id: string;
  label: string;
  children?: DmTreeNode[];
  icon?: string; // decorative marker slot — the lib renders no dm-icon dependency
  disabled?: boolean; // focusable but never selectable
  data?: unknown; // arbitrary payload carried through to outputs
}
```

## Global defaults

```ts
providers: [provideTreeDefaults({ selectionMode: 'multiple', showGuides: true })];
```

Or provide `TREE_DEFAULTS` directly.

## Theming

CSS variables (all fall back to the global semantic tokens, overridable at any scope):

- `--dm-tree-indent` — indentation added per level (default `1.25rem`).
- `--dm-tree-row-radius` — row corner rounding (default `--dm-radius-md`).
- `--dm-tree-selected-bg` — selected row surface (default `--dm-primary-subtle`).
- `--dm-tree-selected-fg` — selected row text, AA on the tinted surface (default `--dm-primary-text`).
- `--dm-tree-hover-bg` — hover surface (default `--dm-bg-muted`).
- `--dm-tree-guide` — connector guide-line color (default `--dm-border`).

## Accessibility

Implements the [WAI-ARIA Tree View pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/):

- Container `role="tree"` with `aria-label`/`aria-labelledby`, plus
  `aria-multiselectable="true"` in `multiple` mode.
- Each node `role="treeitem"` with `aria-level`, `aria-setsize`,
  `aria-posinset`, `aria-selected` (omitted when selection is off) and
  `aria-expanded` on parent nodes only. Child lists wrap in `role="group"`.
- **Roving tabindex**: exactly one node is tabbable at a time.
- **Keyboard**: `Up`/`Down` move visible-node focus, `Right` expands a collapsed
  parent then moves to its first child, `Left` collapses an expanded parent then
  moves to the parent node, `Home`/`End` jump to the first/last visible node,
  `Enter`/`Space` select (and toggle expansion of parents), `*` expands every
  expandable sibling.
- `:focus-visible` draws the shared focus ring; rows and the disclosure toggle
  meet the 44px touch-target minimum.
- Disabled nodes remain focusable (announced via `aria-disabled`) but can never
  be selected.
