import { Directive, TemplateRef, inject } from '@angular/core';

import { DmTreeNode } from './tree.types';

/** Template context available inside an `*dmTreeNode` / `ng-template[dmTreeNode]`. */
export interface DmTreeNodeContext {
  /** The node being rendered (`let-node`). */
  $implicit: DmTreeNode;
  /** 1-based depth of the node — matches `aria-level`. */
  level: number;
  /** Whether the node is currently expanded (`false` for leaf nodes). */
  expanded: boolean;
  /** Whether the node is currently selected. */
  selected: boolean;
}

/**
 * Custom row content for every node of `dm-tree`. Replaces the default label
 * with rich content — icons, badges, counters — while the tree keeps the
 * disclosure chevron, per-level indentation, pointer handling and the full
 * treeitem ARIA/keyboard semantics untouched.
 *
 * ```html
 * <dm-tree [nodes]="nodes" ariaLabel="Project files">
 *   <ng-template dmTreeNode let-node let-selected="selected">
 *     <dm-icon size="1rem">{{ node.icon }}</dm-icon>
 *     <span>{{ node.label }}</span>
 *     @if (selected) {
 *       <dm-badge size="sm" variant="flat">open</dm-badge>
 *     }
 *   </ng-template>
 * </dm-tree>
 * ```
 *
 * The template controls RENDERING only: selection, expansion and keyboard
 * navigation keep working through the row. The treeitem's accessible name now
 * comes from the projected content, so keep the node's text (usually
 * `node.label`) visible inside the template.
 */
@Directive({ selector: 'ng-template[dmTreeNode]' })
export class DmTreeNodeDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmTreeNodeContext>);
}
