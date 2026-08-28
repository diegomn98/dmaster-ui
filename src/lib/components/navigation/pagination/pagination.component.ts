import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';

import { DmSize } from '../../../core/types/common.types';
import { PAGINATION_DEFAULTS } from './pagination.tokens';
import { DmPaginationColor, DmPaginationItem } from './pagination.types';

/**
 * Page navigation with a windowed list of page numbers: boundary pages at the
 * extremes, siblings around the current page and ellipses in between. The
 * current page is two-way bound and every accessible label is overridable —
 * per instance via inputs or app-wide through `providePaginationDefaults()`.
 *
 * ```html
 * <dm-pagination [totalPages]="10" [(page)]="page" />
 *
 * <dm-pagination
 *   [totalPages]="42"
 *   [siblingCount]="2"
 *   size="sm"
 *   color="secondary"
 *   [(page)]="page" />
 * ```
 *
 * `dm-table` composes it internally for its footer pager.
 */
@Component({
  selector: 'dm-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmPaginationComponent {
  private readonly defaults = inject(PAGINATION_DEFAULTS);

  /** Two-way bound current page, 1-based. Navigation clamps into `[1, totalPages]`. */
  readonly page = model<number>(1);

  /** Total number of pages. */
  readonly totalPages = input.required<number>();

  /** Pages shown on each side of the current page. */
  readonly siblingCount = input<number>(this.defaults.siblingCount);

  /** Pages always shown at the start and at the end. */
  readonly boundaryCount = input<number>(this.defaults.boundaryCount);

  /** Show the previous/next chevron buttons. */
  readonly showControls = input(this.defaults.showControls, { transform: booleanAttribute });

  /** Item size; heights follow the 32/40/48px scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Semantic color of the active page. */
  readonly color = input<DmPaginationColor>(this.defaults.color);

  /** Disables every control. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible name of the `<nav>` landmark. */
  readonly ariaLabel = input<string>(this.defaults.ariaLabel);

  /** ARIA label of the previous-page button. */
  readonly prevLabel = input<string>(this.defaults.prevLabel);

  /** ARIA label of the next-page button. */
  readonly nextLabel = input<string>(this.defaults.nextLabel);

  /** Builds the ARIA label of each page button. */
  readonly pageAriaLabel = input<(page: number) => string>(this.defaults.pageAriaLabel);

  // ---- Normalized state ------------------------------------------------------
  private readonly safeTotal = computed(() => Math.max(1, Math.floor(this.totalPages()) || 1));
  private readonly safeSiblings = computed(() => Math.max(0, Math.floor(this.siblingCount()) || 0));
  private readonly safeBoundaries = computed(() =>
    Math.max(0, Math.floor(this.boundaryCount()) || 0),
  );

  /**
   * The page actually rendered as current: the model clamped into range. The
   * model itself is never rewritten defensively — only navigation clamps.
   */
  protected readonly currentPage = computed(() =>
    Math.min(Math.max(1, Math.floor(this.page()) || 1), this.safeTotal()),
  );

  protected readonly isFirst = computed(() => this.currentPage() <= 1);
  protected readonly isLast = computed(() => this.currentPage() >= this.safeTotal());

  /**
   * Windowed item list: `boundaryCount` pages at each extreme, `siblingCount`
   * pages around the current one and ellipses for the collapsed ranges. The
   * window is position-stable (the same number of items whether the current
   * page sits at an extreme or in the middle) and degrades to a plain sequence
   * when every page fits.
   */
  protected readonly items = computed<DmPaginationItem[]>(() => {
    const count = this.safeTotal();
    const current = this.currentPage();
    const siblings = this.safeSiblings();
    const boundaries = this.safeBoundaries();

    const range = (from: number, to: number): number[] =>
      Array.from({ length: Math.max(0, to - from + 1) }, (_v, i) => from + i);

    const startPages = range(1, Math.min(boundaries, count));
    const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count);

    const siblingsStart = Math.max(
      Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
      boundaries + 2,
    );
    const siblingsEnd = Math.min(
      Math.max(current + siblings, boundaries + siblings * 2 + 2),
      endPages.length > 0 ? endPages[0] - 2 : count - 1,
    );

    const sequence: (number | 'start-ellipsis' | 'end-ellipsis')[] = [
      ...startPages,
      ...(siblingsStart > boundaries + 2
        ? (['start-ellipsis'] as const)
        : boundaries + 1 < count - boundaries
          ? [boundaries + 1]
          : []),
      ...range(siblingsStart, siblingsEnd),
      ...(siblingsEnd < count - boundaries - 1
        ? (['end-ellipsis'] as const)
        : count - boundaries > boundaries
          ? [count - boundaries]
          : []),
      ...endPages,
    ];

    const hasEllipsis = sequence.some((entry) => typeof entry !== 'number');

    return sequence.map((entry): DmPaginationItem => {
      if (typeof entry !== 'number') {
        return { kind: 'ellipsis', id: entry };
      }
      const isBoundary = entry <= boundaries || entry > count - boundaries;
      return {
        kind: 'page',
        page: entry,
        compactHidden: hasEllipsis && entry !== current && !isBoundary,
      };
    });
  });

  // ---- Navigation ------------------------------------------------------------
  protected select(next: number): void {
    if (this.disabled()) return;
    const clamped = Math.min(Math.max(1, next), this.safeTotal());
    if (clamped === this.page()) return;
    this.page.set(clamped);
  }

  protected goPrev(): void {
    this.select(this.currentPage() - 1);
  }

  protected goNext(): void {
    this.select(this.currentPage() + 1);
  }
}
