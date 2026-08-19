import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
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

import { DmBadgeComponent } from '../../primitives/badge';
import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { SELECT_DEFAULTS } from './select.tokens';
import {
  DmSelectColor,
  DmSelectItem,
  DmSelectOptionOrGroup,
  DmSelectRadius,
  DmSelectVariant,
  isDmSelectGroup,
} from './select.types';

/** A normalized option: the item plus its effective disabled state and group. */
interface NormalizedOption<T> {
  item: DmSelectItem<T>;
  disabled: boolean;
  groupLabel?: string;
}

/** A row rendered in the panel: a non-selectable group header or an option. */
type SelectRow<T> =
  | { kind: 'group'; key: string; label: string }
  | { kind: 'option'; key: string; option: NormalizedOption<T>; index: number };

/**
 * Dropdown with a color × variant API. Supports single and multiple selection,
 * an optional inline filter, option groups, and select-all / clear-all.
 *
 * ```html
 * <!-- single -->
 * <dm-select label="Country" [items]="countries" [(value)]="country" />
 *
 * <!-- multiple, filterable, grouped -->
 * <dm-select
 *   label="Skills"
 *   multiple
 *   filterable
 *   [items]="groupedSkills"
 *   [(values)]="skills"
 * />
 * ```
 *
 * The panel renders in a CDK overlay anchored to the trigger, matches its
 * width, and closes on outside click / Escape (single mode also closes on
 * selection). Fully keyboard-driven and wired up as a combobox for assistive
 * technology.
 */
@Component({
  selector: 'dm-select',
  imports: [OverlayModule, DmBadgeComponent],
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
  /** Items to render in the panel — flat options or `{ label, items }` groups. */
  readonly items = input<DmSelectOptionOrGroup<T>[]>([]);

  /** Selects more than one value; chips replace the single-value label. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Two-way value for single-select mode. */
  readonly value = model<T | null>(null);

  /** Two-way values for multiple-select mode. */
  readonly values = model<T[]>([]);

  /** Shows an inline search box in the panel that filters the options. */
  readonly filterable = input(false, { transform: booleanAttribute });

  /** Placeholder for the inline filter input. */
  readonly filterPlaceholder = input<string>('');

  /** Message shown when the filter matches no options (hidden if empty). */
  readonly noResultsLabel = input<string>('');

  /** Label for the "select all" action (multiple mode; hidden if empty). */
  readonly selectAllLabel = input<string>('');

  /** Label for the "clear all" action (multiple mode; hidden if empty). */
  readonly clearAllLabel = input<string>('');

  /** Visible label above the trigger. */
  readonly label = input<string>('');

  /** Text shown while nothing is selected. */
  readonly placeholder = input<string>('');

  /** Help text below the trigger. */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the trigger. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows the required marker next to the label. */
  readonly required = input(false, { transform: booleanAttribute });

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
  readonly clearable = input(false, { transform: booleanAttribute });

  /** ARIA label for the clear button (localise in multilingual apps). */
  readonly clearAriaLabel = input<string>('Clear');

  /** ARIA label prefix for per-chip remove buttons (localise in multilingual apps). */
  readonly removeAriaLabel = input<string>('Remove');

  // ---- State ---------------------------------------------------------------
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');
  protected readonly typeaheadBuffer = signal('');
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** The currently selected values, regardless of mode. */
  protected readonly selectedValues = computed<T[]>(() => {
    if (this.multiple()) {
      return this.values();
    }
    const v = this.value();
    return v === null || v === undefined ? [] : [v];
  });

  /** Flattened options with group disabled folded in and group label attached. */
  private readonly normalizedOptions = computed<NormalizedOption<T>[]>(() => {
    const out: NormalizedOption<T>[] = [];
    for (const entry of this.items()) {
      if (isDmSelectGroup(entry)) {
        for (const item of entry.items) {
          out.push({
            item,
            disabled: !!(item.disabled || entry.disabled),
            groupLabel: entry.label,
          });
        }
      } else {
        out.push({ item: entry, disabled: !!entry.disabled });
      }
    }
    return out;
  });

  /** Options after the inline filter is applied (used for keyboard navigation). */
  protected readonly visibleOptions = computed<NormalizedOption<T>[]>(() => {
    const text = this.filterText().trim().toLowerCase();
    if (!text) {
      return this.normalizedOptions();
    }
    return this.normalizedOptions().filter((o) => o.item.label.toLowerCase().includes(text));
  });

  /** Rows to render: group headers interleaved with (filtered) option rows. */
  protected readonly visibleRows = computed<SelectRow<T>[]>(() => {
    const rows: SelectRow<T>[] = [];
    let lastGroup: string | undefined;
    let seenAnyGroup = false;
    this.visibleOptions().forEach((option, index) => {
      if (option.groupLabel !== undefined) {
        seenAnyGroup = true;
        if (option.groupLabel !== lastGroup) {
          lastGroup = option.groupLabel;
          rows.push({ kind: 'group', key: `g-${option.groupLabel}`, label: option.groupLabel });
        }
      } else if (seenAnyGroup) {
        // Ungrouped options after a group start their own reset.
        lastGroup = undefined;
      }
      rows.push({ kind: 'option', key: `o-${index}`, option, index });
    });
    return rows;
  });

  protected readonly hasResults = computed(() => this.visibleOptions().length > 0);

  /** The single-mode selected item (for the trigger label). */
  protected readonly selectedItem = computed<DmSelectItem<T> | null>(() => {
    if (this.multiple()) {
      return null;
    }
    const v = this.value();
    if (v === null || v === undefined) {
      return null;
    }
    return this.normalizedOptions().find((o) => o.item.value === v)?.item ?? null;
  });

  /** The multi-mode selected items (for the chips), in items order. */
  protected readonly selectedChips = computed<DmSelectItem<T>[]>(() => {
    if (!this.multiple()) {
      return [];
    }
    const selected = new Set(this.values());
    return this.normalizedOptions()
      .filter((o) => selected.has(o.item.value))
      .map((o) => o.item);
  });

  protected readonly displayText = computed(() => this.selectedItem()?.label ?? this.placeholder());

  protected readonly hasSelection = computed(() =>
    this.multiple()
      ? this.values().length > 0
      : this.value() !== null && this.value() !== undefined,
  );

  protected readonly hasPlaceholder = computed(() => !this.hasSelection());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.hasSelection() && !this.isDisabled(),
  );

  protected readonly showSelectAll = computed(
    () => this.multiple() && (!!this.selectAllLabel() || !!this.clearAllLabel()),
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
  private readonly filterRef = viewChild<ElementRef<HTMLInputElement>>('filterEl');

  protected triggerWidth = 0;

  protected optionId(index: number): string {
    return `${this.uid}-option-${index}`;
  }

  protected isSelectedValue(value: T): boolean {
    return this.selectedValues().includes(value);
  }

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: T | T[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: T | T[] | null): void {
    if (this.multiple()) {
      this.values.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(Array.isArray(value) ? null : (value ?? null));
    }
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // Reset transient panel state when it closes.
    effect(() => {
      if (!this.open()) {
        this.typeaheadBuffer.set('');
        this.filterText.set('');
        clearTimeout(this.typeaheadTimer);
      }
    });

    // Keep the active option scrolled into view.
    effect(() => {
      const i = this.activeIndex();
      if (!this.open() || i < 0) {
        return;
      }
      queueMicrotask(() => {
        const el = this.listboxRef()?.nativeElement.querySelector<HTMLElement>(
          `#${this.optionId(i)}`,
        );
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
    // Start focus on the first selected option, or the first enabled one.
    const options = this.visibleOptions();
    const selectedIdx = options.findIndex((o) => this.isSelectedValue(o.item.value) && !o.disabled);
    this.activeIndex.set(selectedIdx >= 0 ? selectedIdx : this.firstEnabledIndex());
    this.open.set(true);
    if (this.filterable()) {
      queueMicrotask(() => this.filterRef()?.nativeElement.focus());
    }
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

  /** Commit the option at `index` (into `visibleOptions`). */
  protected commitAt(index: number): void {
    const option = this.visibleOptions()[index];
    if (!option || option.disabled) {
      return;
    }
    if (this.multiple()) {
      this.toggleValue(option.item.value);
    } else {
      this.value.set(option.item.value);
      this.onChange(option.item.value);
      this.close();
    }
  }

  private toggleValue(value: T): void {
    const current = this.values();
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.values.set(next);
    this.onChange(next);
  }

  /** Remove a chip's value (multiple mode). */
  protected removeValue(value: T, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    const next = this.values().filter((v) => v !== value);
    this.values.set(next);
    this.onChange(next);
    this.onTouched();
  }

  protected onSelectAll(): void {
    const next = new Set(this.values());
    for (const option of this.visibleOptions()) {
      if (!option.disabled) {
        next.add(option.item.value);
      }
    }
    const arr = [...next];
    this.values.set(arr);
    this.onChange(arr);
  }

  protected onClearAll(): void {
    this.values.set([]);
    this.onChange([]);
  }

  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doClear();
  }

  private doClear(): void {
    if (this.multiple()) {
      this.values.set([]);
      this.onChange([]);
    } else {
      this.value.set(null);
      this.onChange(null);
    }
    this.onTouched();
  }

  protected onOptionClick(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.commitAt(index);
  }

  protected onOptionHover(index: number): void {
    if (!this.visibleOptions()[index]?.disabled) {
      this.activeIndex.set(index);
    }
  }

  protected onTriggerBlur(): void {
    if (!this.open()) {
      this.onTouched();
    }
  }

  protected onFilterInput(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
    // Re-anchor the active option to the first match.
    this.activeIndex.set(this.firstEnabledIndex());
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
      } else if (!this.filterable() && key.length === 1 && /\S/.test(key)) {
        // Type-to-select while closed (only when there is no filter box).
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
        event.preventDefault();
        this.commitAt(this.activeIndex());
        break;
      case ' ':
        // Space selects only when not typing in the filter box.
        if (!this.filterable()) {
          event.preventDefault();
          this.commitAt(this.activeIndex());
        }
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
        if (!this.filterable()) {
          event.preventDefault();
          this.activeIndex.set(this.firstEnabledIndex());
        }
        break;
      case 'End':
        if (!this.filterable()) {
          event.preventDefault();
          this.activeIndex.set(this.lastEnabledIndex());
        }
        break;
      case 'Tab':
        this.close(false);
        break;
      default:
        if (!this.filterable() && key.length === 1 && /\S/.test(key)) {
          event.preventDefault();
          this.typeahead(key);
        }
    }
  }

  private moveActive(delta: 1 | -1): void {
    const options = this.visibleOptions();
    const total = options.length;
    if (!total) {
      return;
    }
    let i = this.activeIndex();
    if (i < 0) {
      i = delta === 1 ? -1 : 0;
    }
    for (let step = 0; step < total; step++) {
      i = (i + delta + total) % total;
      if (!options[i].disabled) {
        this.activeIndex.set(i);
        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    return this.visibleOptions().findIndex((o) => !o.disabled);
  }

  private lastEnabledIndex(): number {
    const options = this.visibleOptions();
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) {
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

    const options = this.visibleOptions();
    const match = options.findIndex(
      (o) => !o.disabled && o.item.label.toLowerCase().startsWith(buffer),
    );
    if (match >= 0) {
      this.activeIndex.set(match);
    }
  }
}
