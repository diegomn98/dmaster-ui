import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';

import { DmBreadcrumbsComponent } from './breadcrumbs.component';

/**
 * A single crumb inside a `<dm-breadcrumbs>`. Projected into the parent, it
 * reads its position from the container to decide whether it is the current
 * page, whether it is hidden by collapsing, and whether it renders a trailing
 * separator. Not meant to be used standalone.
 *
 * With `href` it renders an `<a>`; without, plain `<span>` text. The last item
 * is always the current page: it renders as a `<span aria-current="page">`
 * even if an `href` was provided.
 *
 * ```html
 * <dm-breadcrumb-item href="/library">Library</dm-breadcrumb-item>
 * <dm-breadcrumb-item>Current page</dm-breadcrumb-item>
 * ```
 */
@Component({
  selector: 'dm-breadcrumb-item',
  imports: [NgTemplateOutlet],
  templateUrl: './breadcrumb-item.component.html',
  styleUrl: './breadcrumb-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The host renders as `display: contents`, so it carries the list-item
    // semantics itself: the `<ol role="list">` sees each crumb as a `listitem`
    // even though a custom element sits between them in the DOM.
    '[attr.role]': "hidden() ? null : 'listitem'",
  },
})
export class DmBreadcrumbItemComponent implements OnInit, OnDestroy {
  protected readonly parent = inject<DmBreadcrumbsComponent>(
    forwardRef(() => DmBreadcrumbsComponent),
  );

  /** Destination URL. Present → renders an anchor; absent → plain text. */
  readonly href = input<string>();

  /** Renders the crumb as muted, non-interactive text. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Index of this crumb among its siblings. */
  protected readonly index = computed(() => this.parent.indexOf(this));

  /** True when this crumb is the current page (the last one). */
  protected readonly current = computed(() => this.parent.isCurrent(this.index()));

  /** True when this crumb sits inside the collapsed middle range. */
  protected readonly hidden = computed(() => this.parent.isHidden(this.index()));

  /** True when this crumb is the last visible one (no trailing separator). */
  protected readonly lastVisible = computed(() => this.parent.isLastVisible(this.index()));

  /** True when the `…` indicator renders right after this crumb. */
  protected readonly showEllipsis = computed(() => this.parent.showEllipsisAfter(this.index()));

  /** Anchor only when navigable: has an href, is not the current page, not disabled. */
  protected readonly isLink = computed(() => !!this.href() && !this.current() && !this.disabled());

  ngOnInit(): void {
    this.parent.registerItem(this);
  }

  ngOnDestroy(): void {
    this.parent.unregisterItem(this);
  }
}
