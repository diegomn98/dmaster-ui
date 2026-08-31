import { Directive, TemplateRef, inject } from '@angular/core';

import { DmCommandItem } from './command.types';

/** Template context available inside an `ng-template[dmCommandItem]`. */
export interface DmCommandItemContext {
  /** The command item being rendered (`let-item`). */
  $implicit: DmCommandItem;
  /** Whether the row is the currently highlighted option (`let-active="active"`). */
  active: boolean;
}

/**
 * Custom row template for the results of `dm-command`. Replaces the default
 * label + shortcut chip inside every option — icons, descriptions, badges…
 * (`DmCommandItem.icon` is the natural hook to map here).
 *
 * ```html
 * <dm-command [items]="commands" [(open)]="open" (selected)="run($event)">
 *   <ng-template dmCommandItem let-item let-active="active">
 *     <dm-icon size="1rem">{{ item.icon }}</dm-icon>
 *     <span style="flex: 1">{{ item.label }}</span>
 *   </ng-template>
 * </dm-command>
 * ```
 *
 * The template controls the row's CONTENT only: the option shell — active
 * highlight, ARIA attributes, pointer/keyboard selection — and the filtering
 * are still handled by the palette.
 */
@Directive({ selector: 'ng-template[dmCommandItem]' })
export class DmCommandItemDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmCommandItemContext>);
}
