import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { DmToggleGroupComponent } from './toggle-group.component';

/**
 * One segment inside a `<dm-toggle-group>`. Registers with the parent group,
 * mirrors its color/size, and adapts its ARIA + keyboard behavior to the
 * group's mode (radio in single mode, pressed button in multiple mode).
 * Not meant to be used standalone.
 *
 * ```html
 * <dm-toggle-group [(value)]="view">
 *   <dm-toggle value="list">List</dm-toggle>
 *   <dm-toggle value="grid">Grid</dm-toggle>
 * </dm-toggle-group>
 * ```
 */
@Component({
  selector: 'dm-toggle',
  template: '<ng-content />',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'group.multiple() ? "button" : "radio"',
    '[attr.aria-checked]': 'group.multiple() ? null : selected()',
    '[attr.aria-pressed]': 'group.multiple() ? selected() : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.data-color]': 'group.color()',
    '[attr.data-size]': 'group.size()',
    '[attr.data-selected]': 'selected() ? "true" : "false"',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    '[attr.tabindex]': 'tabIndex()',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DmToggleComponent implements OnInit, OnDestroy {
  protected readonly group = inject<DmToggleGroupComponent>(
    forwardRef(() => DmToggleGroupComponent),
  );
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Value carried by this segment; the group compares by strict equality. */
  readonly value = input.required<unknown>();

  /** Disables just this segment (combined with the group's `disabled`). */
  readonly disabled = input<boolean>(false);

  /** Accessible label — required for icon-only segments. */
  readonly ariaLabel = input<string>('');

  /** True when this segment's value is currently selected. */
  readonly selected = computed(() => this.group.isSelected(this.value()));

  /** Combined disabled state: own input OR the group's. */
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());

  /**
   * Roving tabindex. In multiple mode every enabled segment is a tab stop
   * (independent buttons). In single mode only the selected segment is the
   * group's tab stop — or the first enabled one when nothing is selected yet.
   */
  readonly tabIndex = computed<number>(() => {
    if (this.isDisabled()) {
      return -1;
    }
    if (this.group.multiple()) {
      return 0;
    }
    if (this.selected()) {
      return 0;
    }
    const toggles = this.group._registeredToggles().filter((t) => !t.isDisabled());
    const hasSelection = toggles.some((t) => t.selected());
    if (!hasSelection && toggles[0] === this) {
      return 0;
    }
    return -1;
  });

  ngOnInit(): void {
    this.group.register(this);
  }

  ngOnDestroy(): void {
    this.group.unregister(this);
  }

  /** Focuses this segment's host element. */
  focus(): void {
    this.hostRef.nativeElement.focus();
  }

  /** True when the given DOM node lives inside this segment (roving nav). */
  contains(el: Element | null): boolean {
    return el != null && this.hostRef.nativeElement.contains(el);
  }

  protected onClick(): void {
    if (this.isDisabled()) {
      return;
    }
    this.group.activate(this.value());
    this.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.group.activate(this.value());
        break;
      // Arrow-key roving is the radio pattern — single mode only. In multiple
      // mode the segments are independent buttons reached with Tab.
      case 'ArrowDown':
      case 'ArrowRight':
        if (!this.group.multiple()) {
          event.preventDefault();
          this.group.focusNext();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        if (!this.group.multiple()) {
          event.preventDefault();
          this.group.focusPrev();
        }
        break;
      case 'Home':
        event.preventDefault();
        this.group.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.group.focusLast();
        break;
      default:
        break;
    }
  }
}
