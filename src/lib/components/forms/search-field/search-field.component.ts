import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
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
import { SEARCH_FIELD_DEFAULTS } from './search-field.tokens';
import {
  DmSearchFieldColor,
  DmSearchFieldRadius,
  DmSearchFieldVariant,
} from './search-field.types';

/**
 * Text field specialised for search: a leading magnifier, a trailing clear
 * button that appears once there is text, and search semantics (Escape clears,
 * Enter submits). Color × variant API, and a `ControlValueAccessor`
 * so it drops into template- and reactive-driven forms.
 *
 * ```html
 * <dm-search-field
 *   label="Search"
 *   placeholder="Search components…"
 *   [(value)]="query"
 *   (searchSubmit)="run($event)"
 * />
 * ```
 */
@Component({
  selector: 'dm-search-field',
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmSearchFieldComponent),
      multi: true,
    },
  ],
})
export class DmSearchFieldComponent implements ControlValueAccessor {
  private readonly defaults = inject(SEARCH_FIELD_DEFAULTS);
  protected readonly uid = dmUid('dm-search-field');

  // ---- Inputs --------------------------------------------------------------
  /** Two-way text value. */
  readonly value = model<string>('');

  /** Visible label above the field. */
  readonly label = input<string>('');

  /** Placeholder shown while the field is empty. */
  readonly placeholder = input<string>('');

  /** Help text shown under the field (hidden while `error` is set). */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the field. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Renders the field read-only (no clear button, not editable). */
  readonly readOnly = input(false, { transform: booleanAttribute });

  /** Shows the required marker next to the label. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Shows the × button (and enables Escape-to-clear) once there is text. */
  readonly clearable = input(true, { transform: booleanAttribute });

  /** Semantic color for the focus ring and caret. */
  readonly color = input<DmSearchFieldColor>(this.defaults.color);

  /** Visual variant of the field surface. */
  readonly variant = input<DmSearchFieldVariant>(this.defaults.variant);

  /** Field height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding (`md` default, matching the field family; `full` = pill). */
  readonly radius = input<DmSearchFieldRadius>(this.defaults.radius);

  /** `name` for the native input (form submission / autofill). */
  readonly name = input<string>('');

  /** ARIA label for fields without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** ARIA label for the clear button (localise in multilingual apps). */
  readonly clearAriaLabel = input<string>('Clear search');

  // ---- Outputs -------------------------------------------------------------
  /** Emitted with the current value when the user presses Enter. */
  readonly searchSubmit = output<string>();

  /** Emitted after the field is cleared (× button or Escape). */
  readonly cleared = output<void>();

  // ---- State ---------------------------------------------------------------
  protected readonly labelId = `${this.uid}-label`;
  protected readonly inputId = `${this.uid}-input`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.value().length > 0 && !this.isDisabled() && !this.readOnly(),
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

  // ---- Interaction ---------------------------------------------------------
  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.showClearButton()) {
      event.preventDefault();
      this.clear();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.searchSubmit.emit(this.value());
    }
  }

  protected onClearClick(): void {
    this.clear();
    this.inputRef().nativeElement.focus();
  }

  private clear(): void {
    if (this.value().length === 0) {
      return;
    }
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.cleared.emit();
  }

  /** Programmatically focus the input (e.g. after opening a search panel). */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }
}
