import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { TIMELINE_DEFAULTS } from './timeline.tokens';
import {
  DmTimelineAlign,
  DmTimelineColor,
  DmTimelineOrientation,
  DmTimelineSize,
} from './timeline.types';
import type { DmTimelineItemComponent } from './timeline-item.component';

/**
 * Composite timeline container. Owns the shared configuration (orientation,
 * alignment, size, accent color) and the ordered list of projected
 * `<dm-timeline-item>` children, telling each one where it sits so the last
 * item can drop its trailing connector and `alternate` items can zig-zag.
 *
 * Semantically it is a list: the host is `role="list"` and every item is a
 * `role="listitem"`. Markers and connectors are decorative (`aria-hidden`);
 * the information lives in the visible title / time / body.
 *
 * ```html
 * <dm-timeline ariaLabel="Order history" color="primary">
 *   <dm-timeline-item title="Order placed" time="Mar 3" datetime="2026-03-03" state="completed">
 *     We received your order.
 *   </dm-timeline-item>
 *   <dm-timeline-item title="Shipped" time="Mar 5" datetime="2026-03-05" state="active" />
 *   <dm-timeline-item title="Delivered" variant="outlined" />
 * </dm-timeline>
 * ```
 */
@Component({
  selector: 'dm-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    class: 'dm-timeline',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-align]': 'align()',
    '[attr.data-size]': 'size()',
    '[attr.data-color]': 'color()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class DmTimelineComponent {
  private readonly defaults = inject(TIMELINE_DEFAULTS);

  /** Layout direction. */
  readonly orientation = input<DmTimelineOrientation>(this.defaults.orientation);

  /**
   * Content placement (vertical only): `start` keeps every item after the
   * rail; `alternate` centers the rail and zig-zags content from `md` up.
   */
  readonly align = input<DmTimelineAlign>(this.defaults.align);

  /** Size scale (marker diameter, spacing and type). */
  readonly size = input<DmTimelineSize>(this.defaults.size);

  /** Default accent of the markers. Each item may override it with its own `color`. */
  readonly color = input<DmTimelineColor>(this.defaults.color);

  /** Accessible label for the list. */
  readonly ariaLabel = input<string>('');

  /** Registered `<dm-timeline-item>` children, in projection (DOM) order. @internal */
  readonly _items = signal<DmTimelineItemComponent[]>([]);

  /** Number of registered items. */
  readonly itemCount = computed(() => this._items().length);

  /** @internal */
  registerItem(item: DmTimelineItemComponent): void {
    this._items.update((list) => [...list, item]);
  }

  /** @internal */
  unregisterItem(item: DmTimelineItemComponent): void {
    this._items.update((list) => list.filter((i) => i !== item));
  }

  /** Position of an item in the ordered list, or `-1` if not registered. @internal */
  indexOf(item: DmTimelineItemComponent): number {
    return this._items().indexOf(item);
  }

  /** The last item never renders a trailing connector. @internal */
  isLast(index: number): boolean {
    return index === this._items().length - 1;
  }
}
