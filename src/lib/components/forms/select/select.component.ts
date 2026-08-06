import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { SELECT_DEFAULTS } from './select.tokens';
import { DmSelectColor, DmSelectItem, DmSelectRadius, DmSelectVariant } from './select.types';

/**
 * Single-select dropdown with a HeroUI-style color × variant API.
 *
 * ```html
 * <dm-select
 *   label="Country"
 *   placeholder="Choose one"
 *   [items]="countries"
 *   [(value)]="country"
 * />
 * ```
 *
 * The panel is rendered in a CDK overlay anchored to the trigger, matches
 * its width, and closes on outside click / Escape / selection. Fully
 * keyboard-driven and wired up as a combobox for assistive technology.
 */
@Component({
  selector: 'dm-select',
  imports: [OverlayModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmSelectComponent),
      multi: true,
    },
  ],
})
export class DmSelectComponent<T = unknown> implements ControlValueAccessor {
  private readonly defaults = inject(SELECT_DEFAULTS);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  protected readonly uid = dmUid('dm-select');

  // ---- Inputs --------------------------------------------------------------
  /** Items to render in the panel. */
  readonly items = input<DmSelectItem<T>[]>([]);

  /** Two-way value. */
  readonly value = model<T | null>(null);

  /** Visible label above the trigger. */
  readonly label = input<string>('');

  /** Text shown while no item is selected. */
  readonly placeholder = input<string>('');

  /** Help text below the trigger. */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the trigger. */
  readonly disabled = input<boolean>(false);

  /** Shows the required marker next to the label. */
  readonly required = input<boolean>(false);

  /** Semantic color for focus ring and selected item highlight. */
  readonly color = input<DmSelectColor>(this.defaults.color);

  /** Visual variant of the trigger surface. */
  readonly variant = input<DmSelectVariant>(this.defaults.variant);

  /** Trigger height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding. */
  readonly radius = input<DmSelectRadius>(this.defaults.radius);

  /** ARIA label for triggers without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** Shows an × button to clear the selection. Keyboard: Delete / Backspace. */
  readonly clearable = input<boolean>(false);

  /** ARIA label for the clear button (localise when the consumer app is multilingual). */
  readonly clearAriaLabel = input<string>('Clear');

  // ---- State ---------------------------------------------------------------
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly typeaheadBuffer = signal('');
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly selectedItem = computed<DmSelectItem<T> | null>(() => {
    const v = this.value();
    if (v === null || v === undefined) {
      return null;
    }
    return this.items().find((item) => item.value === v) ?? null;
  });

  protected readonly displayText = computed(() => this.selectedItem()?.label ?? this.placeholder());

  protected readonly hasPlaceholder = computed(() => !this.selectedItem());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.value() !== null && !this.isDisabled(),
  );

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.description()) {
      return this.hintId;
    }
    return null;
  });

  protected readonly activeOptionId = computed(() => {
    const i = this.activeIndex();
    return i >= 0 && this.open() ? `${this.uid}-option-${i}` : null;
  });

  protected readonly overlayPositions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -6,
    },
  ];

  protected readonly scrollStrategy = this.scrollStrategies.reposition();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('triggerEl');
  private readonly listboxRef = viewChild<ElementRef<HTMLUListElement>>('listboxEl');

  protected triggerWidth = 0;

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // Reset the typeahead buffer when the panel closes, and scroll the active
    // option into view whenever it changes.
    effect(() => {
      if (!this.open()) {
        this.typeaheadBuffer.set('');
        clearTimeout(this.typeaheadTimer);
      }
    });

    effect(() => {
      const i = this.activeIndex();
      if (!this.open() || i < 0) {
        return;
      }
      queueMicrotask(() => {
        const el = this.listboxRef()?.nativeElement.children.item(i) as HTMLElement | null;
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.typeaheadTimer));
  }

  // ---- Interaction ---------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected openPanel(): void {
    if (this.open() || this.isDisabled()) {
      return;
    }
    this.triggerWidth = this.triggerRef().nativeElement.offsetWidth;
    // Start focus on the selected item, or on the first non-disabled one.
    const selectedIdx = this.items().findIndex((it) => it.value === this.value());
    this.activeIndex.set(selectedIdx >= 0 ? selectedIdx : this.firstEnabledIndex());
    this.open.set(true);
  }

  protected close(returnFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.activeIndex.set(-1);
    this.onTouched();
    if (returnFocus) {
      this.triggerRef().nativeElement.focus();
    }
  }

  protected selectAt(index: number): void {
    const item = this.items()[index];
    if (!item || item.disabled) {
      return;
    }
    this.value.set(item.value);
    this.onChange(item.value);
    this.close();
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doClear();
  }

  private doClear(): void {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
  }

  protected onOptionClick(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.selectAt(index);
  }

  protected onOptionHover(index: number): void {
    if (!this.items()[index]?.disabled) {
      this.activeIndex.set(index);
    }
  }

  protected onTriggerBlur(): void {
    // Overlay-outside click closes via backdrop; only mark as touched here.
    if (!this.open()) {
      this.onTouched();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const key = event.key;

    if (!this.open()) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openPanel();
      } else if ((key === 'Delete' || key === 'Backspace') && this.showClearButton()) {
        event.preventDefault();
        this.doClear();
      } else if (key.length === 1 && /\S/.test(key)) {
        // Type-to-select while closed: open + typeahead.
        this.openPanel();
        this.typeahead(key);
      }
      return;
    }

    switch (key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectAt(this.activeIndex());
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
        break;
      case 'Tab':
        // Do not swallow tab; close and let focus leave naturally.
        this.close(false);
        break;
      default:
        if (key.length === 1 && /\S/.test(key)) {
          event.preventDefault();
          this.typeahead(key);
        }
    }
  }

  private moveActive(delta: 1 | -1): void {
    const total = this.items().length;
    if (!total) {
      return;
    }
    let i = this.activeIndex();
    for (let step = 0; step < total; step++) {
      i = (i + delta + total) % total;
      if (!this.items()[i].disabled) {
        this.activeIndex.set(i);
        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    return this.items().findIndex((it) => !it.disabled);
  }

  private lastEnabledIndex(): number {
    for (let i = this.items().length - 1; i >= 0; i--) {
      if (!this.items()[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  private typeahead(char: string): void {
    const buffer = (this.typeaheadBuffer() + char).toLowerCase();
    this.typeaheadBuffer.set(buffer);
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => this.typeaheadBuffer.set(''), 600);

    const items = this.items();
    const match = items.findIndex(
      (item) => !item.disabled && item.label.toLowerCase().startsWith(buffer),
    );
    if (match >= 0) {
      this.activeIndex.set(match);
    }
  }
}
