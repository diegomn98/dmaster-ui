/**
 * Preferred placement of the popover panel relative to its trigger.
 * The CDK flips it to the opposite side automatically when there is no room.
 */
export type DmPopoverPlacement =
  'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/** Resolved side after CDK flipping — orients the arrow and the entrance origin. */
export type DmPopoverSide = 'top' | 'bottom' | 'left' | 'right';
