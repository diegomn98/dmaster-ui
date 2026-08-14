/**
 * A single actionable entry in the command palette.
 *
 * The consumer owns the identity (`id`) and the copy (`label`); the component
 * only renders, filters and emits the item. Actions are decided by the host in
 * the `selected` output — the palette never navigates on its own.
 */
export interface DmCommandItem {
  /** Stable, unique identifier. Used as the `track` key and echoed on select. */
  id: string;
  /** Primary text shown in the row (and matched by the search query). */
  label: string;
  /** Optional group heading the item is filed under. Items sharing a `group`
   *  render together; the group order follows first appearance. */
  group?: string;
  /** Extra terms matched by the search on top of `label` (synonyms, ids…). */
  keywords?: string[];
  /** Short shortcut hint rendered on the right of the row (e.g. `'⌘P'`). */
  shortcut?: string;
  /** Individually disabled items are skipped by the keyboard and not selectable. */
  disabled?: boolean;
  /** Optional icon name. Not rendered by the library in v1 — reserved so a
   *  consumer can map it in their own item template without an API change. */
  icon?: string;
}

/**
 * @internal
 * A run of filtered items sharing a group, in render order. `index` is the
 * position of each item in the flattened, filtered list — the same index the
 * keyboard navigation and `aria-activedescendant` operate on.
 */
export interface DmCommandGroup {
  /** Group key (`''` for ungrouped items — rendered without a heading). */
  key: string;
  /** Heading text, or `null` for the ungrouped bucket. */
  heading: string | null;
  /** Items in this group, carrying their flat index. */
  entries: { item: DmCommandItem; index: number }[];
}
