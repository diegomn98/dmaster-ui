import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  Signal,
  TemplateRef,
  ViewContainerRef,
  contentChildren,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { dmUid } from '../../../core/utils/uid';
import { DmMenuItemComponent } from './menu-item.component';
import { MENU_DEFAULTS } from './menu.tokens';
import { DM_MENU_PANEL, DmMenuCloseHandle, DmMenuPanel, DmMenuPlacement } from './menu.types';

/**
 * Dropdown menu following the WAI-ARIA menu pattern. The panel is declared as
 * an `<ng-template>` and portalised into a CDK overlay by
 * {@link DmMenuTriggerDirective}; the menu itself owns the `role="menu"`
 * surface, the `FocusKeyManager` roving-focus navigation and the open/close
 * lifecycle notifications.
 *
 * ```html
 * <button [dmMenuTrigger]="actions">Actions</button>
 * <dm-menu #actions ariaLabel="Row actions">
 *   <dm-menu-item shortcut="⌘E" (selected)="edit()">Edit</dm-menu-item>
 *   <dm-menu-divider />
 *   <dm-menu-item color="danger" (selected)="remove()">Delete</dm-menu-item>
 * </dm-menu>
 * ```
 */
@Component({
  selector: 'dm-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: DM_MENU_PANEL, useExisting: forwardRef(() => DmMenuComponent) }],
})
export class DmMenuComponent implements DmMenuPanel {
  private readonly defaults = inject(MENU_DEFAULTS);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  /** Preferred placement of the panel; flips automatically when space is tight. */
  readonly placement = input<DmMenuPlacement>(this.defaults.placement);

  /** Close the menu when an item is activated. */
  readonly closeOnSelect = input<boolean>(this.defaults.closeOnSelect);

  /** Accessible label for the `role="menu"` surface. */
  readonly ariaLabel = input<string>('');

  /** Emitted after the panel opens. */
  readonly opened = output<void>();

  /** Emitted after the panel closes. */
  readonly closed = output<void>();

  /** @internal Stable id; the trigger points `aria-controls` here. */
  readonly panelId = dmUid('dm-menu');

  /** @internal Whether the panel is currently attached. */
  readonly isOpen = signal(false);

  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panelTpl');

  /** Projected items, in DOM order (flattened across sections). */
  private readonly items = contentChildren(DmMenuItemComponent, { descendants: true });

  private keyManager?: FocusKeyManager<DmMenuItemComponent>;
  private portal?: TemplatePortal;
  private trigger: DmMenuCloseHandle | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.keyManager?.destroy());
  }

  /** @internal Lazily-built template portal for the panel. */
  _portal(): TemplatePortal {
    this.portal ??= new TemplatePortal(this.panelTpl(), this.viewContainerRef);
    return this.portal;
  }

  /** @internal Called by the trigger right after the panel is attached. */
  _markOpened(trigger: DmMenuCloseHandle): void {
    this.trigger = trigger;
    this.isOpen.set(true);
    this.opened.emit();
  }

  /** @internal Called by the trigger after the panel is disposed. */
  _markClosed(): void {
    // Drop the active pointer without moving focus (the overlay is already gone).
    this.keyManager?.updateActiveItem(-1);
    this.syncActive();
    this.trigger = null;
    this.isOpen.set(false);
    this.closed.emit();
  }

  /** @internal Focus the first enabled item (keyboard / ArrowDown open). */
  _focusFirstItem(): void {
    this.ensureKeyManager().setFirstItemActive();
  }

  /** @internal Focus the last enabled item (ArrowUp open). */
  _focusLastItem(): void {
    this.ensureKeyManager().setLastItemActive();
  }

  /** @internal Build the key manager ahead of a pointer open (no active item). */
  _prepareKeyManager(): void {
    this.ensureKeyManager();
  }

  /** @internal {@link DmMenuPanel}: move the roving focus to the hovered item. */
  _hoverItem(item: DmMenuItemComponent): void {
    this.ensureKeyManager().setActiveItem(item);
  }

  /** @internal {@link DmMenuPanel}: an item was activated. */
  _activateItem(): void {
    if (this.closeOnSelect()) {
      this.trigger?.close(true);
    }
  }

  /** Keyboard handling while the panel (or one of its items) has focus. */
  protected onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.trigger?.close(true);
        return;
      case 'Tab':
        // Close and hand focus back to the trigger rather than tabbing into the
        // detached overlay.
        event.preventDefault();
        this.trigger?.close(true);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.keyManager?.activeItem?.activate();
        return;
      default:
        // Arrows, Home/End and type-ahead are all handled by the key manager.
        this.keyManager?.onKeydown(event);
    }
  }

  private ensureKeyManager(): FocusKeyManager<DmMenuItemComponent> {
    if (!this.keyManager) {
      // `disabled` is a signal input, which structurally clashes with
      // FocusableOption's optional boolean `disabled`. `skipPredicate` reads the
      // signal explicitly below, so the cast only bridges that nominal gap.
      const items = this.items as unknown as Signal<
        readonly (FocusableOption & DmMenuItemComponent)[]
      >;
      this.keyManager = new FocusKeyManager(items, this.injector)
        .withWrap()
        .withTypeAhead()
        .withHomeAndEnd()
        .skipPredicate((item) => item.disabled());
      this.keyManager.change
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncActive());
    }
    return this.keyManager;
  }

  private syncActive(): void {
    const active = this.keyManager?.activeItem ?? null;
    for (const item of this.items()) {
      item._setActive(item === active);
    }
  }
}
