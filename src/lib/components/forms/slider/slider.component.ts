import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { SLIDER_DEFAULTS } from './slider.tokens';
import { DmSliderColor, DmSliderFormatter, DmSliderMark, DmSliderSize } from './slider.types';

/** Internal shape: a mark plus its resolved position on the track. */
interface ResolvedMark extends DmSliderMark {
  percent: number;
  active: boolean;
}

/**
 * Single-value slider (`role="slider"`). Drag with the pointer, jump by
 * clicking the track, or use the full keyboard map (arrows, PageUp/PageDown,
 * Home/End). Works standalone with `[(value)]` and with Angular forms via
 * `ControlValueAccessor`.
 *
 * ```html
 * <dm-slider [(value)]="volume" ariaLabel="Volume" />
 * <dm-slider [formControl]="price" [min]="0" [max]="500" [step]="10" />
 * <dm-slider [showValueLabel]="true" [marks]="[{ value: 50, label: '50%' }]" />
 * ```
 */
@Component({
  selector: 'dm-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmSliderComponent),
      multi: true,
    },
  ],
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-color]': 'color()',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-dragging]': 'dragging() ? "true" : null',
  },
})
export class DmSliderComponent implements ControlValueAccessor {
  private readonly defaults = inject(SLIDER_DEFAULTS);

  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly thumbRef = viewChild.required<ElementRef<HTMLElement>>('thumb');

  /** Current value. Two-way: `[(value)]`. */
  readonly value = model<number>(0);

  /** Lower bound of the range. */
  readonly min = input<number>(0);

  /** Upper bound of the range. */
  readonly max = input<number>(100);

  /** Granularity between values. Decimal steps (`0.1`) are supported. */
  readonly step = input<number>(1);

  /** Size scale (track height and thumb diameter). */
  readonly size = input<DmSliderSize>(this.defaults.size);

  /** Semantic color of the fill and thumb border. */
  readonly color = input<DmSliderColor>(this.defaults.color);

  /** Disables the control (combined with the forms `disabled` state). */
  readonly disabled = input<boolean>(false);

  /** Shows a value bubble over the thumb while dragging, hovering or focused. */
  readonly showValueLabel = input<boolean>(this.defaults.showValueLabel);

  /** Formats the value for the bubble and `aria-valuetext`. */
  readonly formatValue = input<DmSliderFormatter>(String);

  /** Dots on the track (active when ≤ value), with optional labels below. */
  readonly marks = input<DmSliderMark[] | null>(null);

  /** Accessible label of the slider. */
  readonly ariaLabel = input<string>('');

  /** True while a pointer drag is in progress (drives the bubble + styles). */
  protected readonly dragging = signal(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Thumb/fill position along the track, as a 0–100 percentage. */
  protected readonly percent = computed(() => this.toPercent(this.value()));

  /** Value formatted with `formatValue`, for the bubble and `aria-valuetext`. */
  protected readonly formatted = computed(() => this.formatValue()(this.value()));

  /** Marks resolved to a track position and an active flag. */
  protected readonly resolvedMarks = computed<ResolvedMark[]>(() =>
    (this.marks() ?? []).map((mark) => ({
      ...mark,
      percent: this.toPercent(mark.value),
      active: mark.value <= this.value(),
    })),
  );

  protected readonly hasMarkLabels = computed(() =>
    this.resolvedMarks().some((mark) => !!mark.label),
  );

  /**
   * Decimal places used when snapping, derived from `step` and `min` so that
   * decimal steps (`0.1`) never produce float artifacts (`0.30000000000000004`).
   */
  private readonly precision = computed(() =>
    Math.max(decimalsOf(this.step()), decimalsOf(this.min())),
  );

  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // ---- Keyboard ------------------------------------------------------------
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const step = this.normalizedStep();
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = this.clampSnap(this.value() + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = this.clampSnap(this.value() - step);
        break;
      case 'PageUp':
        next = this.pageValue(1);
        break;
      case 'PageDown':
        next = this.pageValue(-1);
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    this.commit(next);
    this.onTouched();
  }

  /** ±(max−min)/10, snapped to the step grid; falls back to ±step. */
  private pageValue(direction: 1 | -1): number {
    const span = this.max() - this.min();
    const candidate = this.clampSnap(this.value() + (direction * span) / 10);
    if (candidate !== this.value()) {
      return candidate;
    }
    // The page jump was smaller than half a step: still move one step.
    return this.clampSnap(this.value() + direction * this.normalizedStep());
  }

  // ---- Pointer -------------------------------------------------------------
  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled() || event.button !== 0) {
      return;
    }
    // Keep the browser from scrolling/selecting and from moving focus away.
    event.preventDefault();
    const zone = event.currentTarget as HTMLElement;
    try {
      zone.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture is best-effort (unavailable in some test environments).
    }
    this.dragging.set(true);
    this.commitFromPointer(event);
    this.thumbRef().nativeElement.focus();
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    this.commitFromPointer(event);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    this.dragging.set(false);
    const zone = event.currentTarget as HTMLElement;
    try {
      zone.releasePointerCapture?.(event.pointerId);
    } catch {
      // Capture may already be gone (pointercancel, test environments).
    }
    this.onTouched();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  /** Maps a pointer position to a value using the live track geometry. */
  private commitFromPointer(event: PointerEvent): void {
    const rect = this.trackRef().nativeElement.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    this.commit(this.min() + ratio * (this.max() - this.min()));
  }

  // ---- Value pipeline ------------------------------------------------------
  /** Clamps + snaps, updates the model and notifies forms only on change. */
  private commit(raw: number): void {
    const next = this.clampSnap(raw);
    if (next !== this.value()) {
      this.value.set(next);
      this.onChange(next);
    }
  }

  /** Clamps into `[min, max]` and snaps onto the `min + n·step` grid. */
  private clampSnap(raw: number): number {
    const min = this.min();
    const max = this.max();
    if (max <= min || !Number.isFinite(raw)) {
      return min;
    }
    const step = this.normalizedStep();
    const clamped = clamp(raw, min, max);
    const snapped = min + Math.round((clamped - min) / step) * step;
    const rounded = Number(snapped.toFixed(this.precision()));
    return clamp(rounded, min, max);
  }

  private normalizedStep(): number {
    const step = this.step();
    return step > 0 ? step : 1;
  }

  private toPercent(value: number): number {
    const span = this.max() - this.min();
    if (span <= 0) {
      return 0;
    }
    return clamp(((value - this.min()) / span) * 100, 0, 100);
  }

  // ---- ControlValueAccessor ------------------------------------------------
  writeValue(value: unknown): void {
    const numeric = typeof value === 'number' ? value : Number(value ?? this.min());
    this.value.set(this.clampSnap(Number.isFinite(numeric) ? numeric : this.min()));
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

/** Number of decimal places in a number's canonical string form. */
function decimalsOf(value: number): number {
  const text = String(value);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}
