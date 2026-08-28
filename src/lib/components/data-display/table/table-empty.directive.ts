import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Custom empty-state template for `dm-table`, replacing the built-in
 * icon + `emptyText` block (e.g. with a `dm-empty-state` and a call to
 * action). The context exposes `filtered` — `true` when the emptiness comes
 * from the search filtering every row out, so one template can cover both
 * "no data" and "no results".
 *
 * ```html
 * <dm-table [columns]="columns" [data]="users()">
 *   <ng-template dmTableEmpty let-filtered="filtered">
 *     <dm-empty-state
 *       [title]="filtered ? 'No matches' : 'No users yet'"
 *       description="Invite your first teammate to get started." />
 *   </ng-template>
 * </dm-table>
 * ```
 */
@Directive({ selector: 'ng-template[dmTableEmpty]' })
export class DmTableEmptyDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<{ filtered: boolean }>);
}
