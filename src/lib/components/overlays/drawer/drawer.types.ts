/** Edge the drawer panel slides in from. */
export type DmDrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer size along its main axis. `full` fills the whole edge.
 * For `left`/`right` it maps to a width, for `top`/`bottom` to a height.
 */
export type DmDrawerSize = 'sm' | 'md' | 'lg' | 'full';

/** Configuration for `DmDrawerService.open()`. */
export interface DmDrawerConfig<D = unknown> {
  /** Data injected into the content component via `DIALOG_DATA`. */
  data?: D;
  /** Edge the panel slides in from. Default `right`. */
  placement?: DmDrawerPlacement;
  /**
   * Panel size along its axis. `left`/`right` → width
   * (`sm` 20rem · `md` 28rem · `lg` 36rem · `full` 100vw, capped at 100vw);
   * `top`/`bottom` → height (`sm` 30dvh · `md` 50dvh · `lg` 70dvh · `full` 100dvh).
   * Default `md`.
   */
  size?: DmDrawerSize;
  /** Renders the dimming backdrop behind the panel. Default `true`. */
  backdrop?: boolean;
  /** Prevents closing via backdrop click / Escape. Default `false`. */
  disableClose?: boolean;
  /** Accessible name of the drawer. */
  ariaLabel?: string;
}
