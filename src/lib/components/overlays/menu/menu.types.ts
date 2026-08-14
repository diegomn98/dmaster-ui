import { InjectionToken } from '@angular/core';

import type { DmMenuItemComponent } from './menu-item.component';

/** Preferred placement of the panel relative to the trigger (flips when tight). */
export type DmMenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** Semantic color of a menu item. `danger` renders in `--dm-danger`. */
export type DmMenuItemColor = 'default' | 'danger';

/**
 * @internal
 * Handle the panel uses to ask its trigger to close (Escape / Tab / select).
 * The trigger owns the overlay, so the panel never disposes it directly.
 */
export interface DmMenuCloseHandle {
  close(returnFocus: boolean): void;
}

/**
 * @internal
 * Slice of the panel API consumed by projected items. Provided through a token
 * (instead of the concrete component) so `dm-menu-item` never imports
 * `DmMenuComponent` — breaking the otherwise-circular dependency.
 */
export interface DmMenuPanel {
  /** Sync the roving active item to the hovered one (moves focus). */
  _hoverItem(item: DmMenuItemComponent): void;
  /** An item was activated (keyboard or click). */
  _activateItem(): void;
}

/** @internal DI token exposing the parent panel to its projected items. */
export const DM_MENU_PANEL = new InjectionToken<DmMenuPanel>('DM_MENU_PANEL');
