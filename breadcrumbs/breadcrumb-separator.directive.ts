import { Directive, TemplateRef, inject } from '@angular/core';

/** Template context available inside an `ng-template[dmBreadcrumbSeparator]`. */
export interface DmBreadcrumbSeparatorContext {
  /** Zero-based index of the crumb the separator follows (`let-index`). */
  $implicit: number;
}

/**
 * Custom separator template for `dm-breadcrumbs`, replacing the built-in
 * chevron — and any `separator` string — between items with arbitrary markup
 * (e.g. a `dm-icon`). The `separator` input remains the simple case for plain
 * text; the template wins when both are provided.
 *
 * ```html
 * <dm-breadcrumbs>
 *   <ng-template dmBreadcrumbSeparator>
 *     <dm-icon name="arrow-right" size="0.9em" />
 *   </ng-template>
 *   <dm-breadcrumb-item href="/">Home</dm-breadcrumb-item>
 *   <dm-breadcrumb-item href="/library">Library</dm-breadcrumb-item>
 *   <dm-breadcrumb-item>Data</dm-breadcrumb-item>
 * </dm-breadcrumbs>
 * ```
 *
 * Context: `$implicit` (`let-index`) is the zero-based index of the preceding
 * crumb. Separators render inside an `aria-hidden` wrapper — they are purely
 * decorative, so keep the template free of interactive or focusable content.
 */
@Directive({ selector: 'ng-template[dmBreadcrumbSeparator]' })
export class DmBreadcrumbSeparatorDirective {
  /** @internal */
  readonly templateRef = inject(TemplateRef<DmBreadcrumbSeparatorContext>);
}
