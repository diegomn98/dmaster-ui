import { Directive } from '@angular/core';

/**
 * Marks a projected element as the custom marker of a `<dm-timeline-item>`.
 * When present it replaces the default dot / glyph (e.g. a `dm-avatar` or a
 * `dm-icon`). Import it alongside the timeline components.
 *
 * ```html
 * <dm-timeline-item title="Ana commented">
 *   <dm-avatar dmTimelineMarker name="Ana" size="sm" />
 *   Looks good to me!
 * </dm-timeline-item>
 * ```
 */
@Directive({
  selector: '[dmTimelineMarker]',
  host: { class: 'dm-timeline-marker' },
})
export class DmTimelineMarkerDirective {}
