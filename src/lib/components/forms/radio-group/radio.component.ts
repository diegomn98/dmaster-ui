import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';

import { dmUid } from '../../../core/utils/uid';
import { DmRadioGroupComponent } from './radio-group.component';

/**
 * Radio item — one option inside a `<dm-radio-group>`. Registers with the
 * parent group, mirrors its color/size, and participates in the group's
 * roving-tabindex keyboard navigation. Not meant to be used standalone.
 *
 * ```html
 * <dm-radio-group name="plan" [(value)]="plan">
 *   <dm-radio value="free">Free</dm-radio>
 *   <dm-radio value="pro">Pro</dm-radio>
 * </dm-radio-group>
 * ```
 */
@Component({
  selector: 'dm-radio',
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-color]': 'group.color()',
    '[attr.data-size]': 'group.size()',
    '[attr.data-checked]': 'checked() ? "true" : "false"',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    '[attr.tabindex]': 'tabIndex()',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DmRadioComponent implements OnInit, OnDestroy {
  protected readonly group = inject<DmRadioGroupComponent>(forwardRef(() => DmRadioGroupComponent));
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = dmUid('dm-radio');

  /** Value carried by this radio; the group compares by strict equality. */
  readonly value = input.required<unknown>();

  /** Disables just this option (combined with the group's `disabled`). */
  readonly disabled = input<boolean>(false);

  /** Id exposed for external `<label for>` — falls back to a generated one. */
  readonly inputId = input<string>('');

  protected readonly internalId = computed(() => this.inputId() || this.uid);

  /** True when this radio's value equals the group's selected value. */
  readonly checked = computed(() => this.group.value() === this.value());

  /** Combined disabled state: own input OR the group's. */
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());

  /**
   * Roving tabindex: the currently-checked radio is the group's tab stop.
   * When nothing is selected yet, the first enabled radio takes it — the
   * WAI-ARIA recommendation so the group is reachable via Tab.
   */
  readonly tabIndex = computed<number>(() => {
    if (this.isDisabled()) {
      return -1;
    }
    if (this.checked()) {
      return 0;
    }
    const radios = this.group._registeredRadios().filter((r) => !r.isDisabled());
    const hasSelection = radios.some((r) => r.checked());
    if (!hasSelection && radios[0] === this) {
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

  /** Focuses this radio's host element. */
  focus(): void {
    this.hostRef.nativeElement.focus();
  }

  /** True when the given DOM node lives inside this radio's host (roving nav). */
  contains(el: Element | null): boolean {
    return el != null && this.hostRef.nativeElement.contains(el);
  }

  protected onClick(): void {
    if (this.isDisabled()) {
      return;
    }
    this.group.select(this.value());
    this.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.group.focusNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.group.focusPrev();
        break;
      case 'Home':
        event.preventDefault();
        this.group.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.group.focusLast();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.group.select(this.value());
        break;
      default:
        break;
    }
  }
}
