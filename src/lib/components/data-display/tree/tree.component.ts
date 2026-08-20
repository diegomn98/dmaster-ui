import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { TREE_DEFAULTS } from './tree.tokens';
import { DmTreeFlatNode, DmTreeNode, DmTreeSelectionMode } from './tree.types';

/**
 * Hierarchical, data-driven tree view implementing the full WAI-ARIA Tree View
 * pattern: `role="tree"` container, `role="treeitem"` nodes with
 * `aria-expanded`/`aria-selected`/`aria-level`/`aria-setsize`/`aria-posinset`,
 * `role="group"` wrappers, roving tabindex (one tab stop) and the complete
 * keyboard model (Up/Down, Left/Right, Home/End, Enter/Space, `*`).
 *
 * ```html
 * <dm-tree
 *   [nodes]="nodes"
 *   selectionMode="single"
 *   [(selectedIds)]="selected"
 *   [(expandedIds)]="expanded"
 *   ariaLabel="Files"
 *   (nodeSelect)="open($event)" />
 * ```
 *
 * `nodes` is the full hierarchy; the tree derives the visible flat order from
 * `expandedIds`. Selection and expansion are both two-way models so they can be
 * driven or observed from the outside.
 */
@Component({
  selector: 'dm-tree',
  imports: [NgTemplateOutlet],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmTreeComponent {
  private readonly defaults = inject(TREE_DEFAULTS);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // ---- Data ----------------------------------------------------------------
  /** The hierarchy to render. */
  readonly nodes = input<DmTreeNode[]>([]);

  // ---- Behaviour -----------------------------------------------------------
  /** Selection behaviour: `none`, `single` (default) or `multiple`. */
  readonly selectionMode = input<DmTreeSelectionMode>(this.defaults.selectionMode);

  /** Clicking a parent node's row also toggles its expansion. */
  readonly expandOnSelect = input(this.defaults.expandOnSelect, { transform: booleanAttribute });

  /** Draw connector guide lines along each level's indentation. */
  readonly showGuides = input(this.defaults.showGuides, { transform: booleanAttribute });

  // ---- A11y ----------------------------------------------------------------
  /** Accessible label applied to the `role="tree"` element. */
  readonly ariaLabel = input<string>('');

  /** Id of an external element labelling the tree (`aria-labelledby`). */
  readonly ariaLabelledby = input<string>('');

  // ---- Two-way models ------------------------------------------------------
  /** Ids of the selected nodes. `single` mode keeps at most one. */
  readonly selectedIds = model<string[]>([]);

  /** Ids of the expanded parent nodes. */
  readonly expandedIds = model<string[]>([]);

  // ---- Outputs -------------------------------------------------------------
  /** Emits the node whenever it becomes selected (or toggled in multiple). */
  readonly nodeSelect = output<DmTreeNode>();

  /** Emits the node whenever its expanded state is toggled. */
  readonly nodeToggle = output<DmTreeNode>();

  /** The node id that currently owns the single tab stop (roving tabindex). */
  private readonly activeId = signal<string | null>(null);

  // ---- Derived model -------------------------------------------------------
  /**
   * Walks the hierarchy once, producing the root entries plus lookup maps for
   * children, entries and expandable ids — all keyed by node id.
   */
  private readonly indexed = computed(() => {
    const entryMap = new Map<string, DmTreeFlatNode>();
    const childrenMap = new Map<string, DmTreeFlatNode[]>();
    const expandableIds: string[] = [];

    const walk = (list: DmTreeNode[], level: number, parentId: string | null): DmTreeFlatNode[] => {
      const entries: DmTreeFlatNode[] = [];
      const setsize = list.length;
      list.forEach((node, i) => {
        const hasChildren = !!node.children && node.children.length > 0;
        const entry: DmTreeFlatNode = {
          node,
          level,
          hasChildren,
          setsize,
          posinset: i + 1,
          parentId,
        };
        entries.push(entry);
        entryMap.set(node.id, entry);
        if (hasChildren) {
          expandableIds.push(node.id);
          childrenMap.set(node.id, walk(node.children as DmTreeNode[], level + 1, node.id));
        }
      });
      return entries;
    };

    const rootEntries = walk(this.nodes(), 1, null);
    return { roots: rootEntries, entryMap, childrenMap, expandableIds };
  });

  protected readonly rootEntries = computed(() => this.indexed().roots);

  private readonly expandedSet = computed(() => new Set(this.expandedIds()));
  private readonly selectedSet = computed(() => new Set(this.selectedIds()));

  /** Visible nodes in DOM order — roots plus the children of expanded parents. */
  private readonly visibleFlat = computed<DmTreeFlatNode[]>(() => {
    const { roots, childrenMap } = this.indexed();
    const expanded = this.expandedSet();
    const out: DmTreeFlatNode[] = [];
    const push = (entries: DmTreeFlatNode[]): void => {
      for (const entry of entries) {
        out.push(entry);
        if (entry.hasChildren && expanded.has(entry.node.id)) {
          push(childrenMap.get(entry.node.id) ?? []);
        }
      }
    };
    push(roots);
    return out;
  });

  /**
   * The node holding the single tab stop: the caller-driven active node when
   * it is still visible, otherwise the first visible node.
   */
  protected readonly activeNodeId = computed<string | null>(() => {
    const visible = this.visibleFlat();
    if (visible.length === 0) return null;
    const active = this.activeId();
    if (active !== null && visible.some((e) => e.node.id === active)) return active;
    return visible[0].node.id;
  });

  // ---- Template helpers ----------------------------------------------------
  protected childEntries(id: string): DmTreeFlatNode[] {
    return this.indexed().childrenMap.get(id) ?? [];
  }

  protected isExpanded(id: string): boolean {
    return this.expandedSet().has(id);
  }

  protected isSelected(id: string): boolean {
    return this.selectedSet().has(id);
  }

  /** `aria-selected` value: omitted entirely when selection is off. */
  protected ariaSelected(node: DmTreeNode): 'true' | 'false' | null {
    if (this.selectionMode() === 'none') return null;
    return this.isSelected(node.id) ? 'true' : 'false';
  }

  // ---- Pointer handlers ----------------------------------------------------
  protected onRowClick(entry: DmTreeFlatNode): void {
    this.activeId.set(entry.node.id);
    if (entry.hasChildren && this.expandOnSelect()) {
      this.toggleExpand(entry.node);
    }
    this.select(entry.node);
  }

  protected onChevronClick(event: Event, node: DmTreeNode): void {
    event.stopPropagation();
    this.activeId.set(node.id);
    this.toggleExpand(node);
  }

  // ---- Selection -----------------------------------------------------------
  private select(node: DmTreeNode): void {
    if (node.disabled || this.selectionMode() === 'none') return;
    if (this.selectionMode() === 'single') {
      this.selectedIds.set([node.id]);
    } else {
      const set = new Set(this.selectedIds());
      if (set.has(node.id)) set.delete(node.id);
      else set.add(node.id);
      this.selectedIds.set([...set]);
    }
    this.nodeSelect.emit(node);
  }

  // ---- Expansion -----------------------------------------------------------
  private toggleExpand(node: DmTreeNode): void {
    const set = new Set(this.expandedIds());
    if (set.has(node.id)) set.delete(node.id);
    else set.add(node.id);
    this.expandedIds.set([...set]);
    this.nodeToggle.emit(node);
  }

  private setExpanded(node: DmTreeNode, expanded: boolean): void {
    if (this.isExpanded(node.id) === expanded) return;
    this.toggleExpand(node);
  }

  /** Expands every parent node in the tree. */
  expandAll(): void {
    this.expandedIds.set([...this.indexed().expandableIds]);
  }

  /** Collapses every node. */
  collapseAll(): void {
    this.expandedIds.set([]);
  }

  // ---- Keyboard ------------------------------------------------------------
  protected onKeydown(event: KeyboardEvent): void {
    const visible = this.visibleFlat();
    if (visible.length === 0) return;
    const currentId = this.activeNodeId();
    const index = visible.findIndex((e) => e.node.id === currentId);
    if (index === -1) return;
    const entry = visible[index];

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusIndex(visible, index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusIndex(visible, index - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusIndex(visible, 0);
        break;
      case 'End':
        event.preventDefault();
        this.focusIndex(visible, visible.length - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (entry.hasChildren && !this.isExpanded(entry.node.id)) {
          this.setExpanded(entry.node, true);
        } else if (entry.hasChildren) {
          this.focusIndex(visible, index + 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (entry.hasChildren && this.isExpanded(entry.node.id)) {
          this.setExpanded(entry.node, false);
        } else if (entry.parentId !== null) {
          this.focusId(entry.parentId);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (entry.hasChildren) this.toggleExpand(entry.node);
        this.select(entry.node);
        break;
      case '*':
        event.preventDefault();
        this.expandSiblings(entry);
        break;
      default:
        break;
    }
  }

  /** Expands every expandable sibling of `entry` (the `*` shortcut). */
  private expandSiblings(entry: DmTreeFlatNode): void {
    const siblings =
      entry.parentId === null ? this.indexed().roots : this.childEntries(entry.parentId);
    const set = new Set(this.expandedIds());
    for (const sib of siblings) {
      if (sib.hasChildren) set.add(sib.node.id);
    }
    this.expandedIds.set([...set]);
  }

  private focusIndex(visible: DmTreeFlatNode[], target: number): void {
    const clamped = Math.min(Math.max(0, target), visible.length - 1);
    this.focusId(visible[clamped].node.id);
  }

  private focusId(id: string): void {
    this.activeId.set(id);
    // Roving tabindex: move DOM focus to the newly active treeitem. Query by
    // attribute (ids are arbitrary strings, so avoid a CSS selector escape).
    const items = this.host.nativeElement.querySelectorAll<HTMLElement>('[role="treeitem"]');
    for (const item of Array.from(items)) {
      if (item.getAttribute('data-id') === id) {
        item.focus();
        return;
      }
    }
  }
}
