import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { DM_MENU_PANEL, DmMenuItemColor } from './menu.types';

/**
 * A single actionable row inside a `<dm-menu>`. Renders a
 * `role="menuitem"` button and participates in the parent's roving-focus
 * keyboard navigation: it structurally satisfies CDK's `FocusableOption`
 * (`focus()` + `getLabel()`) without a nominal `implements`, because the
 * signal-based `disabled` input clashes with the interface's optional boolean.
 *
 * ```html
 * <dm-menu-item shortcut="⌘C" (selected)="copy()">
 *   <svg dmMenuItemStart>…</svg>
 *   Copy
 * </dm-menu-item>
 * ```
 */
@Component({
  selector: 'dm-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmMenuItemComponent {
  private readonly panel = inject(DM_MENU_PANEL);
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private readonly labelRef = viewChild<ElementRef<HTMLElement>>('label');

  /** Disables the item: skipped by keyboard navigation and not activatable. */
  readonly disabled = input<boolean>(false);

  /** Semantic color. `danger` tints the row and its hover state red. */
  readonly color = input<DmMenuItemColor>('default');

  /** Optional keyboard-shortcut hint shown right-aligned in a `<kbd>`. */
  readonly shortcut = input<string>();

  /** Emitted when the item is activated (Enter / Space / click). */
  readonly selected = output<void>();

  /** @internal Roving-active state, driven by the parent's key manager. */
  readonly active = signal(false);

  /** `FocusableOption`: focus the underlying button. */
  focus(): void {
    this.button().nativeElement.focus();
  }

  /** `FocusableOption`: label used for the menu's type-ahead. */
  getLabel(): string {
    return (this.labelRef()?.nativeElement.textContent ?? '').trim();
  }

  /** @internal Set by the parent when this becomes the active (focused) item. */
  _setActive(value: boolean): void {
    this.active.set(value);
  }

  /** @internal Activate the item — emits `selected` and notifies the panel. */
  activate(): void {
    if (this.disabled()) {
      return;
    }
    this.selected.emit();
    this.panel._activateItem();
  }

  protected onClick(): void {
    this.activate();
  }

  protected onMouseEnter(): void {
    if (this.disabled()) {
      return;
    }
    this.panel._hoverItem(this);
  }
}
