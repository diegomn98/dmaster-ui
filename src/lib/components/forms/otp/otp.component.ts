import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { OTP_DEFAULTS } from './otp.tokens';
import { DmOtpColor, DmOtpMode, DmOtpSize, DmOtpVariant } from './otp.types';

/** Per-mode character filter and the `inputmode` hint for the mobile keyboard. */
const MODE_CONFIG: Record<DmOtpMode, { pattern: RegExp; inputMode: string }> = {
  numeric: { pattern: /[0-9]/, inputMode: 'numeric' },
  alphanumeric: { pattern: /[a-zA-Z0-9]/, inputMode: 'text' },
  text: { pattern: /[^\s]/, inputMode: 'text' },
};

/**
 * One-time-code / PIN field: a row of single-character cells that behaves as
 * one control. Typing advances to the next cell, Backspace clears and steps
 * back, arrows/Home/End move between cells and a paste is distributed across
 * them. A `ControlValueAccessor`, so it drops into template- and reactive-driven
 * forms; `[(value)]` for standalone use, and `(completed)` fires once every
 * cell is filled.
 *
 * ```html
 * <dm-otp [(value)]="code" [length]="6" (completed)="verify($event)" ariaLabel="Verification code" />
 * <dm-otp [formControl]="pin" [length]="4" mode="numeric" mask />
 * ```
 */
@Component({
  selector: 'dm-otp',
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmOtpComponent),
      multi: true,
    },
  ],
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-size]': 'size()',
    '[attr.data-color]': 'color()',
    '[attr.data-variant]': 'variant()',
  },
})
export class DmOtpComponent implements ControlValueAccessor {
  private readonly defaults = inject(OTP_DEFAULTS);

  /** Number of cells. */
  readonly length = input(this.defaults.length, { transform: numberAttribute });

  /** Accepted characters: digits only, letters + digits, or any non-space. */
  readonly mode = input<DmOtpMode>(this.defaults.mode);

  /** Current code. Two-way: `[(value)]`. */
  readonly value = model<string>('');

  /** Renders each filled cell as a masked dot (like a password). */
  readonly mask = input(false, { transform: booleanAttribute });

  /** Disables every cell (combined with the forms `disabled`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Focuses the first cell on init. */
  readonly autoFocus = input(false, { transform: booleanAttribute });

  /** Semantic color of the focus ring / active cell. */
  readonly color = input<DmOtpColor>(this.defaults.color);

  /** Control size. */
  readonly size = input<DmOtpSize>(this.defaults.size);

  /** Cell surface: flat (muted), bordered (elevated + border), faded, underlined. */
  readonly variant = input<DmOtpVariant>(this.defaults.variant);

  /**
   * Inserts a visual separator after every N cells (`0` = none). With
   * `length=6` and `groupSize=3` the field reads `123 – 456`.
   */
  readonly groupSize = input(0, { transform: numberAttribute });

  /** Accessible label of the whole group. */
  readonly ariaLabel = input<string>('');

  /** Emitted once when the last empty cell is filled. */
  readonly completed = output<string>();

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('cell');

  /** Source of truth: one entry per cell (positional, '' when empty). */
  private readonly cells = signal<string[]>([]);

  /** Indices to iterate in the template. */
  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  protected readonly inputMode = computed(() => MODE_CONFIG[this.mode()].inputMode);

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    // Keep `cells` in sync with the external value and the cell count. Runs on
    // the initial value, on `[(value)]` writes from the parent and on `length`
    // changes. An internal edit emits the *collapsed* join of the cells, which
    // round-trips back through `value()`; we skip redistributing it whenever it
    // already matches the current cells — otherwise clearing a middle cell would
    // shift the trailing ones left. Only a genuinely different external value
    // (or a new length) rebuilds the cells.
    effect(() => {
      const incoming = this.value() ?? '';
      const len = this.length();
      untracked(() => {
        const current = this.cells();
        if (incoming === current.join('') && current.length === len) {
          return;
        }
        this.cells.set(this.distribute(incoming, len));
      });
    });

    effect(() => {
      if (this.autoFocus() && !this.isDisabled()) {
        untracked(() => this.focusCell(0));
      }
    });
  }

  protected cellValue(index: number): string {
    return this.cells()[index] ?? '';
  }

  /** Whether the decorative separator renders after the given cell. */
  protected showSeparatorAfter(index: number): boolean {
    const size = this.groupSize();
    return size > 0 && (index + 1) % size === 0 && index < this.length() - 1;
  }

  protected onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const filter = MODE_CONFIG[this.mode()].pattern;

    // A native input event can carry more than one char (autofill, IME); take
    // the last valid one for this cell and spill the rest into the next cells.
    const valid = Array.from(raw).filter((ch) => filter.test(ch));
    if (!valid.length) {
      // Rejected keystroke: restore the cell to its stored value.
      input.value = this.cellValue(index);
      return;
    }

    const next = [...this.cells()];
    let cursor = index;
    for (const ch of valid) {
      if (cursor >= this.length()) {
        break;
      }
      next[cursor] = ch;
      cursor++;
    }
    this.commit(next);
    this.focusCell(Math.min(cursor, this.length() - 1));
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        const next = [...this.cells()];
        if (next[index]) {
          next[index] = '';
          this.commit(next);
        } else if (index > 0) {
          next[index - 1] = '';
          this.commit(next);
          this.focusCell(index - 1);
        }
        break;
      }
      case 'Delete': {
        event.preventDefault();
        const next = [...this.cells()];
        next[index] = '';
        this.commit(next);
        break;
      }
      case 'ArrowLeft':
        event.preventDefault();
        this.focusCell(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusCell(index + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusCell(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusCell(this.length() - 1);
        break;
      default:
        break;
    }
  }

  protected onPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const filter = MODE_CONFIG[this.mode()].pattern;
    const chars = Array.from(text).filter((ch) => filter.test(ch));
    if (!chars.length) {
      return;
    }
    const next = [...this.cells()];
    let cursor = index;
    for (const ch of chars) {
      if (cursor >= this.length()) {
        break;
      }
      next[cursor] = ch;
      cursor++;
    }
    this.commit(next);
    this.focusCell(Math.min(cursor, this.length() - 1));
  }

  protected onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  // ---- Internal helpers ----------------------------------------------------
  private distribute(source: string, len: number): string[] {
    const filter = MODE_CONFIG[this.mode()].pattern;
    const chars = Array.from(source).filter((ch) => filter.test(ch));
    return Array.from({ length: len }, (_, i) => chars[i] ?? '');
  }

  private commit(next: string[]): void {
    this.cells.set(next);
    const joined = next.join('');
    this.value.set(joined);
    this.onChange(joined);
    if (next.every((c) => c !== '') && next.length === this.length()) {
      this.completed.emit(joined);
    }
  }

  private focusCell(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.length() - 1));
    const el = this.inputs()[clamped]?.nativeElement;
    if (el) {
      el.focus();
      el.select();
    }
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: string): void {
    this.cells.set(this.distribute(value ?? '', this.length()));
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
}
