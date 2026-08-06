import { Observable } from 'rxjs';

import { DmSelectItem } from '../select/select.types';

/**
 * Item type for the paginated select. Same shape as the single-select item —
 * re-exported so consumers don't need to import both components to get one type.
 */
export type DmPaginatedSelectItem<T = unknown> = DmSelectItem<T>;

/** How the panel loads more items past the initial page. */
export type DmPaginatedSelectLoadMoreMode = 'infinite' | 'button';

/**
 * Result object returned by the `loadFn` on each fetch.
 * `total` is the full count of matching records across all pages, which
 * allows the component to derive whether more pages remain.
 */
export interface DmPaginatedSelectResult<T = unknown> {
  items: DmPaginatedSelectItem<T>[];
  total: number;
}

/**
 * Signature of the consumer-provided fetch function.
 *
 * Returns an **Observable** so `rxResource` can subscribe and automatically
 * cancel any in-flight request whenever the query or page changes — making
 * search debounce and rapid scrolling inherently race-condition-free.
 *
 * With Angular's `HttpClient` there is nothing extra to do:
 * ```ts
 * loadFn = ({ page, pageSize, query }) =>
 *   this.http.get<DmPaginatedSelectResult<User>>('/api/users', {
 *     params: { page, pageSize, query },
 *   });
 * ```
 */
export type DmPaginatedSelectLoadFn<T = unknown> = (params: {
  page: number;
  pageSize: number;
  query: string;
}) => Observable<DmPaginatedSelectResult<T>>;

// Reuse the same color / variant / radius vocabulary as dm-select so a project
// can swap one for the other without re-learning the props.
export type {
  DmSelectColor as DmPaginatedSelectColor,
  DmSelectRadius as DmPaginatedSelectRadius,
  DmSelectVariant as DmPaginatedSelectVariant,
} from '../select/select.types';
