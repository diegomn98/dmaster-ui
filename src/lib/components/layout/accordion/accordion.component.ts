import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';

import { ACCORDION_DEFAULTS } from './accordion.tokens';
import { DmAccordionSelectionMode, DmAccordionVariant } from './accordion.types';

/**
 * Container that groups collapsible `dm-accordion-item` panels and owns the
 * expansion state. Four variants: `light` (default, flat separators),
 * `bordered` (single card), `shadow` (single card with soft shadow),
 * `splitted` (each item is its own card).
 *
 * ```html
 * <dm-accordion [(expandedValues)]="open">
 *   <dm-accordion-item value="a" title="First">…</dm-accordion-item>
 *   <dm-accordion-item value="b" title="Second">…</dm-accordion-item>
 * </dm-accordion>
 *
 * <dm-accordion selectionMode="multiple" variant="splitted">…</dm-accordion>
 * ```
 */
@Component({
  selector: 'dm-accordion',
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
    role: 'presentation',
  },
})
export class DmAccordionComponent {
  private readonly defaults = inject(ACCORDION_DEFAULTS);

  /** Exposed to the child items so they can locate sibling triggers for keyboard nav. */
  readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Whether one (`'single'`) or many (`'multiple'`) items can be expanded at once. */
  readonly selectionMode = input<DmAccordionSelectionMode>(this.defaults.selectionMode);

  /** Two-way array of currently expanded item `value`s. */
  readonly expandedValues = model<string[]>([]);

  /** Visual variant of the accordion surface. */
  readonly variant = input<DmAccordionVariant>(this.defaults.variant);

  /** Disables every child item (overrides individual `disabled` inputs). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** ARIA label for the region. */
  readonly ariaLabel = input<string>('');

  /** Returns whether the given item is currently expanded. */
  isExpanded(value: string): boolean {
    return this.expandedValues().includes(value);
  }

  /** Opens the item if closed, closes it if open. Respects `selectionMode`. */
  toggle(value: string): void {
    if (this.isExpanded(value)) {
      this.collapse(value);
    } else {
      this.expand(value);
    }
  }

  /** Opens the item. In `single` mode, collapses whatever was open before. */
  expand(value: string): void {
    if (this.isExpanded(value)) {
      return;
    }
    const next = this.selectionMode() === 'single' ? [value] : [...this.expandedValues(), value];
    this.expandedValues.set(next);
  }

  /** Closes the item. */
  collapse(value: string): void {
    if (!this.isExpanded(value)) {
      return;
    }
    this.expandedValues.set(this.expandedValues().filter((v) => v !== value));
  }
}
