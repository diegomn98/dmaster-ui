import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  Component,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmCommandItemDirective } from './command-item.directive';
import { DmCommandComponent } from './command.component';
import { COMMAND_DEFAULTS } from './command.tokens';
import { DmCommandItem } from './command.types';

const ITEMS: DmCommandItem[] = [
  { id: 'new', label: 'New File', group: 'File', shortcut: '⌘N', keywords: ['create'] },
  { id: 'open', label: 'Open File', group: 'File' },
  { id: 'save', label: 'Save', group: 'File', disabled: true },
  { id: 'copy', label: 'Copy', group: 'Edit', shortcut: '⌘C' },
  { id: 'paste', label: 'Paste', group: 'Edit' },
  { id: 'settings', label: 'Settings' },
];

@Component({
  imports: [DmCommandComponent],
  template: `
    <button #trigger type="button">Open</button>
    <dm-command [items]="items" [(open)]="open" [hotkey]="hotkey()" (selected)="onSelect($event)" />
  `,
})
class HostComponent {
  readonly cmp = viewChild.required(DmCommandComponent);
  readonly items = ITEMS;
  readonly open = signal(false);
  readonly hotkey = signal('mod+k');
  readonly selectedIds: string[] = [];
  onSelect(item: DmCommandItem): void {
    this.selectedIds.push(item.id);
  }
}

// No copy inputs — the injected defaults surface unmodified.
@Component({
  imports: [DmCommandComponent],
  template: `<dm-command [items]="items" [(open)]="open" />`,
})
class BareHostComponent {
  readonly items = ITEMS;
  readonly open = signal(false);
}

// Projects an ng-template[dmCommandItem] replacing the default row content.
@Component({
  imports: [DmCommandComponent, DmCommandItemDirective],
  template: `
    <dm-command [items]="items" [(open)]="open" (selected)="onSelect($event)">
      <ng-template dmCommandItem let-item let-active="active">
        <span class="custom-row" [attr.data-custom-active]="active ? '' : null">
          {{ item.icon }} · {{ item.label }}
        </span>
      </ng-template>
    </dm-command>
  `,
})
class TemplatedHostComponent {
  readonly items: DmCommandItem[] = ITEMS.map((item) => ({ ...item, icon: `${item.id}-icon` }));
  readonly open = signal(false);
  readonly selectedIds: string[] = [];
  onSelect(item: DmCommandItem): void {
    this.selectedIds.push(item.id);
  }
}

describe('DmCommandComponent', () => {
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function create(): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    return fixture;
  }

  function container(): HTMLElement {
    return overlayContainer.getContainerElement();
  }

  function panel(): HTMLElement | null {
    return container().querySelector('.dm-command__panel');
  }

  function input(): HTMLInputElement | null {
    return container().querySelector('.dm-command__input');
  }

  function options(): HTMLElement[] {
    return Array.from(container().querySelectorAll('.dm-command__option'));
  }

  function activeOption(): HTMLElement | undefined {
    return options().find((el) => el.hasAttribute('data-active'));
  }

  function backdrop(): HTMLElement | null {
    return container().querySelector('.dm-command-backdrop');
  }

  function openPalette(
    fixture: ComponentFixture<{ open: ReturnType<typeof signal<boolean>> }>,
  ): void {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    tick();
  }

  function key(target: EventTarget | null, k: string): void {
    target?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  }

  function type(el: HTMLInputElement, value: string): void {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('renders no overlay while closed', () => {
    create();
    expect(panel()).toBeNull();
  });

  it('attaches a role="dialog" aria-modal panel when open flips true', () => {
    const fixture = create();
    openPalette(fixture);
    const p = panel();
    expect(p).not.toBeNull();
    expect(p?.getAttribute('role')).toBe('dialog');
    expect(p?.getAttribute('aria-modal')).toBe('true');
    expect(options().length).toBe(ITEMS.length);
  });

  it('focuses the search input on open', () => {
    const fixture = create();
    openPalette(fixture);
    expect(document.activeElement).toBe(input());
  });

  it('closes on Escape and syncs the two-way open model', () => {
    const fixture = create();
    openPalette(fixture);
    key(input(), 'Escape');
    tick();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('restores focus to the previously-focused element on close', () => {
    const fixture = create();
    const triggerBtn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    openPalette(fixture);
    expect(document.activeElement).toBe(input());

    key(input(), 'Escape');
    tick();
    expect(document.activeElement).toBe(triggerBtn);
  });

  it('toggles via the mod hotkey (Ctrl+K on non-mac)', () => {
    const fixture = create();
    fixture.componentInstance.hotkey.set('ctrl+k');
    fixture.detectChanges();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    tick();
    expect(panel()).not.toBeNull();
    expect(fixture.componentInstance.open()).toBe(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    tick();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('ignores the hotkey when disabled with an empty string', () => {
    const fixture = create();
    fixture.componentInstance.hotkey.set('');
    fixture.detectChanges();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    tick();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('filters options by label substring', () => {
    const fixture = create();
    openPalette(fixture);
    type(input()!, 'copy');
    tick();
    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('Copy');
  });

  it('filters options by keyword as well as label', () => {
    const fixture = create();
    openPalette(fixture);
    type(input()!, 'create');
    tick();
    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('New File');
  });

  it('groups results under their group headings in first-appearance order', () => {
    const fixture = create();
    openPalette(fixture);
    const headings = Array.from(container().querySelectorAll('.dm-command__group-heading')).map(
      (h) => h.textContent?.trim(),
    );
    expect(headings).toEqual(['File', 'Edit']);
  });

  it('labels each group via role=group + aria-labelledby', () => {
    const fixture = create();
    openPalette(fixture);
    const group = container().querySelector('.dm-command__group')!;
    const heading = group.querySelector('.dm-command__group-heading')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('moves the active option with ArrowDown/Up, wrapping and skipping disabled', () => {
    const fixture = create();
    openPalette(fixture);
    expect(activeOption()?.textContent).toContain('New File');

    key(input(), 'ArrowDown'); // Open File
    tick();
    expect(activeOption()?.textContent).toContain('Open File');

    key(input(), 'ArrowDown'); // Save is disabled → skip to Copy
    tick();
    expect(activeOption()?.textContent).toContain('Copy');

    key(input(), 'ArrowUp'); // back to Open File
    tick();
    expect(activeOption()?.textContent).toContain('Open File');
  });

  it('wraps from the first option to the last with ArrowUp', () => {
    const fixture = create();
    openPalette(fixture);
    key(input(), 'ArrowUp'); // wrap → Settings (last, enabled)
    tick();
    expect(activeOption()?.textContent).toContain('Settings');
  });

  it('jumps to first / last enabled with Home and End', () => {
    const fixture = create();
    openPalette(fixture);
    key(input(), 'End');
    tick();
    expect(activeOption()?.textContent).toContain('Settings');
    key(input(), 'Home');
    tick();
    expect(activeOption()?.textContent).toContain('New File');
  });

  it('activates the active option with Enter: emits selected + closes', () => {
    const fixture = create();
    openPalette(fixture);
    key(input(), 'Enter'); // New File is active
    tick();
    expect(fixture.componentInstance.selectedIds).toEqual(['new']);
    expect(panel()).toBeNull();
  });

  it('activates an option with a mouse click: emits + closes', () => {
    const fixture = create();
    openPalette(fixture);
    options()[1].click(); // Open File
    tick();
    expect(fixture.componentInstance.selectedIds).toEqual(['open']);
    expect(panel()).toBeNull();
  });

  it('does not activate a disabled option on click and stays open', () => {
    const fixture = create();
    openPalette(fixture);
    options()[2].click(); // Save (disabled)
    tick();
    expect(fixture.componentInstance.selectedIds).toEqual([]);
    expect(panel()).not.toBeNull();
  });

  it('does not activate when only a disabled item matches the query', () => {
    const fixture = create();
    openPalette(fixture);
    type(input()!, 'save');
    tick();
    expect(options().length).toBe(1);
    expect(activeOption()).toBeUndefined();
    key(input(), 'Enter');
    tick();
    expect(fixture.componentInstance.selectedIds).toEqual([]);
    expect(panel()).not.toBeNull();
  });

  it('shows the empty state when nothing matches', () => {
    const fixture = create();
    openPalette(fixture);
    type(input()!, 'zzzzz');
    tick();
    expect(options().length).toBe(0);
    const empty = container().querySelector('.dm-command__empty');
    expect(empty?.textContent).toContain('No results found');
  });

  it('wires the combobox/listbox ARIA relationships', () => {
    const fixture = create();
    openPalette(fixture);
    const inp = input()!;
    const list = container().querySelector('.dm-command__list')!;
    expect(inp.getAttribute('role')).toBe('combobox');
    expect(inp.getAttribute('aria-expanded')).toBe('true');
    expect(inp.getAttribute('aria-controls')).toBe(list.id);
    expect(list.getAttribute('role')).toBe('listbox');
    expect(options().every((o) => o.getAttribute('role') === 'option')).toBe(true);

    const active = activeOption()!;
    expect(inp.getAttribute('aria-activedescendant')).toBe(active.id);
    expect(active.getAttribute('aria-selected')).toBe('true');
  });

  it('closes on backdrop click', () => {
    const fixture = create();
    openPalette(fixture);
    backdrop()?.click();
    tick();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('honours provided COMMAND_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: COMMAND_DEFAULTS,
          useValue: {
            hotkey: 'mod+k',
            placeholder: 'Jump to…',
            emptyLabel: 'Nothing here',
            navigateHint: 'Navegar',
            selectHint: 'Elegir',
            closeHint: 'Cerrar',
          },
        },
      ],
    });
    overlayContainer = TestBed.inject(OverlayContainer);

    const fixture = TestBed.createComponent(BareHostComponent);
    fixture.detectChanges();
    tick();
    openPalette(fixture);

    expect(input()?.getAttribute('placeholder')).toBe('Jump to…');
    type(input()!, 'zzzzz');
    tick();
    expect(container().querySelector('.dm-command__empty')?.textContent).toContain('Nothing here');
  });

  describe('custom item template (dmCommandItem)', () => {
    function createTemplated(): ComponentFixture<TemplatedHostComponent> {
      const fixture = TestBed.createComponent(TemplatedHostComponent);
      fixture.detectChanges();
      tick();
      openPalette(fixture);
      return fixture;
    }

    it('renders the projected template with { $implicit, active } for every row', () => {
      createTemplated();
      const rows = options().map((o) => o.querySelector('.custom-row'));
      expect(rows.length).toBe(ITEMS.length);
      expect(rows.every((r) => r !== null)).toBe(true);
      expect(rows[0]?.textContent).toContain('new-icon · New File');
      // `active` reflects the highlighted option (first enabled on open).
      expect(rows[0]?.hasAttribute('data-custom-active')).toBe(true);
      expect(rows[1]?.hasAttribute('data-custom-active')).toBe(false);
    });

    it('replaces the default label + shortcut chip, keeping the option shell', () => {
      createTemplated();
      expect(container().querySelector('.dm-command__option-label')).toBeNull();
      expect(container().querySelector('.dm-command__option-shortcut')).toBeNull();
      // Mechanics untouched: role, ids, active highlight and aria live on the shell.
      const active = activeOption()!;
      expect(active.getAttribute('role')).toBe('option');
      expect(active.getAttribute('aria-selected')).toBe('true');
      expect(input()?.getAttribute('aria-activedescendant')).toBe(active.id);
    });

    it('keeps keyboard navigation and filtering over templated rows', () => {
      createTemplated();
      key(input(), 'ArrowDown');
      tick();
      expect(activeOption()?.querySelector('.custom-row')?.hasAttribute('data-custom-active')).toBe(
        true,
      );
      type(input()!, 'copy');
      tick();
      expect(options().length).toBe(1);
      expect(options()[0].textContent).toContain('copy-icon · Copy');
    });

    it('still emits selected and closes when a templated item is activated', () => {
      const fixture = createTemplated();
      options()[1].click(); // Open File
      tick();
      expect(fixture.componentInstance.selectedIds).toEqual(['open']);
      expect(panel()).toBeNull();
      expect(fixture.componentInstance.open()).toBe(false);
    });

    it('renders the default row markup when no template is projected', () => {
      const fixture = create();
      openPalette(fixture);
      const first = options()[0];
      expect(first.querySelector('.dm-command__option-label')?.textContent).toContain('New File');
      expect(first.querySelector('.dm-command__option-shortcut')).not.toBeNull();
      expect(container().querySelector('.custom-row')).toBeNull();
    });
  });
});
