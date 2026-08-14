import { Directive, ElementRef, OnInit, computed, inject, input } from '@angular/core';

import { DmPopoverComponent } from './popover.component';

/**
 * Turns any element into the click trigger of a `dm-popover`.
 *
 * ```html
 * <button [dmPopoverTrigger]="info">Details</button>
 * <dm-popover #info> … </dm-popover>
 * ```
 *
 * Wires the ARIA relationship (`aria-haspopup="dialog"`, `aria-expanded`,
 * `aria-controls`) and registers itself as the overlay origin / focus target.
 */
@Directive({
  selector: '[dmPopoverTrigger]',
  host: {
    '(click)': 'toggle()',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'dmPopoverTrigger().isOpen()',
    '[attr.aria-controls]': 'controls()',
  },
})
export class DmPopoverTriggerDirective implements OnInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The popover this element controls. */
  readonly dmPopoverTrigger = input.required<DmPopoverComponent>();

  protected readonly controls = computed(() =>
    this.dmPopoverTrigger().isOpen() ? this.dmPopoverTrigger().panelId : null,
  );

  ngOnInit(): void {
    this.dmPopoverTrigger().registerTrigger(this.elementRef);
  }

  protected toggle(): void {
    this.dmPopoverTrigger().toggle();
  }
}
