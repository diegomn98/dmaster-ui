import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmAccordionComponent } from './accordion.component';
import { DmAccordionItemComponent } from './accordion-item.component';
import { ACCORDION_DEFAULTS } from './accordion.tokens';
import {
  DmAccordionSelectionMode,
  DmAccordionToggleEvent,
  DmAccordionVariant,
} from './accordion.types';

@Component({
  imports: [DmAccordionComponent, DmAccordionItemComponent],
  template: `
    <dm-accordion
      [selectionMode]="mode()"
      [variant]="variant()"
      [disabled]="disabled()"
      [(expandedValues)]="expanded"
      (itemToggled)="toggles.push($event)"
    >
      <dm-accordion-item value="a" title="First" subtitle="One">Body A</dm-accordion-item>
      <dm-accordion-item value="b" title="Second">Body B</dm-accordion-item>
      <dm-accordion-item value="c" title="Third" [disabled]="thirdDisabled()"
        >Body C</dm-accordion-item
      >
    </dm-accordion>
  `,
})
class HostComponent {
  readonly mode = signal<DmAccordionSelectionMode>('single');
  readonly variant = signal<DmAccordionVariant>('light');
  readonly disabled = signal(false);
  readonly thirdDisabled = signal(false);
  readonly expanded = signal<string[]>([]);
  readonly toggles: DmAccordionToggleEvent[] = [];
}

describe('DmAccordionComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-accordion-item'));
  }

  function triggers(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-accordion-item__trigger'));
  }

  function panels(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-accordion-item__panel'));
  }

  function createHost(): void {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('emits (itemToggled) with value + expanded on expand and collapse', () => {
    createHost();
    triggers()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.toggles).toEqual([{ value: 'a', expanded: true }]);

    triggers()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.toggles).toEqual([
      { value: 'a', expanded: true },
      { value: 'a', expanded: false },
    ]);
  });

  it('renders every item collapsed by default', () => {
    createHost();

    expect(items().length).toBe(3);
    for (const item of items()) {
      expect(item.getAttribute('data-expanded')).toBe('false');
    }
    for (const trigger of triggers()) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('clicking a header toggles the item open, then closed', () => {
    createHost();

    triggers()[0].click();
    fixture.detectChanges();

    expect(items()[0].getAttribute('data-expanded')).toBe('true');
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.expanded()).toEqual(['a']);

    triggers()[0].click();
    fixture.detectChanges();

    expect(items()[0].getAttribute('data-expanded')).toBe('false');
    expect(fixture.componentInstance.expanded()).toEqual([]);
  });

  it("selectionMode='single' closes the previous item when opening a new one", () => {
    createHost();

    triggers()[0].click();
    fixture.detectChanges();
    triggers()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual(['b']);
    expect(items()[0].getAttribute('data-expanded')).toBe('false');
    expect(items()[1].getAttribute('data-expanded')).toBe('true');
  });

  it("selectionMode='multiple' keeps multiple items expanded", () => {
    createHost();
    fixture.componentInstance.mode.set('multiple');
    fixture.detectChanges();

    triggers()[0].click();
    fixture.detectChanges();
    triggers()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual(['a', 'b']);
    expect(items()[0].getAttribute('data-expanded')).toBe('true');
    expect(items()[1].getAttribute('data-expanded')).toBe('true');
  });

  it('two-way [(expandedValues)] opens items when set from outside', () => {
    createHost();

    fixture.componentInstance.expanded.set(['b']);
    fixture.detectChanges();

    expect(items()[1].getAttribute('data-expanded')).toBe('true');
    expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('Enter toggles the focused item', () => {
    createHost();

    triggers()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual(['a']);
  });

  it('Space toggles the focused item', () => {
    createHost();

    triggers()[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual(['b']);
  });

  it('ArrowDown / ArrowUp move focus between enabled triggers (wrap-around)', () => {
    createHost();
    triggers()[0].focus();

    triggers()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(document.activeElement).toBe(triggers()[1]);

    triggers()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(document.activeElement).toBe(triggers()[2]);

    // Wrap forward to first.
    triggers()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(document.activeElement).toBe(triggers()[0]);

    // Wrap back to last.
    triggers()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(document.activeElement).toBe(triggers()[2]);
  });

  it('ArrowDown skips disabled items', () => {
    createHost();
    fixture.componentInstance.thirdDisabled.set(true);
    fixture.detectChanges();

    triggers()[1].focus();
    triggers()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    // Third item is disabled → wraps back to first.
    expect(document.activeElement).toBe(triggers()[0]);
  });

  it('wires each panel with role=region and aria-labelledby → header id', () => {
    createHost();

    for (const panel of panels()) {
      expect(panel.getAttribute('role')).toBe('region');
      const labelledBy = panel.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      const header = fixture.nativeElement.querySelector(`#${labelledBy}`);
      expect(header).toBeTruthy();
      expect(header?.getAttribute('aria-controls')).toBe(panel.id);
    }
  });

  it('sets aria-hidden and inert on collapsed panels; clears them when expanded', () => {
    createHost();

    expect(panels()[0].getAttribute('aria-hidden')).toBe('true');
    expect(panels()[0].hasAttribute('inert')).toBe(true);

    triggers()[0].click();
    fixture.detectChanges();

    expect(panels()[0].getAttribute('aria-hidden')).toBe('false');
    expect(panels()[0].hasAttribute('inert')).toBe(false);
  });

  it('disabled item ignores clicks and keyboard toggles', () => {
    createHost();
    fixture.componentInstance.thirdDisabled.set(true);
    fixture.detectChanges();

    triggers()[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual([]);

    // Even a manually dispatched Enter is ignored (disabled button early-outs).
    triggers()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual([]);
  });

  it('parent `disabled` locks down every item', () => {
    createHost();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    for (const trigger of triggers()) {
      expect(trigger.disabled).toBe(true);
    }
    triggers()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toEqual([]);
  });

  it('reflects variant on the container', () => {
    createHost();

    expect(fixture.nativeElement.querySelector('dm-accordion')?.getAttribute('data-variant')).toBe(
      'light',
    );

    fixture.componentInstance.variant.set('bordered');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('dm-accordion')?.getAttribute('data-variant')).toBe(
      'bordered',
    );
  });

  it('honors defaults injected via ACCORDION_DEFAULTS', () => {
    TestBed.overrideProvider(ACCORDION_DEFAULTS, {
      useValue: { variant: 'splitted', selectionMode: 'multiple' },
    });

    const bareFixture = TestBed.createComponent(DmAccordionComponent);
    bareFixture.detectChanges();

    expect(bareFixture.nativeElement.getAttribute('data-variant')).toBe('splitted');
    expect(bareFixture.componentInstance.selectionMode()).toBe('multiple');
  });

  it('renders the chevron indicator SVG inside each trigger', () => {
    createHost();

    for (const trigger of triggers()) {
      const indicator = trigger.querySelector('.dm-accordion-item__indicator');
      expect(indicator).toBeTruthy();
      expect(indicator?.tagName.toLowerCase()).toBe('svg');
    }
  });
});

@Component({
  imports: [DmAccordionComponent, DmAccordionItemComponent],
  template: `
    <dm-accordion>
      <dm-accordion-item value="withIcon" title="Has icon">
        <svg dm-accordion-icon data-testid="leading-icon" viewBox="0 0 24 24"></svg>
        Body
      </dm-accordion-item>
      <dm-accordion-item value="noIcon" title="No icon">Body</dm-accordion-item>
    </dm-accordion>
  `,
})
class IconHostComponent {}

describe('DmAccordionItemComponent · leading icon slot', () => {
  let fixture: ComponentFixture<IconHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(IconHostComponent);
    fixture.detectChanges();
  });

  function iconSlots(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-accordion-item__icon'));
  }

  it('projects a [dm-accordion-icon] node into the leading icon slot', () => {
    const projected = iconSlots()[0].querySelector('[data-testid="leading-icon"]');
    expect(projected).toBeTruthy();
    expect(iconSlots()[0].contains(projected)).toBe(true);
  });

  it('leaves the icon slot empty when nothing is projected', () => {
    // The `:empty` CSS rule collapses the slot; assert there is no element child.
    expect(iconSlots()[1].children.length).toBe(0);
  });
});
