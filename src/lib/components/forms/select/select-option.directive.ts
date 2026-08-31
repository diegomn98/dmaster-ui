import { Directive, TemplateRef, inject } from '@angular/core';

import { DmSelectItem } from './select.types';

/** Template context available inside an `ng-template[dmSelectOption]`. */
export interface DmSelectOptionContext<T = unknown> {
  /** The option being rendered (`let-item`). */
  $implicit: DmSelectItem<T>;
  /** Option index within the currently visible (filtered) list. */
  index: number;
  /** Whether this option is currently selected. */
  selected: boolean;
}

/**
 * Custom option template for `dm-select`. Replaces the default label +
 * description block inside every option row — icons, avatars, status dots,
 * rich layouts — while the check indicator, disabled state, active highlight,
 * `aria-selected` and click / keyboard handling stay exactly as they are.
 * Applies to sync (`items`) and server-driven (`loadFn`) options alike; the
 * chips shown in the trigger in `multiple` mode keep rendering the plain item
 * `label`.
 *
 * ```html
 * <dm-select [items]="users" [(value)]="userId">
 *   <ng-template dmSelectOption let-item let-selected="selected">
 *     <span style="display: flex; align-items: center; gap: 0.5rem">
 *       <dm-avatar [name]="item.label" size="sm" />
 *       {{ item.label }}
 *     </span>
 *   </ng-template>
 * </dm-select>
 * ```
 *
 * The template controls the option BODY only: filtering and typeahead still
 * read the item `label`, so keep labels meaningful for templated options.
 */
@Directive({ selector: 'ng-template[dmSelectOption]' })
export class DmSelectOptionDirective<T = unknown> {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmSelectOptionContext<T>>);
}
