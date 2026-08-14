import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  Component,
  provideZonelessChangeDetection,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmMenuDividerComponent } from './menu-divider.component';
import { DmMenuItemComponent } from './menu-item.component';
import { DmMenuSectionComponent } from './menu-section.component';
import { DmMenuTriggerDirective } from './menu-trigger.directive';
import { DmMenuComponent } from './menu.component';
import { MENU_DEFAULTS } from './menu.tokens';
import { DmMenuPlacement } from './menu.types';

@Component({
  imports: [
    DmMenuTriggerDirective,
    DmMenuComponent,
    DmMenuItemComponent,
    DmMenuSectionComponent,
    DmMenuDividerComponent,
  ],
  template: `
    <button #btn [dmMenuTrigger]="menu">Open</button>
    <dm-menu #menu ariaLabel="Row actions" [placement]="placement" [closeOnSelect]="closeOnSelect">
      <dm-menu-section heading="Manage">
        <dm-menu-item shortcut="⌘E" (selected)="onSelect('edit')">Edit</dm-menu-item>
        <dm-menu-item [disabled]="true" (selected)="onSelect('share')">Share</dm-menu-item>
      </dm-menu-section>
      <dm-menu-divider />
      <dm-menu-item color="danger" (selected)="onSelect('delete')">Delete</dm-menu-item>
    </dm-menu>
  `,
})
class HostComponent {
  readonly menuCmp = viewChild.required<DmMenuComponent>('menu');
  placement: DmMenuPlacement = 'bottom-start';
  closeOnSelect = true;
  readonly selectedItems: string[] = [];
  onSelect(value: string): void {
    this.selectedItems.push(value);
  }
}

// No input bindings on the menu — so the injected defaults surface unmodified.
@Component({
  imports: [DmMenuTriggerDirective, DmMenuComponent, DmMenuItemComponent],
  template: `
    <button [dmMenuTrigger]="menu">Open</button>
    <dm-menu #menu>
      <dm-menu-item>Only</dm-menu-item>
    </dm-menu>
  `,
})
class BareHostComponent {
  readonly menuCmp = viewChild.required<DmMenuComponent>('menu');
}

describe('DmMenu', () => {
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  function create(): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function trigger(fixture: ComponentFixture<HostComponent>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  function container(): HTMLElement {
    return overlayContainer.getContainerElement();
  }

  function panel(): HTMLElement | null {
    return container().querySelector('.dm-menu__panel');
  }

  function items(): HTMLElement[] {
    return Array.from(container().querySelectorAll<HTMLElement>('.dm-menu-item__btn'));
  }

  function activeItem(): HTMLElement | undefined {
    return items().find((el) => el.hasAttribute('data-active'));
  }

  // CDK's ListKeyManager reads `event.keyCode`; jsdom drops it from the init
  // dict, so we define it explicitly for the navigational keys.
  const KEY_CODES: Record<string, number> = {
    ArrowDown: 40,
    ArrowUp: 38,
    Home: 36,
    End: 35,
    Enter: 13,
    Escape: 27,
    Tab: 9,
    ' ': 32,
  };

  function key(target: EventTarget, k: string): void {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true });
    const code = KEY_CODES[k] ?? (k.length === 1 ? k.toUpperCase().charCodeAt(0) : 0);
    Object.defineProperty(event, 'keyCode', { get: () => code });
    target.dispatchEvent(event);
  }

  function openByClick(fixture: ComponentFixture<HostComponent>): void {
    trigger(fixture).click();
    tick();
  }

  it('renders a trigger with the correct ARIA and no panel initially', () => {
    const fixture = create();
    const btn = trigger(fixture);
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.hasAttribute('aria-controls')).toBe(false);
    expect(panel()).toBeNull();
  });

  it('opens on click and wires aria-expanded / aria-controls / role=menu', () => {
    const fixture = create();
    openByClick(fixture);

    const p = panel();
    expect(p).not.toBeNull();
    expect(p?.getAttribute('role')).toBe('menu');
    expect(p?.getAttribute('aria-label')).toBe('Row actions');
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(trigger(fixture).getAttribute('aria-controls')).toBe(p?.id);
  });

  it('renders menuitem roles, danger color and a shortcut kbd', () => {
    const fixture = create();
    openByClick(fixture);

    const rendered = items();
    expect(rendered.length).toBe(3);
    expect(rendered.every((el) => el.getAttribute('role') === 'menuitem')).toBe(true);
    expect(rendered[2].getAttribute('data-color')).toBe('danger');
    expect(container().querySelector('.dm-menu-item__shortcut')?.textContent).toContain('⌘E');
  });

  it('opens with ArrowDown and focuses the first item', () => {
    const fixture = create();
    key(trigger(fixture), 'ArrowDown');
    tick();
    expect(activeItem()?.textContent).toContain('Edit');
  });

  it('opens with Enter and focuses the first item', () => {
    const fixture = create();
    key(trigger(fixture), 'Enter');
    tick();
    expect(activeItem()?.textContent).toContain('Edit');
  });

  it('opens with ArrowUp and focuses the last item', () => {
    const fixture = create();
    key(trigger(fixture), 'ArrowUp');
    tick();
    expect(activeItem()?.textContent).toContain('Delete');
  });

  it('skips disabled items when navigating with ArrowDown', () => {
    const fixture = create();
    key(trigger(fixture), 'ArrowDown'); // Edit
    tick();
    key(panel()!, 'ArrowDown'); // Share is disabled → Delete
    tick();
    expect(activeItem()?.textContent).toContain('Delete');
  });

  it('wraps from the last item back to the first with ArrowDown', () => {
    const fixture = create();
    key(trigger(fixture), 'ArrowUp'); // Delete (last)
    tick();
    key(panel()!, 'ArrowDown'); // wrap → Edit
    tick();
    expect(activeItem()?.textContent).toContain('Edit');
  });

  it('jumps to first / last with Home and End', () => {
    const fixture = create();
    key(trigger(fixture), 'ArrowUp'); // Delete
    tick();
    key(panel()!, 'Home');
    tick();
    expect(activeItem()?.textContent).toContain('Edit');
    key(panel()!, 'End');
    tick();
    expect(activeItem()?.textContent).toContain('Delete');
  });

  it('focuses the matching item via type-ahead', async () => {
    const fixture = create();
    openByClick(fixture);
    key(panel()!, 'd');
    await new Promise((resolve) => setTimeout(resolve, 260));
    tick();
    expect(activeItem()?.textContent).toContain('Delete');
  });

  it('activates an item with Enter: emits selected and closes', () => {
    const fixture = create();
    key(trigger(fixture), 'ArrowDown'); // Edit active
    tick();
    key(panel()!, 'Enter');
    tick();

    expect(fixture.componentInstance.selectedItems).toEqual(['edit']);
    expect(panel()).toBeNull();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('activates an item with a mouse click', () => {
    const fixture = create();
    openByClick(fixture);
    items()[0].click(); // Edit
    tick();
    expect(fixture.componentInstance.selectedItems).toEqual(['edit']);
    expect(panel()).toBeNull();
  });

  it('does not activate a disabled item on click and stays open', () => {
    const fixture = create();
    openByClick(fixture);
    items()[1].click(); // Share (disabled)
    tick();
    expect(fixture.componentInstance.selectedItems).toEqual([]);
    expect(panel()).not.toBeNull();
  });

  it('keeps the menu open after selection when closeOnSelect is false', () => {
    // Set the input before the first CD so the binding never transitions.
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.closeOnSelect = false;
    fixture.detectChanges();

    key(trigger(fixture), 'ArrowDown'); // Edit
    tick();
    key(panel()!, 'Enter');
    tick();

    expect(fixture.componentInstance.selectedItems).toEqual(['edit']);
    expect(panel()).not.toBeNull();
  });

  it('closes on Escape and returns focus to the trigger', () => {
    const fixture = create();
    openByClick(fixture);
    key(panel()!, 'Escape');
    tick();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger(fixture));
  });

  it('closes on Tab and returns focus to the trigger', () => {
    const fixture = create();
    openByClick(fixture);
    key(panel()!, 'Tab');
    tick();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger(fixture));
  });

  it('closes on backdrop (outside) click without moving focus back', () => {
    const fixture = create();
    openByClick(fixture);
    const backdrop = container().querySelector<HTMLElement>('.cdk-overlay-backdrop');
    backdrop?.click();
    tick();
    expect(panel()).toBeNull();
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('emits opened and closed around the lifecycle', () => {
    const fixture = create();
    let opened = 0;
    let closed = 0;
    fixture.componentInstance.menuCmp().opened.subscribe(() => (opened += 1));
    fixture.componentInstance.menuCmp().closed.subscribe(() => (closed += 1));

    openByClick(fixture);
    expect(opened).toBe(1);
    key(panel()!, 'Escape');
    tick();
    expect(closed).toBe(1);
  });

  it('labels a section group via aria-labelledby', () => {
    const fixture = create();
    openByClick(fixture);
    const section = container().querySelector('dm-menu-section');
    const heading = container().querySelector('.dm-menu-section__heading');
    expect(section?.getAttribute('role')).toBe('group');
    expect(section?.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(heading?.textContent).toContain('Manage');
  });

  it('renders a separator for the divider', () => {
    const fixture = create();
    openByClick(fixture);
    const separator = container().querySelector('dm-menu-divider');
    expect(separator?.getAttribute('role')).toBe('separator');
  });

  it('honours provided MENU_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MENU_DEFAULTS, useValue: { placement: 'top-end', closeOnSelect: false } },
      ],
    });
    const fixture = TestBed.createComponent(BareHostComponent);
    fixture.detectChanges();

    const menu = fixture.componentInstance.menuCmp();
    expect(menu.placement()).toBe('top-end');
    expect(menu.closeOnSelect()).toBe(false);
  });
});
