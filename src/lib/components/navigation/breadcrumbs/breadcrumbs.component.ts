import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { BREADCRUMBS_DEFAULTS } from './breadcrumbs.tokens';
import { DmBreadcrumbsSize } from './breadcrumbs.types';
import type { DmBreadcrumbItemComponent } from './breadcrumb-item.component';

/**
 * Composite breadcrumb trail. Renders a `<nav>` landmark wrapping an ordered
 * list of projected `<dm-breadcrumb-item>` children. The container owns the
 * shared configuration (separator, size), auto-marks the last item as the
 * current page and, when `maxItems` is exceeded, collapses the middle span
 * into a static `…`.
 *
 * No dependency on `@angular/router`: an item with `href` renders an anchor,
 * an item without renders plain text. For SPA navigation give the item an
 * `href`, or leave it hrefless and project your own `routerLink`/`(click)`.
 *
 * ```html
 * <dm-breadcrumbs ariaLabel="Breadcrumb">
 *   <dm-breadcrumb-item href="/">Home</dm-breadcrumb-item>
 *   <dm-breadcrumb-item href="/library">Library</dm-breadcrumb-item>
 *   <dm-breadcrumb-item>Data</dm-breadcrumb-item>
 * </dm-breadcrumbs>
 * ```
 */
@Component({
  selector: 'dm-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmBreadcrumbsComponent {
  private readonly defaults = inject(BREADCRUMBS_DEFAULTS);

  /** Separator between items. Empty falls back to the built-in chevron SVG. */
  readonly separator = input<string>('');

  /** Size scale (`sm`/`md` → text-sm, `lg` → text-base). */
  readonly size = input<DmBreadcrumbsSize>(this.defaults.size);

  /** Accessible label for the `<nav>` landmark. */
  readonly ariaLabel = input<string>(this.defaults.ariaLabel);

  /** Collapse the trail once it has more than this many items. `null` disables. */
  readonly maxItems = input<number | null>(null);

  /** Items kept at the start when collapsed. */
  readonly itemsBeforeCollapse = input<number>(1);

  /** Items kept at the end when collapsed. */
  readonly itemsAfterCollapse = input<number>(2);

  /** True when a custom separator string was provided. @internal */
  readonly hasCustomSeparator = computed(() => this.separator().length > 0);

  /** Registered items, in DOM order. @internal */
  readonly _items = signal<DmBreadcrumbItemComponent[]>([]);

  /**
   * Collapse geometry derived from the current item count and inputs.
   * `before`/`after` are clamped to at least 1 so the trail always keeps an
   * anchor item before the ellipsis and the current page after it.
   */
  private readonly collapse = computed(() => {
    const n = this._items().length;
    const max = this.maxItems();
    const before = Math.max(1, Math.trunc(this.itemsBeforeCollapse()));
    const after = Math.max(1, Math.trunc(this.itemsAfterCollapse()));
    const active = max !== null && max >= 1 && n > max && before + after < n;
    return { active, before, after, n };
  });

  /** @internal */
  registerItem(item: DmBreadcrumbItemComponent): void {
    this._items.update((list) => [...list, item]);
  }

  /** @internal */
  unregisterItem(item: DmBreadcrumbItemComponent): void {
    this._items.update((list) => list.filter((i) => i !== item));
  }

  /** Position of an item among all registered items. @internal */
  indexOf(item: DmBreadcrumbItemComponent): number {
    return this._items().indexOf(item);
  }

  /** The last item is always the current page. @internal */
  isCurrent(index: number): boolean {
    return index === this._items().length - 1;
  }

  /** The last item never renders a trailing separator. @internal */
  isLastVisible(index: number): boolean {
    return index === this._items().length - 1;
  }

  /** Items inside the collapsed middle range are not rendered. @internal */
  isHidden(index: number): boolean {
    const c = this.collapse();
    return c.active && index >= c.before && index <= c.n - 1 - c.after;
  }

  /** The last item before the gap renders the `…` indicator after itself. @internal */
  showEllipsisAfter(index: number): boolean {
    const c = this.collapse();
    return c.active && index === c.before - 1;
  }
}
