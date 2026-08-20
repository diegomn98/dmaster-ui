import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTimelineItemComponent } from './timeline-item.component';
import { DmTimelineMarkerDirective } from './timeline-marker.directive';
import { DmTimelineComponent } from './timeline.component';
import { TIMELINE_DEFAULTS } from './timeline.tokens';
import { DmTimelineAlign, DmTimelineColor, DmTimelineOrientation } from './timeline.types';

@Component({
  imports: [DmTimelineComponent, DmTimelineItemComponent, DmTimelineMarkerDirective],
  template: `
    <dm-timeline
      [orientation]="orientation()"
      [align]="align()"
      [color]="color()"
      ariaLabel="Order history"
    >
      <dm-timeline-item
        title="Order placed"
        time="Mar 3"
        datetime="2026-03-03T10:00:00Z"
        state="completed"
      >
        We received your order.
      </dm-timeline-item>
      <dm-timeline-item
        title="Shipped"
        time="Mar 5"
        [color]="secondColor()"
        variant="outlined"
        state="active"
      />
      <dm-timeline-item title="Ana commented">
        <span dmTimelineMarker class="custom-avatar">A</span>
        Looks good to me!
      </dm-timeline-item>
      @if (showLast()) {
        <dm-timeline-item state="error">Delivery failed</dm-timeline-item>
      }
    </dm-timeline>
  `,
})
class HostComponent {
  readonly orientation = signal<DmTimelineOrientation>('vertical');
  readonly align = signal<DmTimelineAlign>('start');
  readonly color = signal<DmTimelineColor>('primary');
  readonly secondColor = signal<DmTimelineColor | undefined>(undefined);
  readonly showLast = signal(true);
}

@Component({
  imports: [DmTimelineComponent, DmTimelineItemComponent],
  template: `
    <dm-timeline>
      <dm-timeline-item title="Only" />
    </dm-timeline>
  `,
})
class BareHostComponent {}

describe('DmTimelineComponent', () => {
  describe('standalone host', () => {
    let fixture: ComponentFixture<DmTimelineComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
      fixture = TestBed.createComponent(DmTimelineComponent);
      fixture.detectChanges();
    });

    it('renders as a list with the default data attributes', () => {
      const host: HTMLElement = fixture.nativeElement;
      expect(host.getAttribute('role')).toBe('list');
      expect(host.classList.contains('dm-timeline')).toBe(true);
      expect(host.getAttribute('data-orientation')).toBe('vertical');
      expect(host.getAttribute('data-align')).toBe('start');
      expect(host.getAttribute('data-size')).toBe('md');
      expect(host.getAttribute('data-color')).toBe('primary');
      expect(host.getAttribute('aria-label')).toBeNull();
      expect(fixture.componentInstance.itemCount()).toBe(0);
    });

    it('reflects orientation / align / size / color / ariaLabel inputs on the host', () => {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.componentRef.setInput('align', 'alternate');
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('color', 'success');
      fixture.componentRef.setInput('ariaLabel', 'Release history');
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.getAttribute('data-orientation')).toBe('horizontal');
      expect(host.getAttribute('data-align')).toBe('alternate');
      expect(host.getAttribute('data-size')).toBe('lg');
      expect(host.getAttribute('data-color')).toBe('success');
      expect(host.getAttribute('aria-label')).toBe('Release history');
    });
  });

  describe('with projected items', () => {
    let fixture: ComponentFixture<HostComponent>;

    function timeline(): HTMLElement {
      return fixture.nativeElement.querySelector('dm-timeline');
    }

    function items(): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('dm-timeline-item'));
    }

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
    });

    it('renders the items in order as listitems and stamps their one-based position', () => {
      expect(timeline().getAttribute('aria-label')).toBe('Order history');
      expect(items()).toHaveLength(4);

      items().forEach((item, i) => {
        expect(item.getAttribute('role')).toBe('listitem');
        expect(item.style.getPropertyValue('--dm-timeline-i')).toBe(String(i + 1));
      });
      expect(items()[0].querySelector('.dm-timeline-item__title')?.textContent).toBe(
        'Order placed',
      );
      expect(items()[2].querySelector('.dm-timeline-item__title')?.textContent).toBe(
        'Ana commented',
      );
    });

    it('drops the trailing connector on the last item only', () => {
      const list = items();
      list.slice(0, -1).forEach((item) => {
        expect(item.querySelector('.dm-timeline-item__connector')).not.toBeNull();
        expect(item.hasAttribute('data-last')).toBe(false);
      });
      expect(list[3].querySelector('.dm-timeline-item__connector')).toBeNull();
      expect(list[3].hasAttribute('data-last')).toBe(true);
    });

    it('re-flows the connectors when an item is removed', () => {
      fixture.componentInstance.showLast.set(false);
      fixture.detectChanges();

      const list = items();
      expect(list).toHaveLength(3);
      expect(list[2].hasAttribute('data-last')).toBe(true);
      expect(list[2].querySelector('.dm-timeline-item__connector')).toBeNull();
      expect(list[1].querySelector('.dm-timeline-item__connector')).not.toBeNull();
    });

    it('renders title and time, using <time datetime> only when an ISO datetime is given', () => {
      const first = items()[0];
      const time = first.querySelector('time.dm-timeline-item__time');
      expect(time).not.toBeNull();
      expect(time?.getAttribute('datetime')).toBe('2026-03-03T10:00:00Z');
      expect(time?.textContent).toBe('Mar 3');

      // No datetime → plain span.
      const second = items()[1];
      expect(second.querySelector('time')).toBeNull();
      expect(second.querySelector('span.dm-timeline-item__time')?.textContent).toBe('Mar 5');

      // Neither title nor time → no header at all, body still projected.
      const last = items()[3];
      expect(last.querySelector('.dm-timeline-item__header')).toBeNull();
      expect(last.querySelector('.dm-timeline-item__body')?.textContent).toContain(
        'Delivery failed',
      );
    });

    it('strips the native title attribute from the item host', () => {
      expect(items()[0].hasAttribute('title')).toBe(false);
    });

    it('reflects color (own or inherited), variant and state as data attributes', () => {
      const [first, second, , last] = items();

      // Color falls back to the parent's.
      expect(first.getAttribute('data-color')).toBe('primary');
      expect(first.getAttribute('data-variant')).toBe('solid');
      expect(first.getAttribute('data-state')).toBe('completed');

      expect(second.getAttribute('data-variant')).toBe('outlined');
      expect(second.getAttribute('data-state')).toBe('active');
      expect(last.getAttribute('data-state')).toBe('error');

      // Parent color change propagates to items without their own color…
      fixture.componentInstance.color.set('success');
      fixture.detectChanges();
      expect(first.getAttribute('data-color')).toBe('success');
      expect(second.getAttribute('data-color')).toBe('success');

      // …while a per-item color wins.
      fixture.componentInstance.secondColor.set('warning');
      fixture.detectChanges();
      expect(first.getAttribute('data-color')).toBe('success');
      expect(second.getAttribute('data-color')).toBe('warning');
    });

    it('renders a decorative glyph for completed / error states and none for the rest', () => {
      const [first, second, , last] = items();

      expect(first.querySelector('.dm-timeline-item__marker')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
      expect(first.querySelector('.dm-timeline-item__glyph')).not.toBeNull();
      expect(last.querySelector('.dm-timeline-item__glyph')).not.toBeNull();
      expect(second.querySelector('.dm-timeline-item__glyph')).toBeNull();
    });

    it('replaces the default marker with a projected [dmTimelineMarker]', () => {
      const third = items()[2];
      expect(third.querySelector('.dm-timeline-item__marker')).toBeNull();

      const custom = third.querySelector('.dm-timeline-item__custom .custom-avatar');
      expect(custom).not.toBeNull();
      expect(custom?.classList.contains('dm-timeline-marker')).toBe(true);

      // Items without a custom marker keep the default dot.
      expect(items()[0].querySelector('.dm-timeline-item__marker')).not.toBeNull();
    });

    it('mirrors orientation / align on every item and zig-zags sides in alternate mode', () => {
      items().forEach((item) => {
        expect(item.getAttribute('data-orientation')).toBe('vertical');
        expect(item.getAttribute('data-align')).toBe('start');
        expect(item.getAttribute('data-side')).toBe('end');
      });

      fixture.componentInstance.align.set('alternate');
      fixture.componentInstance.orientation.set('horizontal');
      fixture.detectChanges();

      expect(timeline().getAttribute('data-align')).toBe('alternate');
      const sides = items().map((item) => item.getAttribute('data-side'));
      expect(sides).toEqual(['end', 'start', 'end', 'start']);
      items().forEach((item) => {
        expect(item.getAttribute('data-orientation')).toBe('horizontal');
        expect(item.getAttribute('data-align')).toBe('alternate');
      });
    });
  });

  describe('defaults', () => {
    it('honors defaults injected via TIMELINE_DEFAULTS', () => {
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
      TestBed.overrideProvider(TIMELINE_DEFAULTS, {
        useValue: {
          orientation: 'horizontal',
          align: 'alternate',
          size: 'sm',
          color: 'danger',
          variant: 'outlined',
        },
      });
      const fixture = TestBed.createComponent(BareHostComponent);
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement.querySelector('dm-timeline');
      expect(host.getAttribute('data-orientation')).toBe('horizontal');
      expect(host.getAttribute('data-align')).toBe('alternate');
      expect(host.getAttribute('data-size')).toBe('sm');
      expect(host.getAttribute('data-color')).toBe('danger');

      const item: HTMLElement = fixture.nativeElement.querySelector('dm-timeline-item');
      expect(item.getAttribute('data-color')).toBe('danger');
      expect(item.getAttribute('data-variant')).toBe('outlined');
    });
  });
});
