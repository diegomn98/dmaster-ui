import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { TABS_DEFAULTS } from './tabs.tokens';
import {
  DmTabsColor,
  DmTabsPlacement,
  DmTabsRadius,
  DmTabsSize,
  DmTabsVariant,
} from './tabs.types';
import type { DmTabComponent } from './tab.component';
import type { DmTabPanelComponent } from './tab-panel.component';

/**
 * Composite tabs container. Owns the selection state, the tablist ARIA
 * wiring and the roving-tabindex keyboard navigation. Children `<dm-tab>`
 * triggers pair with `<dm-tab-panel>` bodies by matching `value`.
 *
 * ```html
 * <dm-tabs [(selectedValue)]="tab" color="primary" variant="solid" ariaLabel="Sections">
 *   <dm-tab value="overview">Overview</dm-tab>
 *   <dm-tab value="pricing">Pricing</dm-tab>
 *
 *   <dm-tab-panel value="overview">…</dm-tab-panel>
 *   <dm-tab-panel value="pricing">…</dm-tab-panel>
 * </dm-tabs>
 * ```
 */
@Component({
  selector: 'dm-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmTabsComponent {
  private readonly defaults = inject(TABS_DEFAULTS);
  private readonly destroyRef = inject(DestroyRef);

  /** The `.dm-tabs__list` element — measured to position the sliding indicator. */
  private readonly listRef = viewChild<ElementRef<HTMLElement>>('list');

  /** Value of the active tab. Two-way: `[(selectedValue)]`. */
  readonly selectedValue = model<string | undefined>(undefined);

  /** Semantic color. */
  readonly color = input<DmTabsColor>(this.defaults.color);

  /** Visual variant. */
  readonly variant = input<DmTabsVariant>(this.defaults.variant);

  /** Size scale (32/40/48px tabs). */
  readonly size = input<DmTabsSize>(this.defaults.size);

  /** Corner rounding. Ignored by the `underlined` variant. */
  readonly radius = input<DmTabsRadius>(this.defaults.radius);

  /** Disables the whole tablist. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Where the tablist sits. `start` renders the tablist vertically. */
  readonly placement = input<DmTabsPlacement>(this.defaults.placement);

  /** Stretch tabs to share the full width equally. */
  readonly fullWidth = input(this.defaults.fullWidth, { transform: booleanAttribute });

  /** Draw a separator rule under the tablist (light / underlined variants). */
  readonly divider = input(this.defaults.divider, { transform: booleanAttribute });

  /** Accessible label for the tablist. */
  readonly ariaLabel = input<string>('');

  /** Bumped by the ResizeObserver so the indicator re-measures on resize. */
  private readonly resizeTick = signal(0);

  constructor() {
    // Re-position the sliding indicator after every render that could move the
    // active tab: selection, variant/size/radius/placement/full-width changes,
    // tab (un)registration, or a container resize.
    afterRenderEffect(() => {
      this.effectiveSelectedValue();
      this.variant();
      this.size();
      this.radius();
      this.placement();
      this.fullWidth();
      this.divider();
      this._tabs();
      this.resizeTick();
      this.positionIndicator();
    });

    // Observe the tablist so tab widths that change without a signal (font load,
    // container resize) keep the indicator aligned.
    afterNextRender(() => {
      const list = this.listRef()?.nativeElement;
      if (!list || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => this.resizeTick.update((n) => n + 1));
      ro.observe(list);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  /** Measures the active tab and writes indicator geometry + overflow state. */
  private positionIndicator(): void {
    const list = this.listRef()?.nativeElement;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-selected="true"]');
    const style = list.style;
    if (!active) {
      style.setProperty('--dm-tabs-ind-o', '0');
    } else {
      // Position in the list's own (un-scrolled) content coordinates so the
      // indicator, which scrolls with the content, stays aligned. Subtract the
      // list border because absolute positioning originates at the padding box.
      const listRect = list.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      const cs = getComputedStyle(list);
      const borderLeft = parseFloat(cs.borderLeftWidth) || 0;
      const borderTop = parseFloat(cs.borderTopWidth) || 0;
      const x = rect.left - listRect.left - borderLeft + list.scrollLeft;
      const y = rect.top - listRect.top - borderTop + list.scrollTop;
      style.setProperty('--dm-tabs-ind-x', `${x}px`);
      style.setProperty('--dm-tabs-ind-y', `${y}px`);
      style.setProperty('--dm-tabs-ind-w', `${rect.width}px`);
      style.setProperty('--dm-tabs-ind-h', `${rect.height}px`);
      style.setProperty('--dm-tabs-ind-o', '1');
    }
    // Horizontal overflow → enable the edge fade mask.
    if (list.scrollWidth > list.clientWidth + 1) {
      list.setAttribute('data-overflow', '');
    } else {
      list.removeAttribute('data-overflow');
    }
  }

  /** Registered `<dm-tab>` children. @internal */
  readonly _tabs = signal<DmTabComponent[]>([]);

  /** Registered `<dm-tab-panel>` children. @internal */
  readonly _panels = signal<DmTabPanelComponent[]>([]);

  /**
   * The value actually driving the UI: what `selectedValue` points to if it
   * matches an enabled tab, otherwise the first enabled tab. Keeps the
   * component functional before the consumer wires `[(selectedValue)]`.
   */
  readonly effectiveSelectedValue = computed<string | undefined>(() => {
    const explicit = this.selectedValue();
    const tabs = this._tabs();
    if (explicit !== undefined && tabs.some((tab) => tab.value() === explicit && !tab.disabled())) {
      return explicit;
    }
    return tabs.find((tab) => !tab.disabled())?.value();
  });

  /** @internal */
  registerTab(tab: DmTabComponent): void {
    this._tabs.update((list) => [...list, tab]);
  }

  /** @internal */
  unregisterTab(tab: DmTabComponent): void {
    this._tabs.update((list) => list.filter((t) => t !== tab));
  }

  /** @internal */
  registerPanel(panel: DmTabPanelComponent): void {
    this._panels.update((list) => [...list, panel]);
  }

  /** @internal */
  unregisterPanel(panel: DmTabPanelComponent): void {
    this._panels.update((list) => list.filter((p) => p !== panel));
  }

  /** @internal ARIA wiring: tab value → id of the panel it controls. */
  getPanelId(value: string): string | null {
    return this._panels().find((p) => p.value() === value)?.id ?? null;
  }

  /** @internal ARIA wiring: panel value → id of the tab that labels it. */
  getTabId(value: string): string | null {
    return this._tabs().find((t) => t.value() === value)?.id ?? null;
  }

  /** Activates the tab with the given value (no-op if it — or the tablist — is disabled). */
  select(value: string): void {
    if (this.disabled()) {
      return;
    }
    const tab = this._tabs().find((t) => t.value() === value);
    if (!tab || tab.disabled()) {
      return;
    }
    this.selectedValue.set(value);
  }

  focusNext(): void {
    this.moveFocus(1);
  }

  focusPrev(): void {
    this.moveFocus(-1);
  }

  focusFirst(): void {
    this.activateAndFocus(this._tabs().find((t) => !t.disabled()));
  }

  focusLast(): void {
    const enabled = this._tabs().filter((t) => !t.disabled());
    this.activateAndFocus(enabled[enabled.length - 1]);
  }

  private moveFocus(delta: 1 | -1): void {
    const enabled = this._tabs().filter((t) => !t.disabled());
    if (enabled.length === 0) {
      return;
    }
    const current = this.effectiveSelectedValue();
    const idx = enabled.findIndex((t) => t.value() === current);
    // If nothing matches (e.g. current disabled), start at 0 going right / last going left.
    const base = idx === -1 ? (delta === 1 ? -1 : 0) : idx;
    const nextIdx = (((base + delta) % enabled.length) + enabled.length) % enabled.length;
    this.activateAndFocus(enabled[nextIdx]);
  }

  private activateAndFocus(tab: DmTabComponent | undefined): void {
    if (!tab || this.disabled()) {
      return;
    }
    this.selectedValue.set(tab.value());
    tab.focus();
  }
}
