import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmKbdComponent } from '../../primitives/kbd';
import { COMMAND_DEFAULTS } from './command.tokens';
import { DmCommandGroup, DmCommandItem } from './command.types';

/**
 * Command palette (⌘K) — a centered modal with a search box over a flat, grouped
 * list of actions. Declared once (typically at the app root) and driven by the
 * two-way `open` model; a document-level hotkey toggles it from anywhere.
 *
 * ```html
 * <dm-command
 *   [items]="commands"
 *   [(open)]="paletteOpen"
 *   (selected)="run($event)"
 * />
 * ```
 *
 * The panel is portalised into a CDK overlay with a blurred backdrop and a
 * blocking scroll strategy; focus is trapped inside and restored to the
 * previously-focused element on close. Fully keyboard-driven as a
 * combobox + listbox: focus stays in the input while `aria-activedescendant`
 * tracks the highlighted option.
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Component({
  selector: 'dm-command',
  imports: [A11yModule, NgTemplateOutlet, DmKbdComponent],
  templateUrl: './command.component.html',
  styleUrl: './command.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmCommandComponent {
  private readonly defaults = inject(COMMAND_DEFAULTS);
  private readonly document = inject(DOCUMENT);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly uid = dmUid('dm-command');

  // ---- Inputs --------------------------------------------------------------
  /** Actions to render. Grouped by `group`, filtered by the search query. */
  readonly items = input.required<DmCommandItem[]>();

  /** Two-way open state. Toggle it, or let the hotkey / backdrop drive it. */
  readonly open = model<boolean>(false);

  /** Global toggle hotkey. `mod` = ⌘ on macOS / Ctrl elsewhere. `''` disables. */
  readonly hotkey = input<string>(this.defaults.hotkey);

  /** Placeholder inside the search input. */
  readonly placeholder = input<string>(this.defaults.placeholder);

  /** Message shown when the query matches nothing. */
  readonly emptyLabel = input<string>(this.defaults.emptyLabel);

  /** Accessible name for the modal dialog. */
  readonly ariaLabel = input<string>('Command palette');

  // ---- Outputs -------------------------------------------------------------
  /** Emitted when an enabled item is activated (Enter or click). The host acts. */
  readonly selected = output<DmCommandItem>();

  // ---- Ids -----------------------------------------------------------------
  protected readonly listId = `${this.uid}-list`;
  protected readonly inputId = `${this.uid}-input`;

  // ---- Footer hint copy (app-wide via provideCommandDefaults) --------------
  protected readonly navigateHint = this.defaults.navigateHint;
  protected readonly selectHint = this.defaults.selectHint;
  protected readonly closeHint = this.defaults.closeHint;

  // ---- State ---------------------------------------------------------------
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);

  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panelTpl');

  private overlayRef: OverlayRef | null = null;
  private portal: TemplatePortal | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private hotkeyListener: ((event: KeyboardEvent) => void) | null = null;

  /** Flat, filtered list in render order — the source of truth for navigation. */
  protected readonly filtered = computed<DmCommandItem[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (!q) {
      return all;
    }
    return all.filter((item) => {
      const haystack = [item.label, ...(item.keywords ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  });

  /** Filtered items bucketed by group, preserving first-appearance order. */
  protected readonly groups = computed<DmCommandGroup[]>(() => {
    const order: string[] = [];
    const buckets = new Map<string, { item: DmCommandItem; index: number }[]>();
    this.filtered().forEach((item, index) => {
      const key = item.group ?? '';
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = [];
        buckets.set(key, bucket);
        order.push(key);
      }
      bucket.push({ item, index });
    });
    return order.map((key) => ({
      key,
      heading: key || null,
      entries: buckets.get(key) ?? [],
    }));
  });

  protected readonly isEmpty = computed(() => this.filtered().length === 0);

  protected readonly activeOptionId = computed(() => {
    const i = this.activeIndex();
    return this.open() && i >= 0 ? this.optionId(i) : null;
  });

  constructor() {
    // Drive the overlay from the two-way `open` model. `untracked` keeps the
    // effect depending on `open()` alone — never on the panel-body signals.
    effect(() => {
      const shouldOpen = this.open();
      untracked(() => (shouldOpen ? this.attach() : this.detach()));
    });

    // Keep the highlighted option scrolled into view.
    effect(() => {
      const i = this.activeIndex();
      if (!this.open() || i < 0) {
        return;
      }
      queueMicrotask(() => this.scrollActiveIntoView(i));
    });

    // Register the document-level hotkey — browser only (afterNextRender never
    // runs during SSR prerender), cleaned up on destroy.
    afterNextRender(() => this.registerHotkey());

    this.destroyRef.onDestroy(() => {
      this.unregisterHotkey();
      this.detach();
    });
  }

  // ---- Overlay lifecycle ---------------------------------------------------
  private attach(): void {
    if (this.overlayRef || !this.document.defaultView) {
      return;
    }
    this.previouslyFocused = this.document.activeElement as HTMLElement | null;
    this.query.set('');
    this.activeIndex.set(this.firstEnabledIndex());

    const positionStrategy = this.overlay.position().global().centerHorizontally().top('20vh');
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'dm-command-backdrop',
      panelClass: 'dm-command-pane',
      disposeOnNavigation: true,
    });

    this.portal ??= new TemplatePortal(this.panelTpl(), this.viewContainerRef);
    this.overlayRef.attach(this.portal);
    this.overlayRef.backdropClick().subscribe(() => this.setOpen(false));

    // Focus the input straight off the freshly-attached DOM (viewChild queries
    // only settle on the next CD, so query the overlay element directly).
    const input =
      this.overlayRef.overlayElement.querySelector<HTMLInputElement>('.dm-command__input');
    input?.focus();
  }

  private detach(): void {
    if (!this.overlayRef) {
      this.activeIndex.set(-1);
      return;
    }
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.activeIndex.set(-1);
    this.query.set('');
    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    target?.focus?.();
  }

  // ---- Interaction ---------------------------------------------------------
  private setOpen(value: boolean): void {
    this.open.set(value);
  }

  /** Close the palette — bound to the header ESC button. */
  protected close(): void {
    this.setOpen(false);
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.setOpen(false);
        break;
      case 'Enter':
        event.preventDefault();
        this.activateAt(this.activeIndex());
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
    }
  }

  protected onOptionClick(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.activateAt(index);
  }

  protected onOptionHover(index: number): void {
    if (!this.filtered()[index]?.disabled) {
      this.activeIndex.set(index);
    }
  }

  private activateAt(index: number): void {
    const item = this.filtered()[index];
    if (!item || item.disabled) {
      return;
    }
    this.selected.emit(item);
    this.setOpen(false);
  }

  // ---- Navigation helpers --------------------------------------------------
  private moveActive(delta: 1 | -1): void {
    const items = this.filtered();
    const total = items.length;
    if (!total) {
      return;
    }
    let i = this.activeIndex();
    for (let step = 0; step < total; step++) {
      i = (i + delta + total) % total;
      if (!items[i].disabled) {
        this.activeIndex.set(i);
        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    return this.filtered().findIndex((item) => !item.disabled);
  }

  private lastEnabledIndex(): number {
    const items = this.filtered();
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  protected optionId(index: number): string {
    return `${this.uid}-option-${index}`;
  }

  protected groupHeadingId(key: string): string {
    return `${this.uid}-group-${key || 'default'}`;
  }

  private scrollActiveIntoView(index: number): void {
    const el = this.overlayRef?.overlayElement.querySelector<HTMLElement>(
      `#${CSS.escape(this.optionId(index))}`,
    );
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }

  // ---- Hotkey --------------------------------------------------------------
  private registerHotkey(): void {
    if (!this.document.defaultView) {
      return;
    }
    this.hotkeyListener = (event: KeyboardEvent) => {
      const combo = this.hotkey();
      if (combo && this.matchesHotkey(event, combo)) {
        event.preventDefault();
        this.setOpen(!this.open());
      }
    };
    this.document.addEventListener('keydown', this.hotkeyListener);
  }

  private unregisterHotkey(): void {
    if (this.hotkeyListener) {
      this.document.removeEventListener('keydown', this.hotkeyListener);
      this.hotkeyListener = null;
    }
  }

  private matchesHotkey(event: KeyboardEvent, combo: string): boolean {
    const parts = combo
      .toLowerCase()
      .split('+')
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) {
      return false;
    }
    const key = parts[parts.length - 1];
    const mods = new Set(parts.slice(0, -1));
    const mac = this.isMac();
    const wantMeta =
      mods.has('meta') || mods.has('cmd') || mods.has('command') || (mods.has('mod') && mac);
    const wantCtrl = mods.has('ctrl') || mods.has('control') || (mods.has('mod') && !mac);
    const wantShift = mods.has('shift');
    const wantAlt = mods.has('alt') || mods.has('option');
    return (
      event.metaKey === wantMeta &&
      event.ctrlKey === wantCtrl &&
      event.shiftKey === wantShift &&
      event.altKey === wantAlt &&
      event.key.toLowerCase() === key
    );
  }

  private isMac(): boolean {
    const nav = this.document.defaultView?.navigator as
      (Navigator & { userAgentData?: { platform?: string } }) | undefined;
    if (!nav) {
      return false;
    }
    const platform = nav.userAgentData?.platform || nav.platform || '';
    return /mac|iphone|ipad|ipod/i.test(platform);
  }
}
