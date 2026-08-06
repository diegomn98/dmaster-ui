import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { DmSpinnerComponent } from '../../primitives/spinner';
import { PAGINATED_SELECT_DEFAULTS } from './paginated-select.tokens';
import {
  DmPaginatedSelectColor,
  DmPaginatedSelectItem,
  DmPaginatedSelectLoadFn,
  DmPaginatedSelectLoadMoreMode,
  DmPaginatedSelectRadius,
  DmPaginatedSelectResult,
  DmPaginatedSelectVariant,
} from './paginated-select.types';

/**
 * Single-select dropdown that loads options in pages via Angular's `rxResource`.
 *
 * The consumer provides a `loadFn` that returns an Observable — the component
 * handles everything else: initial fetch on open, infinite scroll or "Load more"
 * button, debounced search, and automatic cancellation of in-flight requests.
 *
 * ```ts
 * // Works directly with HttpClient:
 * loadFn = ({ page, pageSize, query }) =>
 *   this.http.get<DmPaginatedSelectResult<User>>('/api/users', {
 *     params: { page, pageSize, query },
 *   });
 * ```
 *
 * ```html
 * <dm-paginated-select [loadFn]="loadFn" [(value)]="userId" />
 * ```
 */
@Component({
  selector: 'dm-paginated-select',
  imports: [OverlayModule, DmSpinnerComponent],
  templateUrl: './paginated-select.component.html',
  styleUrl: './paginated-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmPaginatedSelectComponent),
      multi: true,
    },
  ],
})
export class DmPaginatedSelectComponent<T = unknown> implements ControlValueAccessor {
  private readonly defaults = inject(PAGINATED_SELECT_DEFAULTS);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  protected readonly uid = dmUid('dm-paginated-select');

  // ---- Public inputs -------------------------------------------------------

  /**
   * Observable-returning fetch function called on each page load.
   * Receives `{ page, pageSize, query }` — must return `Observable<{ items, total }>`.
   * The Observable is automatically unsubscribed when the query or page changes.
   */
  readonly loadFn = input.required<DmPaginatedSelectLoadFn<T>>();

  /** Items per page passed to `loadFn`. Default 20. */
  readonly pageSize = input<number>(this.defaults.pageSize);

  /** Two-way bound selected value. */
  readonly value = model<T | null>(null);

  /**
   * Explicit selected item for when the selected value may not be in the
   * currently loaded page (e.g. selected on page 1, now browsing page 5).
   * Falls back to scanning the loaded items for the matching value.
   */
  readonly selectedItem = input<DmPaginatedSelectItem<T> | null>(null);

  /** Enables the search input at the top of the panel. */
  readonly searchable = input<boolean>(false);

  /** Placeholder inside the search input. */
  readonly searchPlaceholder = input<string>('Search…');

  /** Milliseconds of quiet input before the search reloads. Default 250. */
  readonly searchDebounceMs = input<number>(this.defaults.searchDebounceMs);

  /** How subsequent pages are loaded: IntersectionObserver scroll or a button. */
  readonly loadMoreMode = input<DmPaginatedSelectLoadMoreMode>(this.defaults.loadMoreMode);

  /** Label of the "Load more" button (only in `loadMoreMode="button"`). */
  readonly loadMoreLabel = input<string>('Load more');

  /** Screen-reader label for the loading row and live region. */
  readonly loadingLabel = input<string>('Loading…');

  /** Message shown when there are no results after loading. */
  readonly emptyLabel = input<string>('No results');

  /** Visible label above the trigger. */
  readonly label = input<string>('');

  /** Text shown while no item is selected. */
  readonly placeholder = input<string>('');

  /** Help text below the trigger. */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state. */
  readonly error = input<string>('');

  /** Disables the trigger. */
  readonly disabled = input<boolean>(false);

  /** Shows the required marker next to the label. */
  readonly required = input<boolean>(false);

  /** Semantic color for focus ring and selected item highlight. */
  readonly color = input<DmPaginatedSelectColor>(this.defaults.color);

  /** Visual variant of the trigger surface. */
  readonly variant = input<DmPaginatedSelectVariant>(this.defaults.variant);

  /** Trigger height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding. */
  readonly radius = input<DmPaginatedSelectRadius>(this.defaults.radius);

  /** ARIA label for triggers without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** Shows an × button to clear the selection. Keyboard: Delete / Backspace. */
  readonly clearable = input<boolean>(false);

  /** ARIA label for the clear button. */
  readonly clearAriaLabel = input<string>('Clear');

  // ---- rxResource-based pagination state -----------------------------------

  /**
   * The current fetch request. `null` keeps the resource idle (not yet opened).
   * Setting it to `{ page: 0, query }` triggers the first load; incrementing
   * `page` appends the next page; changing `query` resets to page 0.
   */
  private readonly _pageRequest = signal<{ page: number; query: string } | null>(null);

  /**
   * Angular rxResource that subscribes to `loadFn` and manages loading /
   * error state. Re-subscribes automatically when `_pageRequest` changes;
   * unsubscribes from any in-flight request when a new one starts.
   */
  private readonly _pageResource = rxResource<
    DmPaginatedSelectResult<T>,
    { page: number; query: string } | undefined
  >({
    params: () => this._pageRequest() ?? undefined,
    stream: ({ params }) =>
      this.loadFn()({
        page: params.page,
        pageSize: this.pageSize(),
        query: params.query,
      }),
  });

  /** Accumulated items across all loaded pages. */
  protected readonly _items = signal<DmPaginatedSelectItem<T>[]>([]);

  /** Current search query (reflected in the search input via `[value]`). */
  protected readonly _query = signal('');

  private readonly _total = signal(0);

  /**
   * Whether more pages exist after the currently loaded set.
   * `false` until the first page resolves and `items.length < total` is known.
   */
  private readonly _hasMore = signal(false);

  /** Proxies the resource's reactive loading flag into the template. */
  protected readonly _loading = this._pageResource.isLoading;

  // ---- UI state ------------------------------------------------------------
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;
  protected readonly searchInputId = `${this.uid}-search`;
  protected readonly statusId = `${this.uid}-status`;

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly resolvedSelected = computed<DmPaginatedSelectItem<T> | null>(() => {
    const explicit = this.selectedItem();
    if (explicit) return explicit;
    const v = this.value();
    if (v === null || v === undefined) return null;
    return this._items().find((item) => item.value === v) ?? null;
  });

  protected readonly displayText = computed(
    () => this.resolvedSelected()?.label ?? this.placeholder(),
  );
  protected readonly hasPlaceholder = computed(() => !this.resolvedSelected());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.value() !== null && !this.isDisabled(),
  );

  protected readonly describedBy = computed(() => {
    if (this.error()) return this.errorId;
    if (this.description()) return this.hintId;
    return null;
  });

  protected readonly activeOptionId = computed(() => {
    const i = this.activeIndex();
    return i >= 0 && this.open() ? `${this.uid}-option-${i}` : null;
  });

  protected readonly showEmpty = computed(
    () =>
      this.open() &&
      !this._pageResource.isLoading() &&
      this._items().length === 0 &&
      !this._hasMore() &&
      this._pageRequest() !== null,
  );

  protected readonly showLoadMoreButton = computed(
    () => this.loadMoreMode() === 'button' && this._hasMore() && !this._pageResource.isLoading(),
  );

  protected readonly showInfiniteSentinel = computed(
    () => this.loadMoreMode() === 'infinite' && this._hasMore() && !this._pageResource.isLoading(),
  );

  protected readonly overlayPositions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -6,
    },
  ];

  protected readonly scrollStrategy = this.scrollStrategies.reposition();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('triggerEl');
  private readonly listboxRef = viewChild<ElementRef<HTMLUListElement>>('listboxEl');
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInputEl');
  private readonly sentinelRef = viewChild<ElementRef<HTMLDivElement>>('sentinelEl');

  protected triggerWidth = 0;
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollListenerCleanup: (() => void) | null = null;

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // Accumulate pages: replace on page 0 (first open / search reset), append otherwise.
    effect(() => {
      const pageResult = this._pageResource.value();
      const req = this._pageRequest();
      if (pageResult === undefined || !req) return;

      untracked(() => {
        const accumulated =
          req.page === 0 ? pageResult.items : [...this._items(), ...pageResult.items];
        this._items.set(accumulated);
        this._total.set(pageResult.total);
        this._hasMore.set(accumulated.length < pageResult.total);
        if (this.activeIndex() < 0) {
          this.activeIndex.set(this.firstEnabledIndex());
        }
      });
    });

    // Scroll active option into view whenever it changes.
    effect(() => {
      const i = this.activeIndex();
      if (!this.open() || i < 0) return;
      queueMicrotask(() => {
        const el = this.listboxRef()?.nativeElement.querySelector(
          `#${CSS.escape(this.uid)}-option-${i}`,
        ) as HTMLElement | null;
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    });

    // Attach / detach IntersectionObserver + scroll fallback as the panel opens/
    // closes and as the sentinel appears. setTimeout(0) lets the CDK overlay
    // attach its template before viewChild queries resolve.
    effect(() => {
      this.disconnectObserver();
      if (!this.open() || !this.showInfiniteSentinel()) return;
      setTimeout(() => {
        const sentinel = this.sentinelRef()?.nativeElement;
        const scroller = this.listboxRef()?.nativeElement;
        if (!scroller) return;
        if (sentinel && typeof IntersectionObserver !== 'undefined') {
          this.intersectionObserver = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) this.loadNextPage();
            },
            { root: scroller, rootMargin: '64px', threshold: 0 },
          );
          this.intersectionObserver.observe(sentinel);
        }
        const onScroll = () => {
          const remaining = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
          if (remaining < 64) this.loadNextPage();
        };
        scroller.addEventListener('scroll', onScroll, { passive: true });
        this.scrollListenerCleanup = () => scroller.removeEventListener('scroll', onScroll);
      }, 0);
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.searchDebounceTimer);
      this.disconnectObserver();
    });
  }

  // ---- Pagination ----------------------------------------------------------

  private loadNextPage(): void {
    if (this._pageResource.isLoading() || !this._hasMore()) return;
    const current = this._pageRequest();
    if (!current) return;
    this._pageRequest.set({ ...current, page: current.page + 1 });
  }

  private disconnectObserver(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.scrollListenerCleanup?.();
    this.scrollListenerCleanup = null;
  }

  // ---- Interaction ---------------------------------------------------------

  protected toggle(): void {
    if (this.isDisabled()) return;
    if (this.open()) this.close();
    else this.openPanel();
  }

  protected openPanel(): void {
    if (this.open() || this.isDisabled()) return;
    this.triggerWidth = this.triggerRef().nativeElement.offsetWidth;
    const selectedIdx = this._items().findIndex((it) => it.value === this.value());
    this.activeIndex.set(selectedIdx >= 0 ? selectedIdx : -1);
    this.open.set(true);
    // First open: activate the resource by setting an initial request.
    if (!this._pageRequest()) {
      this._pageRequest.set({ page: 0, query: this._query() });
    }
    if (this.searchable()) {
      setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
    }
  }

  protected close(returnFocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    this.activeIndex.set(-1);
    this.onTouched();
    if (returnFocus) this.triggerRef().nativeElement.focus();
  }

  protected selectAt(index: number): void {
    const item = this._items()[index];
    if (!item || item.disabled) return;
    this.value.set(item.value);
    this.onChange(item.value);
    this.close();
  }

  protected onOptionClick(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.selectAt(index);
  }

  protected onOptionHover(index: number): void {
    if (!this._items()[index]?.disabled) this.activeIndex.set(index);
  }

  protected onLoadMoreClick(): void {
    this.loadNextPage();
  }

  protected onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this._query.set(query);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      // Resetting activeIndex immediately improves perceived responsiveness.
      this.activeIndex.set(-1);
      // Setting page 0 with the new query triggers rxResource to re-subscribe,
      // automatically cancelling any in-flight request for the previous query.
      this._pageRequest.set({ page: 0, query });
    }, this.searchDebounceMs());
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case 'Escape':
      case 'Home':
      case 'End':
        this.onKeydown(event);
    }
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doClear();
  }

  private doClear(): void {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
  }

  protected onTriggerBlur(): void {
    if (!this.open()) this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const key = event.key;

    if (!this.open()) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openPanel();
      } else if ((key === 'Delete' || key === 'Backspace') && this.showClearButton()) {
        event.preventDefault();
        this.doClear();
      }
      return;
    }

    switch (key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectAt(this.activeIndex());
        break;
      case ' ':
        if (!this.searchable()) {
          event.preventDefault();
          this.selectAt(this.activeIndex());
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }

  private moveActive(delta: 1 | -1): void {
    const total = this._items().length;
    if (!total) return;
    let i = this.activeIndex();
    if (i < 0 || i >= total) i = delta === 1 ? -1 : total;
    for (let step = 0; step < total; step++) {
      i = (i + delta + total) % total;
      if (!this._items()[i].disabled) {
        this.activeIndex.set(i);
        return;
      }
    }
  }

  protected firstEnabledIndex(): number {
    return this._items().findIndex((it) => !it.disabled);
  }

  private lastEnabledIndex(): number {
    for (let i = this._items().length - 1; i >= 0; i--) {
      if (!this._items()[i].disabled) return i;
    }
    return -1;
  }
}
