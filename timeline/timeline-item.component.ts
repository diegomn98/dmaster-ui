import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
} from '@angular/core';

import { DmTimelineMarkerDirective } from './timeline-marker.directive';
import { DmTimelineComponent } from './timeline.component';
import { TIMELINE_DEFAULTS } from './timeline.tokens';
import {
  DmTimelineColor,
  DmTimelineItemSide,
  DmTimelineItemState,
  DmTimelineItemVariant,
} from './timeline.types';

/**
 * A single event inside `<dm-timeline>`. Renders its own rail cell (marker +
 * connector to the next item) and content cell (title, time and the projected
 * body). Not meant to be used standalone.
 *
 * The host is `display: contents`, so the rail and the content become cells of
 * the parent's grid — that is what keeps every item's content aligned even
 * when a custom marker is wider than the default dot. The `listitem` role
 * therefore lives on the host itself.
 *
 * ```html
 * <dm-timeline-item title="Shipped" time="Mar 5" datetime="2026-03-05" state="completed">
 *   Left the warehouse in Madrid.
 * </dm-timeline-item>
 *
 * <!-- custom marker -->
 * <dm-timeline-item title="Ana commented">
 *   <dm-avatar dmTimelineMarker name="Ana" size="sm" />
 *   Looks good to me!
 * </dm-timeline-item>
 * ```
 */
@Component({
  selector: 'dm-timeline-item',
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    class: 'dm-timeline-item',
    '[attr.data-orientation]': 'parent.orientation()',
    '[attr.data-align]': 'parent.align()',
    '[attr.data-color]': 'effectiveColor()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-state]': 'state()',
    '[attr.data-side]': 'side()',
    '[attr.data-last]': "isLast() ? '' : null",
    // A static `title="…"` feeds the input AND lands on the host as a native
    // attribute (browser tooltip + duplicate SR announcement). Strip it: the
    // title is rendered as visible text inside.
    '[attr.title]': 'null',
    // One-based position, consumed by the SCSS to pin the rail + content cells
    // to the same row (vertical) / column (horizontal) of the parent grid.
    '[style.--dm-timeline-i]': 'index() + 1',
  },
})
export class DmTimelineItemComponent implements OnInit, OnDestroy {
  protected readonly parent = inject<DmTimelineComponent>(forwardRef(() => DmTimelineComponent));
  private readonly defaults = inject(TIMELINE_DEFAULTS);

  /** Projected custom marker (`[dmTimelineMarker]`). When present the default dot is not rendered. */
  protected readonly customMarker = contentChild(DmTimelineMarkerDirective);

  /** Event title, rendered as `<strong>`. */
  readonly title = input<string>('');

  /** Human-readable time stamp (e.g. `"2 hours ago"`, `"Mar 5, 2026"`). */
  readonly time = input<string>('');

  /**
   * Machine-readable date/time (ISO 8601). When provided the stamp renders as
   * a real `<time [datetime]>`; without it, as a plain `<span>`.
   */
  readonly datetime = input<string>('');

  /** Per-item accent override. Falls back to the parent timeline's `color`. */
  readonly color = input<DmTimelineColor | undefined>(undefined);

  /** Marker style: solid accent fill (default) or accent-outlined ring. */
  readonly variant = input<DmTimelineItemVariant>(this.defaults.variant);

  /** Visual state: `default`, `active` (pulsing ring), `completed` (check), `error` (warning). */
  readonly state = input<DmTimelineItemState>('default');

  /** Zero-based position of this item within the parent. */
  readonly index = computed(() => this.parent.indexOf(this));

  /** True when this is the parent's last item (no trailing connector). */
  readonly isLast = computed(() => this.parent.isLast(this.index()));

  /** Accent actually applied: own `color`, else the parent's. */
  protected readonly effectiveColor = computed<DmTimelineColor>(
    () => this.color() ?? this.parent.color(),
  );

  /**
   * Side of the rail the content sits on. Only meaningful with `align="alternate"`
   * (vertical): even items keep the `start` layout (content after the rail),
   * odd items flip to the other side.
   */
  protected readonly side = computed<DmTimelineItemSide>(() =>
    this.parent.align() === 'alternate' && this.index() % 2 === 1 ? 'start' : 'end',
  );

  /** Whether the header row (title and/or time) has anything to show. */
  protected readonly hasHeader = computed(() => !!this.title() || !!this.time());

  ngOnInit(): void {
    this.parent.registerItem(this);
  }

  ngOnDestroy(): void {
    this.parent.unregisterItem(this);
  }
}
