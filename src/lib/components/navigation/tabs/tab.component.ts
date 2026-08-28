import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmTabsComponent } from './tabs.component';

/**
 * A single tab trigger. Projected into `<dm-tabs>`; its `value` matches the
 * `value` of the `<dm-tab-panel>` it controls. Not meant to be used standalone.
 *
 * ```html
 * <dm-tab value="overview">Overview</dm-tab>
 * ```
 */
@Component({
  selector: 'dm-tab',
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tab',
    '[id]': 'id',
    '[attr.aria-selected]': 'isSelected() ? "true" : "false"',
    '[attr.aria-controls]': 'panelId()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '[attr.data-selected]': 'isSelected() ? "true" : "false"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DmTabComponent implements OnInit, OnDestroy {
  protected readonly parent = inject<DmTabsComponent>(forwardRef(() => DmTabsComponent));
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Stable id, referenced by the sibling panel via `aria-labelledby`. */
  readonly id = dmUid('dm-tab');

  /** Identifier that pairs this tab with its `<dm-tab-panel>`. */
  readonly value = input.required<string>();

  /** Disables the tab; keyboard navigation skips it. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** True when this tab is the active one in the parent tablist. */
  readonly isSelected = computed(() => this.parent.effectiveSelectedValue() === this.value());

  /** Id of the controlled panel — `null` until the sibling panel registers. */
  protected readonly panelId = computed(() => this.parent.getPanelId(this.value()));

  ngOnInit(): void {
    this.parent.registerTab(this);
  }

  ngOnDestroy(): void {
    this.parent.unregisterTab(this);
  }

  /** Focuses this tab's host element (used by the parent for roving nav). */
  focus(): void {
    this.hostRef.nativeElement.focus();
  }

  protected onClick(): void {
    if (this.disabled()) {
      return;
    }
    this.parent.select(this.value());
    this.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const vertical = this.parent.placement() === 'start';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        this.parent.focusNext();
        return;
      case prevKey:
        event.preventDefault();
        this.parent.focusPrev();
        return;
      case 'Home':
        event.preventDefault();
        this.parent.focusFirst();
        return;
      case 'End':
        event.preventDefault();
        this.parent.focusLast();
        return;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (!this.disabled()) {
          this.parent.select(this.value());
        }
        return;
      default:
        return;
    }
  }
}
