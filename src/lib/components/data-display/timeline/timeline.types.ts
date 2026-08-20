/** Layout direction of the timeline. */
export type DmTimelineOrientation = 'vertical' | 'horizontal';

/**
 * Content placement (vertical only). `start` keeps the rail on the start side
 * with every item's content after it; `alternate` centers the rail and
 * zig-zags the content left/right from the `md` breakpoint up (below it the
 * layout falls back to `start`).
 */
export type DmTimelineAlign = 'start' | 'alternate';

/** Size scale (marker diameter + spacing + type). */
export type DmTimelineSize = 'sm' | 'md' | 'lg';

/** Semantic accent color of the markers / completed connectors. */
export type DmTimelineColor =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Marker style: solid accent fill or an accent-outlined ring. */
export type DmTimelineItemVariant = 'solid' | 'outlined';

/**
 * Visual state of a single item, reflected on the host as `data-state`.
 * `active` pulses a ring around the marker, `completed` shows a check glyph and
 * accents the trailing connector, `error` shows a warning glyph in danger.
 */
export type DmTimelineItemState = 'default' | 'active' | 'completed' | 'error';

/** Which side of a centered rail an item's content sits on (`alternate` align only). */
export type DmTimelineItemSide = 'start' | 'end';
