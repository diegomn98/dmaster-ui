import { Directive, TemplateRef, inject } from '@angular/core';

import { DmAutocompleteOption } from './autocomplete.types';

/** Template context available inside an `ng-template[dmAutocompleteOption]`. */
export interface DmAutocompleteOptionContext {
  /** The option being rendered (`let-option`). */
  $implicit: DmAutocompleteOption;
  /** Option index within the currently visible (filtered) list. */
  index: number;
  /** `true` while this option is the active one (keyboard/hover highlight). */
  active: boolean;
}

/**
 * Custom option template for `dm-autocomplete`, replacing the default
 * label + description content of every suggestion row with rich content —
 * icons, avatars, highlighted matches. The row itself is still owned by the
 * component: active highlight, disabled state, `aria-activedescendant` and
 * mouse/keyboard selection keep working unchanged; the template only controls
 * what renders **inside** the row.
 *
 * ```html
 * <dm-autocomplete [options]="cities" [(value)]="city">
 *   <ng-template dmAutocompleteOption let-option let-active="active">
 *     <dm-icon size="1rem">location_on</dm-icon>
 *     <span>{{ option.label }}</span>
 *   </ng-template>
 * </dm-autocomplete>
 * ```
 *
 * Context: `$implicit` (the option, `let-option`), `index` (within the visible
 * list) and `active` (follows keyboard navigation and hover).
 */
@Directive({ selector: 'ng-template[dmAutocompleteOption]' })
export class DmAutocompleteOptionDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmAutocompleteOptionContext>);
}
