import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
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

import { DmBadgeComponent } from '../../primitives/badge';
import { DmSpinnerComponent } from '../../primitives/spinner';
import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { SELECT_DEFAULTS } from './select.tokens';
import {
  DmSelectColor,
  DmSelectItem,
  DmSelectLoadFn,
  DmSelectLoadMoreMode,
  DmSelectLoadResult,
  DmSelectOptionOrGroup,
  DmSelectRadius,
  DmSelectVariant,
  isDmSelectGroup,
} from './select.types';

/** A normalized option: the item plus its effective disabled state and group. */
interface NormalizedOption<T> {
  item: DmSelectItem<T>;
  disabled: boolean;
  groupLabel?: string;
}

/** A row rendered in the panel: a non-selectable group header or an option. */
type SelectRow<T> =
  | { kind: 'group'; key: string; label: string }
  | { kind: 'option'; key: string; option: NormalizedOption<T>; index: number };

/**
 * Dropdown with a color × variant API. Supports single and multiple selection,
 * an optional inline filter, option groups, and select-all / clear-all.
 *
 * ```html
 * <!-- single -->
 * <dm-select label="Country" [items]="countries" [(value)]="country" />
 *
 * <!-- multiple, filterable, grouped -->
 * <dm-select
 *   label="Skills"
 *   multiple
 *   filterable
 *   [items]="groupedSkills"
 *   [(values)]="skills"
 * />
 * ```
 *
 * **Server-driven (async) mode** — provide a `loadFn` instead of `items` and
 * the select loads options in pages via Angular's `rxResource`: initial fetch
 * on open, infinite scroll or a "Load more" button, debounced server search
 * through the same inline filter, and automatic cancellation of in-flight
 * requests. (This mode absorbs the former `dm-paginated-select`.)
 *
 * ```html
 * <dm-select filterable [loadFn]="loadUsers" [(value)]="userId" />
 * ```
 *
 * The panel renders in a CDK overlay anchored to the trigger, matches its
 * width, and closes on outside click / Escape (single mode also closes on
 * selection). Fully keyboard-driven and wired up as a combobox for assistive
 * technology.
 */
@Component({
  selector: 'dm-select',
  imports: [OverlayModule, DmBadgeComponent, DmSpinnerComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmSelectComponent),
      multi: true,
    },
  ],
})
export class DmSelectComponent<T = unknown> implements ControlValueAccessor {
  private readonly defaults = inject(SELECT_DEFAULTS);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  private readonly document = inject(DOCUMENT);
  protected readonly uid = dmUid('dm-select');

  // ---- Inputs --------------------------------------------------------------
  /** Items to render in the panel — flat options or `{ label, items }` groups. */
  readonly items = input<DmSelectOptionOrGroup<T>[]>([]);

  /**
   * Switches the select into server-driven mode: options load in pages via
   * this Observable-returning fetch function and `items` is ignored. The
   * inline filter (when `filterable`) becomes a debounced server search.
   */
  readonly loadFn = input<DmSelectLoadFn<T> | null>(null);

  /** Async mode: items per page passed to `loadFn`. */
  readonly pageSize = input<number>(this.defaults.pageSize);

  /** Async mode: ms of quiet input before the search reloads. */
  readonly searchDebounceMs = input<number>(this.defaults.searchDebounceMs);

  /** Async mode: IntersectionObserver scroll or an explicit button. */
  readonly loadMoreMode = input<DmSelectLoadMoreMode>(this.defaults.loadMoreMode);

  /** Label of the "Load more" button (async, `loadMoreMode="button"`). */
  readonly loadMoreLabel = input<string>('Load more');

  /** Screen-reader label for the async loading row and live region. */
  readonly loadingLabel = input<string>('Loading…');

  /**
   * Known items for label resolution in async mode — e.g. the persisted
   * selection when its page hasn't been loaded yet. Works for both single
   * and multiple selection.
   */
  readonly selectedItems = input<DmSelectItem<T>[]>([]);

  /** Selects more than one value; chips replace the single-value label. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Two-way value for single-select mode. */
  readonly value = model<T | null>(null);

  /** Two-way values for multiple-select mode. */
  readonly values = model<T[]>([]);

  /**
   * Equality used to match a value against the options (single and multiple).
   * Defaults to strict `===`. Provide it to select **objects by an identity
   * field** so selection survives a form reset or a new-reference `writeValue`
   * (e.g. `[compareWith]="(a, b) => a.id === b.id"`).
   */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

  /** Shows an inline search box in the panel that filters the options. */
  readonly filterable = input(false, { transform: booleanAttribute });

  /** Placeholder for the inline filter input. */
  readonly filterPlaceholder = input<string>('');

  /** ARIA label for the filter's clear (×) button. */
  readonly filterClearAriaLabel = input<string>('Clear');

  /** Message shown when there are no options to list (hidden if empty). */
  readonly noResultsLabel = input<string>('');

  /** Label for the "select all" action (multiple mode; hidden if empty). */
  readonly selectAllLabel = input<string>('');

  /** Label for the "clear all" action (multiple mode; hidden if empty). */
  readonly clearAllLabel = input<string>('');

  /** Visible label above the trigger. */
  readonly label = input<string>('');

  /** Text shown while nothing is selected. */
  readonly placeholder = input<string>('');

  /** Help text below the trigger. */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the trigger. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows the required marker next to the label. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Semantic color for focus ring and selected item highlight. */
  readonly color = input<DmSelectColor>(this.defaults.color);

  /** Visual variant of the trigger surface. */
  readonly variant = input<DmSelectVariant>(this.defaults.variant);

  /** Trigger height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding. */
  readonly radius = input<DmSelectRadius>(this.defaults.radius);

  /** ARIA label for triggers without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** Shows an × button to clear the selection. Keyboard: Delete / Backspace. */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** ARIA label for the clear button (localise in multilingual apps). */
  readonly clearAriaLabel = input<string>('Clear');

  /** ARIA label prefix for per-chip remove buttons (localise in multilingual apps). */
  readonly removeAriaLabel = input<string>('Remove');

  // ---- State ---------------------------------------------------------------
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');
  protected readonly typeaheadBuffer = signal('');
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Whether the select is in server-driven mode. */
  protected readonly isAsync = computed(() => !!this.loadFn());

  // ---- Async (server-driven) pagination state ------------------------------

  /**
   * The current fetch request. `null` keeps the resource idle (not opened yet).
   * `{ page: 0, query }` triggers the first load; incrementing `page` appends
   * the next page; changing `query` resets to page 0.
   */
  private readonly _pageRequest = signal<{ page: number; query: string } | null>(null);

  /**
   * rxResource subscribing to `loadFn`; re-subscribes when `_pageRequest`
   * changes and cancels any in-flight request when a new one starts.
   */
  private readonly _pageResource = rxResource<
    DmSelectLoadResult<T>,
    { page: number; query: string } | undefined
  >({
    params: () => (this.loadFn() ? (this._pageRequest() ?? undefined) : undefined),
    stream: ({ params }) =>
      this.loadFn()!({
        page: params.page,
        pageSize: this.pageSize(),
        query: params.query,
      }),
  });

  /** Accumulated items across all loaded pages (async mode). */
  private readonly _loadedItems = signal<DmSelectItem<T>[]>([]);
  private readonly _total = signal(0);

  /** Highest page index successfully loaded (async). -1 = none yet. */
  private readonly _loadedPage = signal(-1);

  /**
   * Every item ever returned by `loadFn`, keyed by value — so a selected
   * option's label survives a page-0 replace (new search) that drops it from
   * the currently loaded page. Grows only in async mode; labels only.
   */
  private readonly _seenItems = signal<Map<T, DmSelectItem<T>>>(new Map());

  /** Whether more pages exist after the currently loaded set. */
  private readonly _hasMore = signal(false);

  /** True when the last request errored — stops infinite auto-retry storms. */
  protected readonly _loadError = signal(false);

  /** True while a page request is in flight (always false in sync mode). */
  protected readonly _loading = computed(() => this.isAsync() && this._pageResource.isLoading());

  /** The currently selected values, regardless of mode. */
  protected readonly selectedValues = computed<T[]>(() => {
    if (this.multiple()) {
      return this.values();
    }
    const v = this.value();
    return v === null || v === undefined ? [] : [v];
  });

  /** Flattened options with group disabled folded in and group label attached. */
  private readonly normalizedOptions = computed<NormalizedOption<T>[]>(() => {
    if (this.isAsync()) {
      return this._loadedItems().map((item) => ({ item, disabled: !!item.disabled }));
    }
    const out: NormalizedOption<T>[] = [];
    for (const entry of this.items()) {
      if (isDmSelectGroup(entry)) {
        for (const item of entry.items) {
          out.push({
            item,
            disabled: !!(item.disabled || entry.disabled),
            groupLabel: entry.label,
          });
        }
      } else {
        out.push({ item: entry, disabled: !!entry.disabled });
      }
    }
    return out;
  });

  /**
   * Options after filtering (keyboard navigation works over these). In async
   * mode the server already filtered by the query — no client-side pass.
   */
  protected readonly visibleOptions = computed<NormalizedOption<T>[]>(() => {
    if (this.isAsync()) {
      return this.normalizedOptions();
    }
    const text = this.filterText().trim().toLowerCase();
    if (!text) {
      return this.normalizedOptions();
    }
    return this.normalizedOptions().filter((o) => o.item.label.toLowerCase().includes(text));
  });

  /** Rows to render: group headers interleaved with (filtered) option rows. */
  protected readonly visibleRows = computed<SelectRow<T>[]>(() => {
    const rows: SelectRow<T>[] = [];
    let lastGroup: string | undefined;
    let seenAnyGroup = false;
    let groupCount = 0;
    this.visibleOptions().forEach((option, index) => {
      if (option.groupLabel !== undefined) {
        seenAnyGroup = true;
        if (option.groupLabel !== lastGroup) {
          lastGroup = option.groupLabel;
          // Positional key: the same label may reappear non-adjacently (a
          // header keyed only by label would collide → NG0955 duplicate keys).
          rows.push({ kind: 'group', key: `g-${groupCount++}`, label: option.groupLabel });
        }
      } else if (seenAnyGroup) {
        // Ungrouped options after a group start their own reset.
        lastGroup = undefined;
      }
      rows.push({ kind: 'option', key: `o-${index}`, option, index });
    });
    return rows;
  });

  protected readonly hasResults = computed(() => this.visibleOptions().length > 0);

  /** No-options row: after load settles in async mode, immediate in sync. */
  protected readonly showEmpty = computed(() => {
    if (!this.noResultsLabel() || this.hasResults()) {
      return false;
    }
    // In async mode: only after a load settles WITHOUT error — an errored
    // request must not be mislabelled as "no results".
    return this.isAsync()
      ? !this._loading() && !this._loadError() && this._pageRequest() !== null
      : true;
  });

  // The "Load more" button stays visible on error so the user can retry the
  // failed page; the infinite sentinel is suppressed on error to avoid an
  // auto-retry request storm (the observer would re-fire on the same sentinel).
  protected readonly showLoadMoreButton = computed(
    () => this.isAsync() && this.loadMoreMode() === 'button' && this._hasMore() && !this._loading(),
  );

  protected readonly showInfiniteSentinel = computed(
    () =>
      this.isAsync() &&
      this.loadMoreMode() === 'infinite' &&
      this._hasMore() &&
      !this._loading() &&
      !this._loadError(),
  );

  /**
   * Announced by the persistent live region (async): the loading label while a
   * request is in flight, then the no-results label when a load settles empty.
   */
  protected readonly asyncStatus = computed(() => {
    if (!this.isAsync() || !this.open()) {
      return '';
    }
    if (this._loading()) {
      return this.loadingLabel();
    }
    if (!this._loadError() && !this.hasResults()) {
      return this.noResultsLabel();
    }
    return '';
  });

  /**
   * Known items to resolve labels from: currently-loaded/declared options,
   * every item seen across async pages, and caller-supplied `selectedItems`.
   */
  private readonly knownItems = computed<DmSelectItem<T>[]>(() => [
    ...this.normalizedOptions().map((o) => o.item),
    ...this._seenItems().values(),
    ...this.selectedItems(),
  ]);

  /** The single-mode selected item (for the trigger label). */
  protected readonly selectedItem = computed<DmSelectItem<T> | null>(() => {
    if (this.multiple()) {
      return null;
    }
    const v = this.value();
    if (v === null || v === undefined) {
      return null;
    }
    return this.knownItems().find((item) => this.sameValue(item.value, v)) ?? null;
  });

  /** The multi-mode selected items (for the chips), in known-items order. */
  protected readonly selectedChips = computed<DmSelectItem<T>[]>(() => {
    if (!this.multiple()) {
      return [];
    }
    const selected = new Set(this.values());
    const seen = new Set<T>();
    const chips: DmSelectItem<T>[] = [];
    for (const item of this.knownItems()) {
      if (selected.has(item.value) && !seen.has(item.value)) {
        seen.add(item.value);
        chips.push(item);
      }
    }
    return chips;
  });

  protected readonly displayText = computed(() => this.selectedItem()?.label ?? this.placeholder());

  protected readonly hasSelection = computed(() =>
    this.multiple()
      ? this.values().length > 0
      : this.value() !== null && this.value() !== undefined,
  );

  protected readonly hasPlaceholder = computed(() => !this.hasSelection());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.hasSelection() && !this.isDisabled(),
  );

  protected readonly showSelectAll = computed(
    () => this.multiple() && (!!this.selectAllLabel() || !!this.clearAllLabel()),
  );

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.description()) {
      return this.hintId;
    }
    return null;
  });

  protected readonly activeOptionId = computed(() => {
    const i = this.activeIndex();
    return i >= 0 && this.open() ? `${this.uid}-option-${i}` : null;
  });

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

  /**
   * Block page scroll while the panel is open (native-select behavior). With
   * `reposition` the page kept scrolling under the transparent backdrop and the
   * panel ended up floating detached from its trigger over unrelated content.
   * The listbox's own internal scroll is unaffected.
   */
  protected readonly scrollStrategy = this.scrollStrategies.block();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('triggerEl');
  private readonly listboxRef = viewChild<ElementRef<HTMLUListElement>>('listboxEl');
  private readonly filterRef = viewChild<ElementRef<HTMLInputElement>>('filterEl');
  private readonly sentinelRef = viewChild<ElementRef<HTMLElement>>('sentinelEl');

  protected triggerWidth = 0;
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollListenerCleanup: (() => void) | null = null;
  /** Pending infinite-scroll wire-up; cleared on re-run so observers can't leak. */
  private infiniteScrollTimer: ReturnType<typeof setTimeout> | undefined;

  protected optionId(index: number): string {
    return `${this.uid}-option-${index}`;
  }

  /** Value equality via `compareWith` (default strict `===`). */
  private sameValue(a: T, b: T): boolean {
    return this.compareWith()(a, b);
  }

  protected isSelectedValue(value: T): boolean {
    return this.selectedValues().some((v) => this.sameValue(v, value));
  }

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: T | T[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: T | T[] | null): void {
    if (this.multiple()) {
      this.values.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(Array.isArray(value) ? null : (value ?? null));
    }
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // Reset transient panel state when it closes. In async mode the list is
    // NOT reset here: openPanel() reconciles the (cleared) filter text with
    // the last request, so the refetch happens lazily on the next open.
    effect(() => {
      if (!this.open()) {
        this.typeaheadBuffer.set('');
        this.filterText.set('');
        clearTimeout(this.typeaheadTimer);
        clearTimeout(this.searchDebounceTimer);
      }
    });

    // Async: accumulate pages — replace on page 0, append otherwise. Tracks
    // the resource's error signal so a failed request is handled (and never
    // read via value(), which throws in the error state).
    effect(() => {
      const errored = this._pageResource.error() !== undefined;
      const hasValue = this._pageResource.hasValue();
      const req = this._pageRequest();
      if (!req) {
        return;
      }
      untracked(() => {
        if (errored) {
          this._loadError.set(true);
          return;
        }
        if (!hasValue) {
          return;
        }
        const pageResult = this._pageResource.value();
        this._loadError.set(false);
        const accumulated =
          req.page === 0 ? pageResult.items : [...this._loadedItems(), ...pageResult.items];
        this._loadedItems.set(accumulated);
        this._total.set(pageResult.total);
        this._hasMore.set(accumulated.length < pageResult.total);
        this._loadedPage.set(req.page);
        // Remember every item for label resolution across page-0 replaces.
        if (pageResult.items.length) {
          const seen = new Map(this._seenItems());
          for (const item of pageResult.items) {
            seen.set(item.value, item);
          }
          this._seenItems.set(seen);
        }
        // Re-anchor / clamp the active option: a page-0 replace or a shrinking
        // result can leave activeIndex past the end (dangling activedescendant).
        const ai = this.activeIndex();
        if (this.open() && (ai < 0 || ai >= accumulated.length)) {
          this.activeIndex.set(this.firstEnabledIndex());
        }
      });
    });

    // Keep the active option scrolled into view.
    effect(() => {
      const i = this.activeIndex();
      if (!this.open() || i < 0) {
        return;
      }
      queueMicrotask(() => {
        const el = this.listboxRef()?.nativeElement.querySelector<HTMLElement>(
          `#${this.optionId(i)}`,
        );
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    });

    // Async infinite scroll: attach IntersectionObserver + scroll fallback as
    // the panel opens/closes and as the sentinel appears. setTimeout(0) lets
    // the CDK overlay attach its template before viewChild queries resolve.
    effect(() => {
      this.disconnectObserver();
      clearTimeout(this.infiniteScrollTimer);
      if (!this.open() || !this.showInfiniteSentinel()) {
        return;
      }
      this.infiniteScrollTimer = setTimeout(() => {
        const sentinel = this.sentinelRef()?.nativeElement;
        const scroller = this.listboxRef()?.nativeElement;
        if (!scroller) {
          return;
        }
        if (sentinel && typeof IntersectionObserver !== 'undefined') {
          this.intersectionObserver = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                this.loadNextPage();
              }
            },
            { root: scroller, rootMargin: '64px', threshold: 0 },
          );
          this.intersectionObserver.observe(sentinel);
        }
        const onScroll = () => {
          const remaining = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
          if (remaining < 64) {
            this.loadNextPage();
          }
        };
        scroller.addEventListener('scroll', onScroll, { passive: true });
        this.scrollListenerCleanup = () => scroller.removeEventListener('scroll', onScroll);
      }, 0);
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.typeaheadTimer);
      clearTimeout(this.searchDebounceTimer);
      clearTimeout(this.infiniteScrollTimer);
      this.disconnectObserver();
    });
  }

  // ---- Async pagination ----------------------------------------------------

  private loadNextPage(): void {
    if (this._loading() || !this._hasMore() || this._loadError()) {
      return;
    }
    const current = this._pageRequest();
    if (!current) {
      return;
    }
    // From the last SUCCESSFULLY loaded page, not the last requested one — a
    // failed page must be re-requested, never skipped.
    this._pageRequest.set({ query: current.query, page: this._loadedPage() + 1 });
  }

  private disconnectObserver(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.scrollListenerCleanup?.();
    this.scrollListenerCleanup = null;
  }

  protected onLoadMoreClick(): void {
    // Clear a prior error so an explicit click retries the failed page.
    this._loadError.set(false);
    this.loadNextPage();
  }

  // ---- Interaction ---------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    if (this.open() || this.isDisabled()) {
      return;
    }
    this.triggerWidth = this.triggerRef().nativeElement.offsetWidth;
    // Async: reconcile the request with the current (possibly cleared) filter
    // text — first open fetches page 0, later opens refetch only if it changed.
    if (this.isAsync()) {
      const query = this.filterText();
      const req = this._pageRequest();
      if (!req || req.query !== query) {
        this._pageRequest.set({ page: 0, query });
      }
    }
    // Start focus on the first selected option, or the first enabled one.
    const options = this.visibleOptions();
    const selectedIdx = options.findIndex((o) => this.isSelectedValue(o.item.value) && !o.disabled);
    this.activeIndex.set(selectedIdx >= 0 ? selectedIdx : this.firstEnabledIndex());
    this.open.set(true);
    // Focus del filtro: en onOverlayAttach() — aquí el overlay aún no existe
    // (en zoneless la CD que lo monta corre DESPUÉS de cualquier microtask).
  }

  /**
   * The overlay just attached its template — the only moment when focusing the
   * filter input is race-free (a microtask from `openPanel()` always loses to
   * zoneless change detection and finds no input).
   */
  protected onOverlayAttach(): void {
    if (this.filterable()) {
      queueMicrotask(() => this.filterRef()?.nativeElement.focus());
    }
  }

  protected close(returnFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.activeIndex.set(-1);
    this.onTouched();
    if (returnFocus) {
      this.triggerRef().nativeElement.focus();
    }
  }

  /** Commit the option at `index` (into `visibleOptions`). */
  protected commitAt(index: number): void {
    const option = this.visibleOptions()[index];
    if (!option || option.disabled) {
      return;
    }
    if (this.multiple()) {
      this.toggleValue(option.item.value);
    } else {
      this.value.set(option.item.value);
      this.onChange(option.item.value);
      this.close();
    }
  }

  private toggleValue(value: T): void {
    const current = this.values();
    const next = current.some((v) => this.sameValue(v, value))
      ? current.filter((v) => !this.sameValue(v, value))
      : [...current, value];
    this.values.set(next);
    this.onChange(next);
  }

  /** Remove a chip's value (multiple mode). */
  protected removeValue(value: T, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    const next = this.values().filter((v) => !this.sameValue(v, value));
    this.values.set(next);
    this.onChange(next);
    this.onTouched();
  }

  protected onSelectAll(): void {
    const next = [...this.values()];
    for (const option of this.visibleOptions()) {
      if (!option.disabled && !next.some((v) => this.sameValue(v, option.item.value))) {
        next.push(option.item.value);
      }
    }
    this.values.set(next);
    this.onChange(next);
  }

  protected onClearAll(): void {
    this.values.set([]);
    this.onChange([]);
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doClear();
  }

  private doClear(): void {
    if (this.multiple()) {
      this.values.set([]);
      this.onChange([]);
    } else {
      this.value.set(null);
      this.onChange(null);
    }
    this.onTouched();
  }

  protected onOptionClick(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.commitAt(index);
  }

  protected onOptionHover(index: number): void {
    if (!this.visibleOptions()[index]?.disabled) {
      this.activeIndex.set(index);
    }
  }

  protected onTriggerBlur(): void {
    if (!this.open()) {
      this.onTouched();
    }
  }

  protected onFilterInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.filterText.set(text);
    if (this.isAsync()) {
      // Debounced server search: page 0 with the new query re-subscribes the
      // resource, cancelling any in-flight request for the previous one.
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.activeIndex.set(-1);
        this._pageRequest.set({ page: 0, query: text });
      }, this.searchDebounceMs());
      return;
    }
    // Sync: instant client-side filter; re-anchor to the first match.
    this.activeIndex.set(this.firstEnabledIndex());
  }

  /** Clear the filter text (× button / first Escape) and refocus the input. */
  protected clearFilter(): void {
    if (!this.filterText()) {
      return;
    }
    this.filterText.set('');
    if (this.isAsync()) {
      clearTimeout(this.searchDebounceTimer);
      // Only refetch if the COMMITTED query wasn't already empty — otherwise a
      // pending (never-sent) keystroke would trigger a redundant page-0 request
      // that collapses the accumulated pages and loses the scroll position.
      if ((this._pageRequest()?.query ?? '') !== '') {
        this.activeIndex.set(-1);
        this._pageRequest.set({ page: 0, query: '' });
      }
    } else {
      this.activeIndex.set(this.firstEnabledIndex());
    }
    this.filterRef()?.nativeElement.focus();
  }

  protected onFilterClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.clearFilter();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const key = event.key;

    if (!this.open()) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openPanel();
      } else if ((key === 'Delete' || key === 'Backspace') && this.showClearButton()) {
        event.preventDefault();
        this.doClear();
      } else if (key.length === 1 && /\S/.test(key)) {
        // Type-to-select while closed. With a filter box the panel opens and
        // the attach handler focuses it; without one, classic typeahead.
        this.openPanel();
        if (!this.filterable()) {
          this.typeahead(key);
        }
      }
      return;
    }

    switch (key) {
      case 'Escape':
        event.preventDefault();
        // Two-stage (combobox pattern, same as dm-search-field): a non-empty
        // filter clears first; the next Escape closes the panel.
        if (this.filterText()) {
          this.clearFilter();
        } else {
          this.close();
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.commitAt(this.activeIndex());
        break;
      case ' ':
        // Space selects only when not typing in the filter box.
        if (!this.filterable()) {
          event.preventDefault();
          this.commitAt(this.activeIndex());
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Async button mode: ArrowDown on the last loaded option pages forward
        // (the mouse-only Load-more button is otherwise unreachable by keyboard;
        // infinite mode paginates via the scroll listener as options scroll in).
        if (this.showLoadMoreButton() && this.activeIndex() === this.lastEnabledIndex()) {
          this.loadNextPage();
        } else {
          this.moveActive(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        if (!this.filterable()) {
          event.preventDefault();
          this.activeIndex.set(this.firstEnabledIndex());
        }
        break;
      case 'End':
        if (!this.filterable()) {
          event.preventDefault();
          this.activeIndex.set(this.lastEnabledIndex());
        }
        break;
      case 'Tab':
        // Filterable parks focus in the overlay pane (end of <body>); returning
        // it to the trigger synchronously lets the default Tab proceed from the
        // field instead of dropping to <body> when the overlay detaches.
        this.close(this.filterable());
        break;
      default:
        if (key.length === 1 && /\S/.test(key)) {
          if (this.filterable()) {
            // Typing with focus still on the trigger: route it into the filter.
            // Focusing during keydown (without preventDefault) makes the
            // browser insert the character into the newly focused input.
            const filter = this.filterRef()?.nativeElement;
            if (filter && this.document.activeElement !== filter) {
              filter.focus();
            }
          } else {
            event.preventDefault();
            this.typeahead(key);
          }
        }
    }
  }

  private moveActive(delta: 1 | -1): void {
    const options = this.visibleOptions();
    const total = options.length;
    if (!total) {
      return;
    }
    let i = this.activeIndex();
    if (i < 0 || i >= total) {
      i = delta === 1 ? -1 : total;
    }
    for (let step = 0; step < total; step++) {
      i = (i + delta + total) % total;
      if (!options[i].disabled) {
        this.activeIndex.set(i);
        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    return this.visibleOptions().findIndex((o) => !o.disabled);
  }

  private lastEnabledIndex(): number {
    const options = this.visibleOptions();
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  private typeahead(char: string): void {
    const buffer = (this.typeaheadBuffer() + char).toLowerCase();
    this.typeaheadBuffer.set(buffer);
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => this.typeaheadBuffer.set(''), 600);

    const options = this.visibleOptions();
    const match = options.findIndex(
      (o) => !o.disabled && o.item.label.toLowerCase().startsWith(buffer),
    );
    if (match >= 0) {
      this.activeIndex.set(match);
    }
  }
}
