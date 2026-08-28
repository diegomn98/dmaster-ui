import { Directive, TemplateRef, inject, input } from '@angular/core';

import { DmTableColumn } from './table.types';

/** Template context available inside an `*dmTableCell` / `ng-template[dmTableCell]`. */
export interface DmTableCellContext<T = unknown> {
  /** The row object (`let-row`). */
  $implicit: T;
  /** Row index within the current page. */
  index: number;
  /** The column this cell belongs to. */
  column: DmTableColumn<T>;
}

/**
 * Custom cell template for one column of `dm-table`, matched by column `key`.
 * Lets a cell render rich content — badges, avatars, buttons, links — instead
 * of the plain `string | number` the column `cell` mapper allows. Works in
 * both render modes (native `<table>` and `virtualScroll`).
 *
 * ```html
 * <dm-table [columns]="columns" [data]="users()">
 *   <ng-template dmTableCell="status" let-row>
 *     <dm-badge [color]="row.active ? 'success' : 'default'" variant="flat">
 *       {{ row.status }}
 *     </dm-badge>
 *   </ng-template>
 * </dm-table>
 * ```
 *
 * The template controls RENDERING only: searching and sorting still read the
 * column's `cell` / `sortValue` / `key`, so provide those for sortable or
 * searchable templated columns.
 */
@Directive({ selector: 'ng-template[dmTableCell]' })
export class DmTableCellDirective<T = unknown> {
  /** Column `key` this template renders. */
  readonly dmTableCell = input.required<string>();

  /** @internal */
  readonly templateRef = inject(TemplateRef<DmTableCellContext<T>>);
}
