import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmTabsComponent } from './tabs.component';

/**
 * Content of a single tab. Projected into `<dm-tabs>`; shown when the parent
 * `effectiveSelectedValue` matches this panel's `value`.
 *
 * ```html
 * <dm-tab-panel value="overview">…</dm-tab-panel>
 * ```
 */
@Component({
  selector: 'dm-tab-panel',
  templateUrl: './tab-panel.component.html',
  styleUrl: './tab-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tabpanel',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'tabId()',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '[attr.hidden]': 'isSelected() ? null : ""',
    '[attr.data-selected]': 'isSelected() ? "true" : "false"',
  },
})
export class DmTabPanelComponent implements OnInit, OnDestroy {
  protected readonly parent = inject<DmTabsComponent>(forwardRef(() => DmTabsComponent));

  /** Stable id, referenced by the sibling tab via `aria-controls`. */
  readonly id = dmUid('dm-tab-panel');

  /** Identifier that pairs this panel with its `<dm-tab>`. */
  readonly value = input.required<string>();

  /** True when this panel is the active one in the parent tabs. */
  readonly isSelected = computed(() => this.parent.effectiveSelectedValue() === this.value());

  /** Id of the labelling tab — `null` until the sibling tab registers. */
  protected readonly tabId = computed(() => this.parent.getTabId(this.value()));

  ngOnInit(): void {
    this.parent.registerPanel(this);
  }

  ngOnDestroy(): void {
    this.parent.unregisterPanel(this);
  }
}
