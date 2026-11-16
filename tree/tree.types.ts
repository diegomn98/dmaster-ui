/**
 * A single node in a `dm-tree`. Trees are fully data-driven: the component
 * renders one `role="treeitem"` per node and recurses into `children`.
 */
export interface DmTreeNode {
  /** Stable, unique identifier used for selection, expansion and tracking. */
  id: string;
  /** Human-readable text rendered as the node's accessible name. */
  label: string;
  /** Child nodes. A node with a non-empty `children` array is a "parent". */
  children?: DmTreeNode[];
  /**
   * Optional icon hint. NOT rendered by the default row — it is data made
   * available to a projected `dmTreeNode` template (as `node.icon`) for
   * consumers wiring their own icon system.
   */
  icon?: string;
  /** Disabled nodes can be focused but never selected. */
  disabled?: boolean;
  /** Arbitrary payload carried through to `(nodeSelect)` / `(nodeToggle)`. */
  data?: unknown;
}

/** Selection behaviour of the tree. */
export type DmTreeSelectionMode = 'none' | 'single' | 'multiple';

/**
 * Flattened view of a node used internally by the template and the keyboard
 * navigation. One entry per rendered `treeitem`, carrying the ARIA metadata
 * (`aria-level`, `aria-setsize`, `aria-posinset`) the WAI-ARIA tree pattern
 * requires. @internal
 */
export interface DmTreeFlatNode {
  node: DmTreeNode;
  /** 1-based depth — maps directly to `aria-level`. */
  level: number;
  /** Whether the node has at least one child (`aria-expanded` applies). */
  hasChildren: boolean;
  /** Number of siblings including itself — `aria-setsize`. */
  setsize: number;
  /** 1-based position among its siblings — `aria-posinset`. */
  posinset: number;
  /** Id of the parent node, or `null` for a root node. */
  parentId: string | null;
}
