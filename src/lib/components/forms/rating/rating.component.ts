import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { RATING_DEFAULTS } from './rating.tokens';
import { DmRatingColor, DmRatingSize } from './rating.types';

/** Internal shape: one star plus its resolved fill percentage (0–100). */
interface RatingStar {
  index: number;
  percent: number;
}

/**
 * Star rating (`role="slider"`). Hover to preview, click to commit, or drive it
 * from the keyboard. Supports half-star precision, a `readonly` display mode
 * that renders fractional averages (e.g. `3.7`), and a custom glyph. Works
 * standalone with `[(value)]` and with Angular forms via `ControlValueAccessor`.
 *
 * ```html
 * <dm-rating [(value)]="score" ariaLabel="Rate this product" />
 * <dm-rating [formControl]="score" [max]="10" allowHalf />
 * <dm-rating [value]="3.7" readonly ariaLabel="Average rating" />
 * ```
 */
@Component({
  selector: 'dm-rating',
  imports: [NgTemplateOutlet],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmRatingComponent),
      multi: true,
    },
  ],
  host: {
    role: 'slider',
    'aria-orientation': 'horizontal',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-readonly]': 'readonly() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.tabindex]': 'isInteractive() ? 0 : -1',
    '[attr.data-size]': 'size()',
    '[attr.data-color]': 'color()',
    '[attr.data-readonly]': 'readonly() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    '(keydown)': 'onKeydown($event)',
    '(blur)': 'onBlur()',
  },
})
export class DmRatingComponent implements ControlValueAccessor {
  private readonly defaults = inject(RATING_DEFAULTS);

  /** Current rating. Two-way: `[(value)]`. */
  readonly value = model<number>(0);

  /** Number of stars rendered (the maximum value). */
  readonly max = input<number>(this.defaults.max);

  /** Enables half-star precision on hover and the keyboard. */
  readonly allowHalf = input(this.defaults.allowHalf, { transform: booleanAttribute });

  /** Display-only: renders fractional fills, no pointer/keyboard interaction. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Disables the control (combined with the forms `disabled` state). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Star size scale. */
  readonly size = input<DmRatingSize>(this.defaults.size);

  /** Semantic color of the filled stars. */
  readonly color = input<DmRatingColor>(this.defaults.color);

  /** Accessible label of the rating. */
  readonly ariaLabel = input<string>('');

  /** Custom glyph to render instead of the default star (e.g. `'★'`, `'❤'`). */
  readonly character = input<string>('');

  /** Emitted when a new rating is committed by pointer or keyboard. */
  readonly rateChange = output<number>();

  /** Previewed value while hovering; `null` when the pointer is away. */
  private readonly hoverValue = signal<number | null>(null);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly isInteractive = computed(() => !this.isDisabled() && !this.readonly());

  /** Step used by the keyboard and hover snapping. */
  private readonly step = computed(() => (this.allowHalf() ? 0.5 : 1));

  /** Value driving the visible fill: the hover preview or the committed value. */
  private readonly displayValue = computed(() => this.hoverValue() ?? this.value());

  /** One entry per star, each with its 0–100 fill percentage. */
  protected readonly stars = computed<RatingStar[]>(() => {
    const shown = this.displayValue();
    const count = Math.max(0, Math.floor(this.max()));
    return Array.from({ length: count }, (_, index) => ({
      index,
      // Round to avoid float artifacts (`70.00000000000001%`) from `3.7 - 3`.
      percent: Math.round(clamp(shown - index, 0, 1) * 10000) / 100,
    }));
  });

  /** `aria-valuetext`, e.g. `"3 of 5 stars"`. */
  protected readonly valueText = computed(() => {
    const value = this.value();
    return `${value} of ${this.max()} ${value === 1 ? 'star' : 'stars'}`;
  });

  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // ---- Keyboard ------------------------------------------------------------
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isInteractive()) {
      return;
    }
    const step = this.step();
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = this.value() + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = this.value() - step;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    this.emit(next);
    this.onTouched();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  // ---- Pointer -------------------------------------------------------------
  protected onStarPointerMove(event: PointerEvent, index: number): void {
    if (!this.isInteractive()) {
      return;
    }
    this.hoverValue.set(this.valueFromPointer(event, index));
  }

  protected onStarPointerDown(event: PointerEvent, index: number): void {
    if (!this.isInteractive() || event.button !== 0) {
      return;
    }
    const picked = this.valueFromPointer(event, index);
    // Clicking the current value again clears the rating (common toggle UX).
    const next = picked === this.value() ? 0 : picked;
    this.emit(next);
    this.onTouched();
  }

  protected clearHover(): void {
    this.hoverValue.set(null);
  }

  /** Maps a pointer x within a star to a value, honouring `allowHalf`. */
  private valueFromPointer(event: MouseEvent, index: number): number {
    if (this.allowHalf()) {
      const star = event.currentTarget as HTMLElement;
      const rect = star.getBoundingClientRect();
      if (rect.width > 0 && event.clientX - rect.left < rect.width / 2) {
        return index + 0.5;
      }
    }
    return index + 1;
  }

  // ---- Value pipeline ------------------------------------------------------
  /** Snaps + clamps, updates the model and notifies forms only on change. */
  private emit(raw: number): void {
    const next = this.snapClamp(raw);
    if (next !== this.value()) {
      this.value.set(next);
      this.onChange(next);
      this.rateChange.emit(next);
    }
  }

  /** Snaps onto the step grid and clamps into `[0, max]`. */
  private snapClamp(raw: number): number {
    if (!Number.isFinite(raw)) {
      return 0;
    }
    const step = this.step();
    const snapped = Math.round(raw / step) * step;
    return Number(clamp(snapped, 0, this.max()).toFixed(1));
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: unknown): void {
    const numeric = typeof value === 'number' ? value : Number(value);
    // Clamp only (no snap) so a readonly average like 3.7 renders precisely.
    this.value.set(Number.isFinite(numeric) ? clamp(numeric, 0, this.max()) : 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
