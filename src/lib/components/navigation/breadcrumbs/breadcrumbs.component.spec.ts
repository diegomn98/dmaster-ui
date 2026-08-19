import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmBreadcrumbItemComponent } from './breadcrumb-item.component';
import { DmBreadcrumbsComponent } from './breadcrumbs.component';
import { BREADCRUMBS_DEFAULTS } from './breadcrumbs.tokens';
import { DmBreadcrumbsSize } from './breadcrumbs.types';

interface Crumb {
  label: string;
  href?: string;
  disabled?: boolean;
}

@Component({
  imports: [DmBreadcrumbsComponent, DmBreadcrumbItemComponent],
  template: `
    <dm-breadcrumbs
      [separator]="separator()"
      [size]="size()"
      [ariaLabel]="ariaLabel()"
      [maxItems]="maxItems()"
      [itemsBeforeCollapse]="before()"
      [itemsAfterCollapse]="after()"
    >
      @for (c of crumbs(); track c.label) {
        <dm-breadcrumb-item [href]="c.href" [disabled]="c.disabled ?? false">{{
          c.label
        }}</dm-breadcrumb-item>
      }
    </dm-breadcrumbs>
  `,
})
class HostComponent {
  readonly separator = signal<string>('');
  readonly size = signal<DmBreadcrumbsSize>('md');
  readonly ariaLabel = signal<string>('Breadcrumbs');
  readonly maxItems = signal<number | null>(null);
  readonly before = signal<number>(1);
  readonly after = signal<number>(2);
  readonly crumbs = signal<Crumb[]>([
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/library' },
    { label: 'Data', href: '/library/data' },
  ]);
}

// A host with no ariaLabel/size bindings so the token defaults flow through.
@Component({
  imports: [DmBreadcrumbsComponent, DmBreadcrumbItemComponent],
  template: `
    <dm-breadcrumbs>
      <dm-breadcrumb-item href="/">Home</dm-breadcrumb-item>
      <dm-breadcrumb-item href="/a">A</dm-breadcrumb-item>
      <dm-breadcrumb-item>Now</dm-breadcrumb-item>
    </dm-breadcrumbs>
  `,
})
class BareHostComponent {}

describe('DmBreadcrumbsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function nav(): HTMLElement {
    return fixture.nativeElement.querySelector('nav.dm-breadcrumbs');
  }

  function realItems(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        '.dm-breadcrumb-item:not(.dm-breadcrumb-item--ellipsis)',
      ),
    );
  }

  function links(): HTMLAnchorElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('a.dm-breadcrumb-item__link'));
  }

  function pages(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('span.dm-breadcrumb-item__page'));
  }

  function separators(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-breadcrumb-item__separator'));
  }

  function chevrons(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('svg.dm-breadcrumb-item__chevron'));
  }

  function labels(): string[] {
    return realItems().map((li) => (li.textContent ?? '').trim());
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('renders a nav landmark wrapping an ordered list with one item per crumb', () => {
    fixture.detectChanges();

    expect(nav()).toBeTruthy();
    expect(nav().tagName).toBe('NAV');
    expect(fixture.nativeElement.querySelector('ol.dm-breadcrumbs__list')).toBeTruthy();
    expect(realItems().length).toBe(3);
    expect(labels()).toEqual(['Home', 'Library', 'Data']);
    expect(nav().getAttribute('data-size')).toBe('md');
  });

  it('marks the last crumb as the current page: aria-current, span, never a link', () => {
    fixture.detectChanges();

    const current = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(current).toBeTruthy();
    expect(current.tagName).toBe('SPAN');
    expect((current.textContent ?? '').trim()).toBe('Data');
    // Home + Library are links; Data (last) is a span even though it has an href.
    expect(links().length).toBe(2);
    expect(pages().length).toBe(1);
  });

  it('renders href crumbs as anchors and hrefless crumbs as plain text', () => {
    host.crumbs.set([
      { label: 'Home', href: '/' },
      { label: 'Middle' },
      { label: 'Leaf', href: '/leaf' },
    ]);
    fixture.detectChanges();

    // Home has href → anchor; Middle has none → span (not current, no aria-current).
    expect(links().length).toBe(1);
    expect(links()[0].getAttribute('href')).toBe('/');

    const middle = realItems()[1].querySelector('.dm-breadcrumb-item__page');
    expect(middle).toBeTruthy();
    expect(middle?.getAttribute('aria-current')).toBeNull();
    expect(realItems()[1].querySelector('a')).toBeNull();
  });

  it('uses the chevron separator by default and drops it after the last crumb', () => {
    fixture.detectChanges();

    expect(separators().length).toBe(2);
    expect(chevrons().length).toBe(2);
    expect(separators()[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a custom separator string instead of the chevron', () => {
    host.separator.set('/');
    fixture.detectChanges();

    expect(chevrons().length).toBe(0);
    expect(separators().length).toBe(2);
    expect((separators()[0].textContent ?? '').trim()).toBe('/');
  });

  it('renders a disabled crumb as a muted, non-interactive span with aria-disabled', () => {
    host.crumbs.set([
      { label: 'Home', href: '/' },
      { label: 'Locked', href: '/locked', disabled: true },
      { label: 'End', href: '/end' },
    ]);
    fixture.detectChanges();

    const disabled = fixture.nativeElement.querySelector('[aria-disabled="true"]');
    expect(disabled).toBeTruthy();
    expect(disabled.tagName).toBe('SPAN');
    expect((disabled.textContent ?? '').trim()).toBe('Locked');
    // Only Home is a link (Locked disabled → span, End is current → span).
    expect(links().length).toBe(1);
  });

  it('collapses the middle range into a static ellipsis past maxItems', () => {
    host.crumbs.set([
      { label: 'A', href: '/a' },
      { label: 'B', href: '/b' },
      { label: 'C', href: '/c' },
      { label: 'D', href: '/d' },
      { label: 'E', href: '/e' },
    ]);
    host.maxItems.set(3);
    fixture.detectChanges();

    const ellipsis = fixture.nativeElement.querySelector('.dm-breadcrumb-item--ellipsis');
    expect(ellipsis).toBeTruthy();
    // The ellipsis is purely decorative; the whole wrapper is aria-hidden.
    expect(ellipsis.getAttribute('aria-hidden')).toBe('true');
    expect(ellipsis.querySelector('a')).toBeNull(); // not interactive
    // before=1, after=2 → visible A, D, E; B and C removed from the DOM.
    expect(realItems().length).toBe(3);
    expect(labels()).toEqual(['A', 'D', 'E']);
    // A and D are links, E (last) is the current span.
    expect(links().length).toBe(2);
  });

  it('keeps every crumb when the count does not exceed maxItems', () => {
    host.maxItems.set(3);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dm-breadcrumb-item--ellipsis')).toBeNull();
    expect(realItems().length).toBe(3);
  });

  it('reflects size as a data attribute on the nav', () => {
    host.size.set('lg');
    fixture.detectChanges();

    expect(nav().getAttribute('data-size')).toBe('lg');
  });

  it('overrides the nav aria-label via the ariaLabel input', () => {
    host.ariaLabel.set('Ruta de navegación');
    fixture.detectChanges();

    expect(nav().getAttribute('aria-label')).toBe('Ruta de navegación');
  });

  it("defaults the nav aria-label to 'Breadcrumbs'", () => {
    const bare = TestBed.createComponent(BareHostComponent);
    bare.detectChanges();

    const bareNav = bare.nativeElement.querySelector('nav.dm-breadcrumbs');
    expect(bareNav.getAttribute('aria-label')).toBe('Breadcrumbs');
  });

  it('honors the aria-label injected via BREADCRUMBS_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: BREADCRUMBS_DEFAULTS, useValue: { ariaLabel: 'Ruta', size: 'md' } },
      ],
    });
    const bare = TestBed.createComponent(BareHostComponent);
    bare.detectChanges();

    const bareNav = bare.nativeElement.querySelector('nav.dm-breadcrumbs');
    expect(bareNav.getAttribute('aria-label')).toBe('Ruta');
  });

  it('honors the size injected via BREADCRUMBS_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: BREADCRUMBS_DEFAULTS, useValue: { ariaLabel: 'Breadcrumbs', size: 'lg' } },
      ],
    });
    const bare = TestBed.createComponent(BareHostComponent);
    bare.detectChanges();

    const bareNav = bare.nativeElement.querySelector('nav.dm-breadcrumbs');
    expect(bareNav.getAttribute('data-size')).toBe('lg');
  });
});
