import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmAccordionComponent } from './accordion.component';

/**
 * A single collapsible panel inside a `<dm-accordion>`.
 *
 * The container owns the expansion state; the item reads it via injection
 * and asks the parent to toggle when the trigger is activated.
 *
 * ```html
 * <dm-accordion>
 *   <dm-accordion-item value="a" title="Shipping" subtitle="US only">
 *     …
 *   </dm-accordion-item>
 * </dm-accordion>
 * ```
 *
 * The header renders a plain string via `title` / `subtitle`. For rich
 * markup, project a node with the `[dm-accordion-title]` attribute — it will
 * replace the default text label:
 *
 * ```html
 * <dm-accordion-item value="a">
 *   <span dm-accordion-title>Custom <strong>markup</strong></span>
 *   …
 * </dm-accordion-item>
 * ```
 */
@Component({
  selector: 'dm-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-expanded]': "expanded() ? 'true' : 'false'",
    '[attr.data-disabled]': "isDisabled() ? '' : null",
  },
})
export class DmAccordionItemComponent {
  private readonly parent = inject(DmAccordionComponent);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = dmUid('dm-accordion-item');

  /** Stable identifier used by the parent to track expansion state. */
  readonly value = input.required<string>();

  /** Plain-text title rendered in the trigger. Ignored if `[dm-accordion-title]` is projected. */
  readonly title = input<string>('');

  /** Optional secondary line rendered under the title. */
  readonly subtitle = input<string>('');

  /** Disables just this item (the parent can also disable everything). */
  readonly disabled = input<boolean>(false);

  protected readonly headerId = `${this.uid}-header`;
  protected readonly panelId = `${this.uid}-panel`;

  protected readonly expanded = computed(() => this.parent.isExpanded(this.value()));

  protected readonly isDisabled = computed(() => this.disabled() || this.parent.disabled());

  protected onTriggerClick(): void {
    if (this.isDisabled()) {
      return;
    }
    this.parent.toggle(this.value());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        this.parent.toggle(this.value());
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveFocusTo(0);
        break;
      case 'End':
        event.preventDefault();
        this.moveFocusTo(-1);
        break;
    }
  }

  private moveFocus(delta: 1 | -1): void {
    const triggers = this.getSiblingTriggers();
    if (triggers.length === 0) {
      return;
    }
    const current = triggers.indexOf(this.hostElement.nativeElement.querySelector('button')!);
    const next = (current + delta + triggers.length) % triggers.length;
    triggers[next]?.focus();
  }

  private moveFocusTo(index: number): void {
    const triggers = this.getSiblingTriggers();
    if (triggers.length === 0) {
      return;
    }
    const idx = index < 0 ? triggers.length - 1 : index;
    triggers[idx]?.focus();
  }

  private getSiblingTriggers(): HTMLButtonElement[] {
    return Array.from(
      this.parent.hostElement.nativeElement.querySelectorAll<HTMLButtonElement>(
        'dm-accordion-item:not([data-disabled]) > .dm-accordion-item__trigger',
      ),
    );
  }
}
