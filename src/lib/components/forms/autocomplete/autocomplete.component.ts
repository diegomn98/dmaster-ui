import { OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { AUTOCOMPLETE_DEFAULTS } from './autocomplete.tokens';
import {
  DmAutocompleteColor,
  DmAutocompleteOption,
  DmAutocompleteRadius,
  DmAutocompleteVariant,
} from './autocomplete.types';

/**
 * A free-text field with a filtered suggestions dropdown (search-as-you-type).
 * Unlike `dm-select`, the trigger IS an editable `<input>`: the user types
 * arbitrary text, sees matching options in a CDK overlay, and either picks one
 * or keeps their own text. The value is always a plain string.
 *
 * ```html
 * <dm-autocomplete
 *   label="Fruit"
 *   placeholder="Type to search…"
 *   [options]="fruits"
 *   [(value)]="fruit"
 *   (optionSelected)="onPick($event)"
 * />
 * ```
 *
 * The panel renders in a CDK overlay anchored to the input, matches its width,
 * and closes on Escape, outside click, selection, or blur. Wired as a combobox
 * (`aria-autocomplete="list"`) for assistive technology.
 */
@Component({
  selector: 'dm-autocomplete',
  imports: [OverlayModule],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmAutocompleteComponent),
      multi: true,
    },
  ],
})
export class DmAutocompleteComponent implements ControlValueAccessor {
  private readonly defaults = inject(AUTOCOMPLETE_DEFAULTS);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  protected readonly uid = dmUid('dm-autocomplete');

  // ---- Inputs --------------------------------------------------------------
  /** Suggestions to filter and render in the panel. */
  readonly options = input<DmAutocompleteOption[]>([]);

  /** Two-way free-text value (the CVA value). */
  readonly value = model<string>('');

  /** Visible label above the field. */
  readonly label = input<string>('');

  /** Placeholder shown while the field is empty. */
  readonly placeholder = input<string>('');

  /** Help text below the field (hidden while `error` is set). */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the field. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows the required marker next to the label. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Shows the × button (and enables Escape-to-clear) once there is text. */
  readonly clearable = input(true, { transform: booleanAttribute });

  /** Semantic color for the focus ring, caret and active option highlight. */
  readonly color = input<DmAutocompleteColor>(this.defaults.color);

  /** Visual variant of the field surface. */
  readonly variant = input<DmAutocompleteVariant>(this.defaults.variant);

  /** Field height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding (`md` default, matching the field family; `full` = pill). */
  readonly radius = input<DmAutocompleteRadius>(this.defaults.radius);

  /** ARIA label for fields without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** ARIA label for the clear button (localise in multilingual apps). */
  readonly clearAriaLabel = input<string>('Clear');

  /** Message shown when no option matches the text (hidden if empty). */
  readonly noResultsLabel = input<string>('');

  /** Show all options as soon as the field is focused, before any typing. */
  readonly openOnFocus = input(false, { transform: booleanAttribute });

  // ---- Outputs -------------------------------------------------------------
  /** Emitted when the user picks a suggestion (carries the full option). */
  readonly optionSelected = output<DmAutocompleteOption>();

  // ---- State ---------------------------------------------------------------
  protected readonly labelId = `${this.uid}-label`;
  protected readonly inputId = `${this.uid}-input`;
  protected readonly listboxId = `${this.uid}-listbox`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  private focused = false;
  /** Guards the focus that follows a commit/clear so the panel stays closed. */
  private suppressReopen = false;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Options filtered by the current text (case-insensitive, trimmed). */
  protected readonly visibleOptions = computed<DmAutocompleteOption[]>(() => {
    const text = this.value().trim().toLowerCase();
    if (!text) {
      return this.options();
    }
    return this.options().filter((o) => o.label.toLowerCase().includes(text));
  });

  protected readonly hasResults = computed(() => this.visibleOptions().length > 0);

  protected readonly showClearButton = computed(
    () => this.clearable() && this.value().length > 0 && !this.isDisabled(),
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
    return i >= 0 && this.open() ? this.optionId(i) : null;
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

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  private readonly listboxRef = viewChild<ElementRef<HTMLUListElement>>('listboxEl');

  protected controlWidth = 0;

  protected optionId(index: number): string {
    return `${this.uid}-option-${index}`;
  }

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // Reset the active option when the panel closes.
    effect(() => {
      if (!this.open()) {
        this.activeIndex.set(-1);
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
  }

  // ---- Open / close --------------------------------------------------------
  /** True when the panel should currently be shown. */
  private shouldOpen(): boolean {
    if (this.isDisabled()) {
      return false;
    }
    const hasText = this.value().trim().length > 0;
    const triggered = hasText || (this.openOnFocus() && this.focused);
    if (!triggered) {
      return false;
    }
    // Open when there is something to show: matching options, or — once the
    // user has typed — a "no results" message (when the consumer supplied one).
    return this.hasResults() || (hasText && !!this.noResultsLabel());
  }

  private syncOpen(): void {
    this.open.set(this.shouldOpen());
  }

  protected close(): void {
    this.open.set(false);
  }

  // ---- Interaction ---------------------------------------------------------
  protected onFocus(): void {
    this.focused = true;
    this.measure();
    if (this.suppressReopen) {
      this.suppressReopen = false;
      return;
    }
    this.syncOpen();
    if (this.open()) {
      this.activeIndex.set(this.firstEnabledIndex());
    }
  }

  protected onBlur(): void {
    this.focused = false;
    this.close();
    this.onTouched();
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
    this.measure();
    this.syncOpen();
    // Re-anchor the active option to the first match.
    this.activeIndex.set(this.open() ? this.firstEnabledIndex() : -1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const key = event.key;

    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        this.focused = true;
        this.measure();
        // Force-open (openOnFocus semantics) so the user can browse options.
        if (this.hasResults()) {
          event.preventDefault();
          this.open.set(true);
          this.activeIndex.set(this.firstEnabledIndex());
        }
      }
      return;
    }

    switch (key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Enter':
        if (this.activeIndex() >= 0) {
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
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  /** Commit the option at `index` (into `visibleOptions`). */
  protected commitAt(index: number): void {
    const option = this.visibleOptions()[index];
    if (!option || option.disabled) {
      return;
    }
    this.value.set(option.label);
    this.onChange(option.label);
    this.optionSelected.emit(option);
    this.close();
    // Keep focus in the input, but don't let that focus reopen the panel just
    // because the committed text now matches the picked option.
    this.suppressReopen = true;
    this.inputRef().nativeElement.focus();
    this.suppressReopen = false;
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

  protected onClearClick(): void {
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.close();
    this.inputRef().nativeElement.focus();
  }

  private measure(): void {
    this.controlWidth = this.inputRef().nativeElement.offsetWidth;
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

  /** Programmatically focus the input. */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }
}
