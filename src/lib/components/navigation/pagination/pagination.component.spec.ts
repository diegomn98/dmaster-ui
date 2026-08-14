import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmPaginationComponent } from './pagination.component';
import { DM_PAGINATION_FALLBACK_DEFAULTS, PAGINATION_DEFAULTS } from './pagination.tokens';

describe('DmPaginationComponent', () => {
  let fixture: ComponentFixture<DmPaginationComponent>;

  function create(overrides: Record<string, unknown> = {}): void {
    fixture = TestBed.createComponent(DmPaginationComponent);
    fixture.componentRef.setInput('totalPages', overrides['totalPages'] ?? 10);
    for (const [key, value] of Object.entries(overrides)) {
      if (key === 'totalPages') continue;
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  const el = (sel: string): HTMLElement => fixture.nativeElement.querySelector(sel);
  const all = (sel: string): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll(sel));

  function nav(): HTMLElement {
    return el('.dm-pagination');
  }
  function pageButtons(): HTMLButtonElement[] {
    return all('.dm-pagination__page') as HTMLButtonElement[];
  }
  function pageButton(page: number): HTMLButtonElement {
    return el(`[aria-label="Page ${page}"]`) as HTMLButtonElement;
  }
  function prevButton(): HTMLButtonElement {
    return el('.dm-pagination__control--prev') as HTMLButtonElement;
  }
  function nextButton(): HTMLButtonElement {
    return el('.dm-pagination__control--next') as HTMLButtonElement;
  }
  /** Page numbers and ellipses exactly as rendered, in DOM order. */
  function renderedItems(): string[] {
    return all('.dm-pagination__page, .dm-pagination__ellipsis').map(
      (node) => node.textContent?.trim() ?? '',
    );
  }
  function activePages(): string[] {
    return all('[aria-current="page"]').map((node) => node.textContent?.trim() ?? '');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  // ---- Windowing -------------------------------------------------------------

  it('renders a plain sequence without ellipsis when every page fits', () => {
    create({ totalPages: 5, page: 3 });
    expect(renderedItems()).toEqual(['1', '2', '3', '4', '5']);
    expect(all('.dm-pagination__ellipsis').length).toBe(0);
  });

  it('windows with both ellipses around a middle page', () => {
    create({ totalPages: 10, page: 5 });
    expect(renderedItems()).toEqual(['1', '…', '4', '5', '6', '…', '10']);
  });

  it('expands the start window when the current page sits at the beginning', () => {
    create({ totalPages: 10, page: 1 });
    expect(renderedItems()).toEqual(['1', '2', '3', '4', '5', '…', '10']);
  });

  it('expands the end window when the current page sits at the end', () => {
    create({ totalPages: 10, page: 10 });
    expect(renderedItems()).toEqual(['1', '…', '6', '7', '8', '9', '10']);
  });

  it('honors siblingCount', () => {
    create({ totalPages: 20, page: 10, siblingCount: 2 });
    expect(renderedItems()).toEqual(['1', '…', '8', '9', '10', '11', '12', '…', '20']);
  });

  it('honors boundaryCount', () => {
    create({ totalPages: 12, page: 6, boundaryCount: 2 });
    expect(renderedItems()).toEqual(['1', '2', '…', '5', '6', '7', '…', '11', '12']);
  });

  it('collapses to the full sequence when siblingCount covers every page', () => {
    create({ totalPages: 10, page: 5, siblingCount: 10 });
    expect(renderedItems()).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  });

  it('marks off-window pages as compact-hidden only while windowing is active', () => {
    create({ totalPages: 10, page: 5 });
    const hidden = all('[data-compact-hidden]').map((li) => li.textContent?.trim());
    expect(hidden).toEqual(['4', '6']);

    create({ totalPages: 5, page: 3 });
    expect(all('[data-compact-hidden]').length).toBe(0);
  });

  // ---- Two-way page ----------------------------------------------------------

  it('reflects the page set via setInput as aria-current', () => {
    create({ totalPages: 10, page: 3 });
    expect(activePages()).toEqual(['3']);
    fixture.componentRef.setInput('page', 4);
    fixture.detectChanges();
    expect(activePages()).toEqual(['4']);
  });

  it('clicking a page updates the model and emits pageChange', () => {
    create({ totalPages: 10, page: 5 });
    const emissions: number[] = [];
    fixture.componentInstance.page.subscribe((value) => emissions.push(value));

    pageButton(6).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(6);
    expect(emissions).toEqual([6]);

    // Clicking the already-active page emits nothing.
    pageButton(6).click();
    fixture.detectChanges();
    expect(emissions).toEqual([6]);
  });

  // ---- Prev / next controls --------------------------------------------------

  it('navigates with prev/next and disables them at the extremes', () => {
    create({ totalPages: 3, page: 1 });
    expect(prevButton().disabled).toBe(true);
    expect(nextButton().disabled).toBe(false);

    nextButton().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(2);

    nextButton().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(3);
    expect(nextButton().disabled).toBe(true);

    prevButton().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(2);
  });

  it('hides the prev/next controls when showControls is false', () => {
    create({ totalPages: 10, showControls: false });
    expect(fixture.nativeElement.querySelector('.dm-pagination__control')).toBeNull();
    expect(pageButtons().length).toBeGreaterThan(0);
  });

  // ---- Clamp -----------------------------------------------------------------

  it('clamps an out-of-range page for rendering and navigation without rewriting the model', () => {
    create({ totalPages: 5, page: 99 });
    // Rendered as the last page, next disabled — but the model is untouched.
    expect(activePages()).toEqual(['5']);
    expect(nextButton().disabled).toBe(true);
    expect(fixture.componentInstance.page()).toBe(99);

    // Navigating normalizes into range.
    pageButton(3).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(3);
  });

  it('clamps page 0 and a non-positive totalPages defensively', () => {
    create({ totalPages: 0, page: 0 });
    expect(renderedItems()).toEqual(['1']);
    expect(activePages()).toEqual(['1']);
    expect(prevButton().disabled).toBe(true);
    expect(nextButton().disabled).toBe(true);
  });

  // ---- Labels ----------------------------------------------------------------

  it('applies the default labels', () => {
    create({ totalPages: 10, page: 5 });
    expect(nav().getAttribute('aria-label')).toBe('Pagination');
    expect(prevButton().getAttribute('aria-label')).toBe('Previous page');
    expect(nextButton().getAttribute('aria-label')).toBe('Next page');
    expect(pageButton(5).getAttribute('aria-label')).toBe('Page 5');
  });

  it('overrides the labels via inputs', () => {
    create({
      totalPages: 10,
      page: 5,
      ariaLabel: 'Paginación',
      prevLabel: 'Anterior',
      nextLabel: 'Siguiente',
      pageAriaLabel: (page: number) => `Ir a la página ${page}`,
    });
    expect(nav().getAttribute('aria-label')).toBe('Paginación');
    expect(prevButton().getAttribute('aria-label')).toBe('Anterior');
    expect(nextButton().getAttribute('aria-label')).toBe('Siguiente');
    expect(el('[aria-label="Ir a la página 5"]')).not.toBeNull();
  });

  it('honors defaults injected via PAGINATION_DEFAULTS', () => {
    TestBed.overrideProvider(PAGINATION_DEFAULTS, {
      useValue: {
        ...DM_PAGINATION_FALLBACK_DEFAULTS,
        size: 'lg',
        color: 'danger',
        showControls: false,
        ariaLabel: 'Pages de résultats',
        pageAriaLabel: (page: number) => `Page nº ${page}`,
      },
    });
    create({ totalPages: 10, page: 2 });
    expect(nav().getAttribute('data-size')).toBe('lg');
    expect(nav().getAttribute('data-color')).toBe('danger');
    expect(nav().getAttribute('aria-label')).toBe('Pages de résultats');
    expect(fixture.nativeElement.querySelector('.dm-pagination__control')).toBeNull();
    expect(el('[aria-label="Page nº 2"]')).not.toBeNull();
  });

  // ---- ARIA / appearance -----------------------------------------------------

  it('marks exactly the active page with aria-current="page"', () => {
    create({ totalPages: 10, page: 5 });
    const active = all('[aria-current="page"]');
    expect(active.length).toBe(1);
    expect(active[0].textContent?.trim()).toBe('5');
    expect(active[0].classList.contains('dm-pagination__page--active')).toBe(true);
    expect(pageButton(4).hasAttribute('aria-current')).toBe(false);
  });

  it('renders ellipses as aria-hidden presentational spans', () => {
    create({ totalPages: 10, page: 5 });
    const gaps = all('.dm-pagination__ellipsis');
    expect(gaps.length).toBe(2);
    for (const gap of gaps) {
      expect(gap.tagName).toBe('SPAN');
      expect(gap.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('reflects size and color as data attributes', () => {
    create();
    expect(nav().getAttribute('data-size')).toBe('md');
    expect(nav().getAttribute('data-color')).toBe('primary');

    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('color', 'success');
    fixture.detectChanges();
    expect(nav().getAttribute('data-size')).toBe('sm');
    expect(nav().getAttribute('data-color')).toBe('success');
  });

  it('uses semantic list markup inside a nav landmark', () => {
    create({ totalPages: 10, page: 5 });
    expect(nav().tagName).toBe('NAV');
    expect(el('.dm-pagination__list').tagName).toBe('UL');
    for (const button of pageButtons()) {
      expect(button.closest('li')).not.toBeNull();
      expect(button.getAttribute('type')).toBe('button');
    }
  });

  // ---- Disabled --------------------------------------------------------------

  it('disabled disables every control and blocks navigation', () => {
    create({ totalPages: 10, page: 5, disabled: true });
    expect(nav().hasAttribute('data-disabled')).toBe(true);

    const buttons = all('button') as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button.disabled).toBe(true);
    }

    const emissions: number[] = [];
    fixture.componentInstance.page.subscribe((value) => emissions.push(value));
    pageButton(4).click();
    fixture.detectChanges();
    expect(emissions).toEqual([]);
    expect(fixture.componentInstance.page()).toBe(5);
  });
});
