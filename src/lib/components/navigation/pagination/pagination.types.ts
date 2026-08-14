/** Semantic color of the active page (HeroUI-style). */
export type DmPaginationColor =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/**
 * Entry of the windowed page list rendered by `dm-pagination`: either a page
 * button or a presentational ellipsis marking a collapsed range.
 */
export type DmPaginationItem =
  | {
      kind: 'page';
      page: number;
      /**
       * Marked on off-window pages while windowing is active: below the `sm`
       * breakpoint they collapse so the pager fits narrow layouts (first/last
       * and the current page always stay visible).
       */
      compactHidden: boolean;
    }
  | { kind: 'ellipsis'; id: 'start-ellipsis' | 'end-ellipsis' };
