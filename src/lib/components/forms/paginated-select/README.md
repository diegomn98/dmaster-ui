# dm-paginated-select

Single-select dropdown that loads options in pages via Angular's `rxResource`. Unlike `dm-select` (which takes a flat pre-loaded array), this component is designed for remote/async datasets that may be too large to fetch all at once.

## Import

```ts
import { DmPaginatedSelectComponent } from '@dmaster/ui';
```

## Basic usage

```html
<dm-paginated-select [loadFn]="loadUsers" [(value)]="selectedUserId" />
```

```ts
import { DmPaginatedSelectLoadFn } from '@dmaster/ui';
import { of } from 'rxjs';

loadUsers: DmPaginatedSelectLoadFn<number> = ({ page, pageSize, search }) => {
  return this.userService.search({ page, pageSize, query: search });
  // Must return Observable<{ items: DmPaginatedSelectItem<T>[]; total: number }>
};
```

## Inputs

| Input              | Type                               | Default        | Description                                                                                                                     |
| ------------------ | ---------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `loadFn`           | `DmPaginatedSelectLoadFn<T>`       | —              | **Required.** Called whenever page, page size, or search term changes. Must return `Observable<{ items, total }>`.              |
| `value`            | `T \| null`                        | `null`         | Selected value (two-way via `[(value)]`).                                                                                       |
| `selectedItem`     | `DmPaginatedSelectItem<T> \| null` | `null`         | Pre-hydrates the selected label when the value is out of the current page.                                                      |
| `placeholder`      | `string`                           | `''`           | Placeholder shown when nothing is selected.                                                                                     |
| `searchable`       | `boolean`                          | `false`        | Shows a search input inside the panel.                                                                                          |
| `searchDebounceMs` | `number`                           | `250`          | Quiet period in ms before a search triggers a reload.                                                                           |
| `pageSize`         | `number`                           | `20`           | Items requested per page.                                                                                                       |
| `loadMoreMode`     | `'infinite' \| 'button'`           | `'infinite'`   | `infinite`: IntersectionObserver triggers the next page on scroll. `button`: explicit "Load more" button appears at the bottom. |
| `color`            | `DmPaginatedSelectColor`           | `'default'`    | Semantic color of the trigger.                                                                                                  |
| `variant`          | `DmPaginatedSelectVariant`         | `'flat'`       | Visual style: `flat \| bordered \| faded \| light`.                                                                             |
| `size`             | `DmSize`                           | `'md'`         | Trigger height: `sm` 32px · `md` 40px · `lg` 48px.                                                                              |
| `radius`           | `DmPaginatedSelectRadius`          | `'md'`         | Corner rounding: `sm \| md \| lg \| full`.                                                                                      |
| `disabled`         | `boolean`                          | `false`        | Disables the control.                                                                                                           |
| `ariaLabel`        | `string`                           | `''`           | Accessible label when no visible label surrounds the control.                                                                   |
| `loadingLabel`     | `string`                           | `'Loading…'`   | Screen-reader text while fetching.                                                                                              |
| `emptyLabel`       | `string`                           | `'No results'` | Shown when `loadFn` returns an empty page.                                                                                      |
| `loadMoreLabel`    | `string`                           | `'Load more'`  | Label for the button in `button` load-more mode.                                                                                |

## Outputs / Events

| Name          | Type                      | Description                                                            |
| ------------- | ------------------------- | ---------------------------------------------------------------------- |
| `valueChange` | `EventEmitter<T \| null>` | Emitted on selection change (part of the two-way `[(value)]` binding). |

## Angular Forms

`dm-paginated-select` implements `ControlValueAccessor` so it works with both template-driven and reactive forms:

```html
<dm-paginated-select [loadFn]="loadFn" [formControl]="ctrl" />
<dm-paginated-select [loadFn]="loadFn" [(ngModel)]="value" />
```

## The `loadFn` contract

```ts
type DmPaginatedSelectLoadFn<T> = (
  req: DmPaginatedSelectLoadRequest,
) => Observable<DmPaginatedSelectResult<T>>;

interface DmPaginatedSelectLoadRequest {
  page: number; // 0-based page index
  pageSize: number; // items per page (from the input)
  search: string; // current search query ('' when not searchable)
}

interface DmPaginatedSelectResult<T> {
  items: DmPaginatedSelectItem<T>[];
  total: number; // total count across all pages (used to hide "Load more")
}

interface DmPaginatedSelectItem<T> {
  value: T;
  label: string;
  disabled?: boolean;
}
```

- The component subscribes via `rxResource` — every change to `page`, `pageSize`, or `search` triggers a new call and cancels the in-flight one automatically.
- Return an `Observable` (not a `Promise`). Use `of(...)` from RxJS for static/mock data.
- Set `total` accurately to prevent the component from requesting pages beyond the dataset.

## Global defaults

Override defaults app- or route-wide via the injection token:

```ts
import { providePaginatedSelectDefaults } from '@dmaster/ui';

providers: [
  providePaginatedSelectDefaults({
    variant: 'bordered',
    pageSize: 10,
    loadMoreMode: 'button',
    searchDebounceMs: 400,
  }),
];
```

## Accessibility

- Trigger is a native `<button>` with `aria-haspopup="listbox"` and `aria-expanded`.
- Options list has `role="listbox"`; each option is `role="option"` with `aria-selected`.
- Loading and empty states are announced via `aria-live="polite"`.
- Full keyboard navigation: `ArrowDown/Up` move focus, `Enter/Space` select, `Escape` closes, `Home/End` jump to first/last option.
- Respects `prefers-reduced-motion` via the `--dm-duration-*` tokens.
