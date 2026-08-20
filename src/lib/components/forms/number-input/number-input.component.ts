import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { NUMBER_INPUT_DEFAULTS } from './number-input.tokens';
import {
  DmNumberInputColor,
  DmNumberInputRadius,
  DmNumberInputVariant,
} from './number-input.types';

/** Delay before press-and-hold starts repeating, then the repeat cadence (ms). */
const HOLD_DELAY_MS = 400;
const HOLD_INTERVAL_MS = 60;

/** Multiplier applied to `step` for Shift+Arrow and PageUp/PageDown. */
const BIG_STEP_FACTOR = 10;

/** Characters accepted while typing (digits, sign, decimal separators). */
const TYPABLE = /^[0-9.,\-+]*$/;

/**
 * Numeric spinbutton field: a text input (`role="spinbutton"`,
 * `inputmode="decimal"`) flanked by −/+ buttons, with the full keyboard map
 * (arrows, Shift+arrows, PageUp/PageDown, Home/End), clamping to `min`/`max`,
 * precision rounding and optional `Intl.NumberFormat` display while blurred.
 * A `ControlValueAccessor`, so it drops into template- and reactive-driven
 * forms; `[(value)]` for standalone use.
 *
 * ```html
 * <dm-number-input label="Quantity" [(value)]="qty" [min]="0" [max]="99" />
 * <dm-number-input
 *   [formControl]="price"
 *   [step]="0.5"
 *   [formatOptions]="{ style: 'currency', currency: 'EUR' }"
 * />
 * ```
 */
@Component({
  selector: 'dm-number-input',
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmNumberInputComponent),
      multi: true,
    },
  ],
})
export class DmNumberInputComponent implements ControlValueAccessor {
  private readonly defaults = inject(NUMBER_INPUT_DEFAULTS);
  protected readonly uid = dmUid('dm-number-input');

  // ---- Inputs --------------------------------------------------------------
  /** Two-way numeric value. `null` while the field is empty. */
  readonly value = model<number | null>(null);

  /** Lower bound (inclusive). `null` = unbounded. */
  readonly min = input<number | null, unknown>(null, { transform: nullableNumber });

  /** Upper bound (inclusive). `null` = unbounded. */
  readonly max = input<number | null, unknown>(null, { transform: nullableNumber });

  /** Amount added/removed by the buttons and arrow keys. */
  readonly step = input<number, unknown>(1, { transform: numberAttribute });

  /**
   * Decimal places the committed value is rounded to. Defaults to the number
   * of decimals in `step` (so `step=0.25` keeps two decimals, `step=1` none).
   */
  readonly precision = input<number | null, unknown>(null, { transform: nullableNumber });

  /** Visible label above the field. */
  readonly label = input<string>('');

  /** Placeholder shown while the field is empty. */
  readonly placeholder = input<string>('');

  /** Help text shown under the field (hidden while `error` is set). */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the field (combined with the forms `disabled` state). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Read-only: value visible, buttons and typing/keyboard stepping off. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Shows the required marker and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Hides the −/+ buttons. Keyboard stepping keeps working. */
  readonly hideControls = input(this.defaults.hideControls, { transform: booleanAttribute });

  /** Semantic color for the focus ring and caret. */
  readonly color = input<DmNumberInputColor>(this.defaults.color);

  /** Visual variant of the field surface. */
  readonly variant = input<DmNumberInputVariant>(this.defaults.variant);

  /** Field height scale (32 / 40 / 48px). */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding (`md` default, matching the field family; `full` = pill). */
  readonly radius = input<DmNumberInputRadius>(this.defaults.radius);

  /**
   * `Intl.NumberFormat` options used to display the value while the field is
   * NOT focused (e.g. `{ style: 'currency', currency: 'EUR' }`). On focus the
   * raw editable number is shown; the model always holds the raw number.
   */
  readonly formatOptions = input<Intl.NumberFormatOptions | null>(null);

  /** BCP-47 locale for `formatOptions`. Omit to use the runtime default. */
  readonly locale = input<string | undefined>(undefined);

  /** `name` for the native input (form submission / autofill). */
  readonly name = input<string>('');

  /** ARIA label for fields without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /**
   * Extra `aria-describedby` id(s), e.g. an external `<dm-error>`. Merged with
   * the internal hint/error ids.
   */
  readonly ariaDescribedby = input<string>('');

  /** Accessible label of the − button. */
  readonly decrementLabel = input<string>(this.defaults.decrementLabel);

  /** Accessible label of the + button. */
  readonly incrementLabel = input<string>(this.defaults.incrementLabel);

  // ---- Outputs -------------------------------------------------------------
  /** Emitted after a value is committed (blur/Enter/step) — also fires on `null`. */
  readonly valueCommit = output<number | null>();

  // ---- Ids -----------------------------------------------------------------
  protected readonly labelId = `${this.uid}-label`;
  protected readonly inputId = `${this.uid}-input`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  // ---- State ---------------------------------------------------------------
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** True while the native input has focus (raw number shown, not formatted). */
  protected readonly focused = signal(false);

  /**
   * Text being typed, uncommitted. `null` when the field mirrors `value`.
   * Kept apart from the model so clamping/rounding never fights the caret.
   */
  private readonly draft = signal<string | null>(null);

  /** Buttons and keyboard stepping are live only when editable. */
  protected readonly isInteractive = computed(() => !this.isDisabled() && !this.readonly());

  protected readonly atMin = computed(() => {
    const min = this.min();
    const value = this.value();
    return min !== null && value !== null && value <= min;
  });

  protected readonly atMax = computed(() => {
    const max = this.max();
    const value = this.value();
    return max !== null && value !== null && value >= max;
  });

  protected readonly canDecrement = computed(() => this.isInteractive() && !this.atMin());
  protected readonly canIncrement = computed(() => this.isInteractive() && !this.atMax());

  /** Decimal places used when committing: explicit `precision` or inferred. */
  private readonly effectivePrecision = computed(() => {
    const explicit = this.precision();
    if (explicit !== null && explicit >= 0) {
      return Math.floor(explicit);
    }
    return Math.max(decimalsOf(this.normalizedStep()), decimalsOf(this.min() ?? 0));
  });

  private readonly formatter = computed<Intl.NumberFormat | null>(() => {
    const options = this.formatOptions();
    if (!options) {
      return null;
    }
    try {
      return new Intl.NumberFormat(this.locale(), options);
    } catch {
      // Invalid locale/options: fall back to the runtime default rather than
      // blowing up the whole view.
      return new Intl.NumberFormat(undefined, options);
    }
  });

  /** Value formatted with `formatOptions` (for the blurred display + aria-valuetext). */
  protected readonly formatted = computed(() => {
    const value = this.value();
    const formatter = this.formatter();
    if (value === null || !formatter) {
      return null;
    }
    return formatter.format(value);
  });

  /** Text the native input shows: the draft, the raw number or the formatted one. */
  protected readonly displayText = computed(() => {
    const draft = this.draft();
    if (draft !== null) {
      return draft;
    }
    const value = this.value();
    if (value === null) {
      return '';
    }
    if (!this.focused()) {
      return this.formatted() ?? String(value);
    }
    return String(value);
  });

  protected readonly describedBy = computed(() => {
    const ids: string[] = [];
    const external = this.ariaDescribedby().trim();
    if (external) {
      ids.push(external);
    }
    if (this.error()) {
      ids.push(this.errorId);
    } else if (this.description()) {
      ids.push(this.hintId);
    }
    return ids.length ? ids.join(' ') : null;
  });

  // ---- Press-and-hold ------------------------------------------------------
  private holdTimeout: ReturnType<typeof setTimeout> | null = null;
  private holdInterval: ReturnType<typeof setInterval> | null = null;
  /** Set once the hold repeat stepped, so the trailing `click` is ignored. */
  private holdStepped = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopHold());
  }

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.draft.set(null);
    this.value.set(coerceNumber(value));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // ---- Input events --------------------------------------------------------
  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.commitDraft();
    this.focused.set(false);
    this.onTouched();
  }

  /** Filters typed characters (paste and IME flows go through the parser). */
  protected onBeforeInput(event: InputEvent): void {
    if (event.inputType === 'insertText' && event.data && !TYPABLE.test(event.data)) {
      event.preventDefault();
    }
  }

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isInteractive()) {
          return;
        }
        const factor = event.shiftKey ? BIG_STEP_FACTOR : 1;
        this.stepBy((event.key === 'ArrowUp' ? 1 : -1) * factor);
        break;
      }
      case 'PageUp':
      case 'PageDown':
        event.preventDefault();
        if (this.isInteractive()) {
          this.stepBy((event.key === 'PageUp' ? 1 : -1) * BIG_STEP_FACTOR);
        }
        break;
      case 'Home':
        if (this.isInteractive() && this.min() !== null) {
          event.preventDefault();
          this.commit(this.min());
        }
        break;
      case 'End':
        if (this.isInteractive() && this.max() !== null) {
          event.preventDefault();
          this.commit(this.max());
        }
        break;
      case 'Enter':
        // No preventDefault: an enclosing <form> may still submit, and it
        // does so with the freshly committed value.
        this.commitDraft();
        break;
      case 'Escape':
        if (this.draft() !== null) {
          // Revert the uncommitted text; keep the key from closing an
          // enclosing dialog while the user was just undoing their typing.
          event.preventDefault();
          event.stopPropagation();
          this.draft.set(null);
        }
        break;
    }
  }

  // ---- Buttons -------------------------------------------------------------
  protected onStepClick(direction: 1 | -1): void {
    if (this.holdStepped) {
      // The press-and-hold already stepped; this is the trailing click.
      this.holdStepped = false;
      return;
    }
    if (!this.isInteractive()) {
      return;
    }
    this.stepBy(direction);
    this.onTouched();
  }

  protected onStepPointerDown(event: PointerEvent, direction: 1 | -1): void {
    if (event.button !== 0 || !this.isInteractive()) {
      return;
    }
    // Keep focus where it is (the input, if the user was typing) instead of
    // moving it onto the button.
    event.preventDefault();
    this.stopHold();
    this.holdTimeout = setTimeout(() => {
      this.holdTimeout = null;
      this.holdInterval = setInterval(() => {
        if (!(direction > 0 ? this.canIncrement() : this.canDecrement())) {
          this.stopHold();
          return;
        }
        this.holdStepped = true;
        this.stepBy(direction);
      }, HOLD_INTERVAL_MS);
    }, HOLD_DELAY_MS);
  }

  /** pointerup keeps `holdStepped` so the trailing click is swallowed. */
  protected onStepPointerUp(): void {
    this.stopHold();
  }

  /** pointerleave / pointercancel: no click will follow, forget the flag. */
  protected onStepPointerCancel(): void {
    this.stopHold();
    this.holdStepped = false;
  }

  private stopHold(): void {
    if (this.holdTimeout !== null) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    if (this.holdInterval !== null) {
      clearInterval(this.holdInterval);
      this.holdInterval = null;
    }
  }

  // ---- Value pipeline ------------------------------------------------------
  /** Adds `multiplier × step` to the current value (draft committed first). */
  private stepBy(multiplier: number): void {
    this.commitDraft();
    const base = this.value() ?? 0;
    this.commit(base + multiplier * this.normalizedStep());
  }

  /** Parses the typed text and commits it (clamped + rounded); invalid text reverts. */
  private commitDraft(): void {
    const draft = this.draft();
    if (draft === null) {
      return;
    }
    this.draft.set(null);
    const parsed = parseNumber(draft);
    if (parsed === null) {
      this.commit(null);
    } else if (Number.isFinite(parsed)) {
      this.commit(parsed);
    }
    // NaN: unparsable text → keep the previous value (the display reverts).
  }

  /** Clamps + rounds, updates the model and notifies forms only on change. */
  private commit(raw: number | null): void {
    const next = raw === null ? null : this.clampRound(raw);
    if (next !== this.value()) {
      this.value.set(next);
      this.onChange(next);
    }
    this.valueCommit.emit(next);
  }

  private clampRound(raw: number): number {
    const min = this.min();
    const max = this.max();
    let next = raw;
    if (min !== null && next < min) {
      next = min;
    }
    if (max !== null && next > max) {
      next = max;
    }
    const rounded = Number(next.toFixed(this.effectivePrecision()));
    // Rounding can nudge past a fractional bound (e.g. max=0.05 with precision
    // 1 → 0.1); clamp once more so aria/validation never see an overshoot.
    if (min !== null && rounded < min) {
      return min;
    }
    if (max !== null && rounded > max) {
      return max;
    }
    return rounded === 0 ? 0 : rounded; // normalise -0
  }

  private normalizedStep(): number {
    const step = this.step();
    return Number.isFinite(step) && step > 0 ? step : 1;
  }

  /** Programmatically focus the input. */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }
}

// ---- Helpers -----------------------------------------------------------------

/** Input transform: `''`/`null`/`undefined` → `null`, otherwise a number. */
function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = numberAttribute(value);
  return Number.isFinite(numeric) ? numeric : null;
}

/** `writeValue` coercion: finite numbers and numeric strings pass, the rest is `null`. */
function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = parseNumber(value);
    return parsed !== null && Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Lenient numeric parser for typed text. Returns `null` for empty text, `NaN`
 * for unparsable text. Accepts `.` or `,` as the decimal separator; when both
 * appear, the last one wins and the other is treated as a grouping separator
 * (`1,234.5` → 1234.5 · `1.234,5` → 1234.5).
 */
function parseNumber(text: string): number | null {
  // `\s` already covers NBSP / narrow NBSP (fr-FR grouping); `'` is de-CH grouping.
  const raw = text.replace(/[\s']/g, '');
  if (!raw) {
    return null;
  }
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized: string;
  if (lastComma > -1 && lastDot > -1) {
    normalized =
      lastComma > lastDot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '');
  } else {
    normalized = raw.replace(',', '.');
  }
  // `Number()` would accept hex/exponent/Infinity — restrict to plain decimals.
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(normalized)) {
    return NaN;
  }
  return Number(normalized);
}

/** Number of decimal places in a number's canonical string form. */
function decimalsOf(value: number): number {
  const text = String(value);
  const exp = text.indexOf('e-');
  if (exp !== -1) {
    return Number(text.slice(exp + 2));
  }
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}
