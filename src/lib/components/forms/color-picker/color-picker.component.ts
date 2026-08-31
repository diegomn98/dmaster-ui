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
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DmSize } from '../../../core/types/common.types';
import { dmUid } from '../../../core/utils/uid';
import { HSVA, formatColor, formatHex, formatRgb, parseColor } from './color-utils';
import { COLOR_PICKER_DEFAULTS } from './color-picker.tokens';
import {
  DmColorPickerColor,
  DmColorPickerFormat,
  DmColorPickerRadius,
  DmColorPickerVariant,
} from './color-picker.types';

/** Fallback working color used when the model is null or unparseable (black). */
const DEFAULT_HSVA: HSVA = { h: 0, s: 0, v: 0, a: 1 };

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Rich color picker with a saturation/value plane, hue rail, optional alpha
 * rail, a hex field and preset swatches — wrapped in a
 * color × variant trigger that reads as a sibling of the rest of the field
 * family (`dmInput`, `dm-select`, `dm-date-picker`).
 *
 * ```html
 * <dm-color-picker label="Brand" [(value)]="brand" [showAlpha]="true" />
 * ```
 *
 * The value is a hex string by default (`#rrggbb`, or `#rrggbbaa` when
 * `showAlpha` is on) — `format` switches the committed serialization to
 * `rgb(r g b)` or `hsl(h s% l%)` (with a ` / a` suffix when `showAlpha`) —
 * wired as a `ControlValueAccessor`. The panel opens in a CDK overlay anchored
 * to the trigger; nothing touches `window`/`document`, so it works under
 * SSR/prerender.
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Component({
  selector: 'dm-color-picker',
  imports: [OverlayModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DmColorPickerComponent),
      multi: true,
    },
  ],
})
export class DmColorPickerComponent implements ControlValueAccessor {
  private readonly defaults = inject(COLOR_PICKER_DEFAULTS);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  protected readonly uid = dmUid('dm-color-picker');

  // ---- Inputs (field family) ----------------------------------------------
  /** Two-way color value, serialized in the configured `format` (hex default). */
  readonly value = model<string | null>(null);

  /** Visible label above the trigger. */
  readonly label = input<string>('');

  /** Text shown while no color is selected. */
  readonly placeholder = input<string>('');

  /** Help text below the trigger. */
  readonly description = input<string>('');

  /** Error text; non-empty activates the invalid state (border + ring). */
  readonly error = input<string>('');

  /** Disables the trigger. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows the required marker next to the label. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Semantic color for the focus ring and the panel accent. */
  readonly color = input<DmColorPickerColor>(this.defaults.color);

  /** Visual variant of the trigger surface. */
  readonly variant = input<DmColorPickerVariant>(this.defaults.variant);

  /** Trigger height scale. */
  readonly size = input<DmSize>(this.defaults.size);

  /** Corner rounding of the trigger. */
  readonly radius = input<DmColorPickerRadius>(this.defaults.radius);

  /** ARIA label for triggers without a visible `label`. */
  readonly ariaLabel = input<string>('');

  /** Shows an × button to clear the selection. Keyboard: Delete / Backspace. */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** ARIA label for the clear button. */
  readonly clearAriaLabel = input<string>('Clear');

  // ---- Inputs (color specific) --------------------------------------------
  /** Adds an alpha rail and appends the alpha part to the committed value. */
  readonly showAlpha = input(this.defaults.showAlpha, { transform: booleanAttribute });

  /**
   * Serialization of the committed value: `hex` (`#rrggbb` / `#rrggbbaa`,
   * default), `rgb` (`rgb(r g b)` / `rgb(r g b / a)`) or `hsl`
   * (`hsl(h s% l%)` / `hsl(h s% l% / a)`). `writeValue` accepts any of the
   * three regardless of `format` and re-serializes into the configured one.
   */
  readonly format = input<DmColorPickerFormat>(this.defaults.format);

  /** Preset color chips for the swatch grid (hex strings). */
  readonly swatches = input<string[]>(this.defaults.swatches);

  // ---- ARIA ids ------------------------------------------------------------
  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly dialogId = `${this.uid}-dialog`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly errorId = `${this.uid}-error`;

  // ---- State ---------------------------------------------------------------
  protected readonly open = signal(false);
  /** The working color as HSV(A); the single source of truth while editing. */
  protected readonly hsva = signal<HSVA>({ ...DEFAULT_HSVA });
  /** Editable hex text bound to the hex field. */
  protected readonly hexText = signal<string>('');
  /** Announced to assistive tech whenever the color changes. */
  protected readonly liveMessage = signal<string>('');

  private readonly svDragging = signal(false);
  private readonly hueDragging = signal(false);
  private readonly alphaDragging = signal(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  // ---- Derived view models -------------------------------------------------
  protected readonly hasValue = computed(() => this.value() !== null);

  protected readonly displayText = computed(() => this.value() ?? this.placeholder());

  protected readonly showClearButton = computed(
    () => this.clearable() && this.value() !== null && !this.isDisabled(),
  );

  /** Current color as an opaque rgb() — the alpha-rail base and chip fill. */
  protected readonly solidCss = computed(() => formatRgb({ ...this.hsva(), a: 1 }, false));

  /** Current color including alpha — for the trigger/preview chip. */
  protected readonly currentCss = computed(() => formatRgb(this.hsva(), true));

  protected readonly svValueText = computed(() => {
    const { s, v } = this.hsva();
    return `Saturation ${Math.round(s * 100)}%, brightness ${Math.round(v * 100)}%`;
  });

  protected readonly hueValueText = computed(() => `Hue ${Math.round(this.hsva().h)} degrees`);

  protected readonly alphaValueText = computed(
    () => `Alpha ${Math.round(this.hsva().a * 100)} percent`,
  );

  protected readonly svThumbLeft = computed(() => this.hsva().s * 100);
  protected readonly svThumbTop = computed(() => (1 - this.hsva().v) * 100);
  protected readonly hueThumbLeft = computed(() => (this.hsva().h / 360) * 100);
  protected readonly alphaThumbLeft = computed(() => this.hsva().a * 100);

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.description()) {
      return this.hintId;
    }
    return null;
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
    {
      originX: 'end' as const,
      originY: 'bottom' as const,
      overlayX: 'end' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
  ];

  protected readonly scrollStrategy = this.scrollStrategies.reposition();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('triggerEl');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panelEl');
  private readonly svRef = viewChild<ElementRef<HTMLElement>>('svArea');
  private readonly hueRef = viewChild<ElementRef<HTMLElement>>('hueTrack');
  private readonly alphaRef = viewChild<ElementRef<HTMLElement>>('alphaTrack');

  // ---- CVA -----------------------------------------------------------------
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
      this.hsva.set({ ...DEFAULT_HSVA });
      this.syncHexText();
      return;
    }
    const parsed = parseColor(value) ?? { ...DEFAULT_HSVA };
    this.hsva.set(parsed);
    this.value.set(formatColor(parsed, this.format(), this.showAlpha()));
    this.syncHexText();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  constructor() {
    // When the panel opens, move real focus onto the saturation/value plane so
    // the whole picker is keyboard-drivable immediately.
    effect(() => {
      if (!this.open()) {
        return;
      }
      queueMicrotask(() => this.svRef()?.nativeElement.focus());
    });
  }

  // ---- Value pipeline ------------------------------------------------------
  /** Formats the working color, pushes it to the model and notifies forms. */
  private emit(): void {
    const formatted = formatColor(this.hsva(), this.format(), this.showAlpha());
    this.value.set(formatted);
    this.onChange(formatted);
    this.syncHexText();
    this.liveMessage.set(formatted);
  }

  /** The panel's text field always edits hex, whatever the output `format`. */
  private syncHexText(): void {
    if (this.value() === null) {
      this.hexText.set('');
      return;
    }
    this.hexText.set(formatHex(this.hsva(), this.showAlpha()));
  }

  // ---- Open / close --------------------------------------------------------
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
    const current = this.value();
    if (current) {
      this.hsva.set(parseColor(current) ?? { ...DEFAULT_HSVA });
    }
    this.syncHexText();
    this.open.set(true);
  }

  protected close(returnFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.onTouched();
    if (returnFocus) {
      this.triggerRef().nativeElement.focus();
    }
  }

  // ---- Clear ---------------------------------------------------------------
  protected onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doClear();
  }

  private doClear(): void {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
    this.hsva.set({ ...DEFAULT_HSVA });
    this.syncHexText();
  }

  // ---- Saturation / Value plane -------------------------------------------
  protected onSvPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    try {
      el.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture is best-effort (unavailable in some test environments).
    }
    el.focus();
    this.svDragging.set(true);
    this.updateSvFromPointer(event);
  }

  protected onSvPointerMove(event: PointerEvent): void {
    if (this.svDragging()) {
      this.updateSvFromPointer(event);
    }
  }

  protected onSvPointerUp(event: PointerEvent): void {
    if (!this.svDragging()) {
      return;
    }
    this.svDragging.set(false);
    this.releaseCapture(event);
    this.onTouched();
  }

  private updateSvFromPointer(event: PointerEvent): void {
    const el = this.svRef()?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const s = clamp01((event.clientX - rect.left) / rect.width);
    const v = clamp01(1 - (event.clientY - rect.top) / rect.height);
    this.setSv(s, v);
  }

  protected onSvKeydown(event: KeyboardEvent): void {
    const stepAmt = event.shiftKey ? 0.1 : 0.01;
    let { s, v } = this.hsva();
    let handled = true;
    switch (event.key) {
      case 'ArrowLeft':
        s = clamp01(s - stepAmt);
        break;
      case 'ArrowRight':
        s = clamp01(s + stepAmt);
        break;
      case 'ArrowUp':
        v = clamp01(v + stepAmt);
        break;
      case 'ArrowDown':
        v = clamp01(v - stepAmt);
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      this.setSv(s, v);
    }
  }

  private setSv(s: number, v: number): void {
    this.hsva.update((h) => ({ ...h, s, v }));
    this.emit();
  }

  // ---- Hue rail ------------------------------------------------------------
  protected onHuePointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    try {
      el.setPointerCapture?.(event.pointerId);
    } catch {
      // best-effort
    }
    el.focus();
    this.hueDragging.set(true);
    this.updateHueFromPointer(event);
  }

  protected onHuePointerMove(event: PointerEvent): void {
    if (this.hueDragging()) {
      this.updateHueFromPointer(event);
    }
  }

  protected onHuePointerUp(event: PointerEvent): void {
    if (!this.hueDragging()) {
      return;
    }
    this.hueDragging.set(false);
    this.releaseCapture(event);
    this.onTouched();
  }

  private updateHueFromPointer(event: PointerEvent): void {
    const el = this.hueRef()?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const ratio = clamp01((event.clientX - rect.left) / rect.width);
    this.setHue(ratio * 360);
  }

  protected onHueKeydown(event: KeyboardEvent): void {
    const stepAmt = event.shiftKey ? 10 : 1;
    let h = this.hsva().h;
    let handled = true;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        h = Math.max(0, h - stepAmt);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        h = Math.min(360, h + stepAmt);
        break;
      case 'Home':
        h = 0;
        break;
      case 'End':
        h = 360;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      this.setHue(h);
    }
  }

  private setHue(h: number): void {
    this.hsva.update((x) => ({ ...x, h }));
    this.emit();
  }

  // ---- Alpha rail ----------------------------------------------------------
  protected onAlphaPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    try {
      el.setPointerCapture?.(event.pointerId);
    } catch {
      // best-effort
    }
    el.focus();
    this.alphaDragging.set(true);
    this.updateAlphaFromPointer(event);
  }

  protected onAlphaPointerMove(event: PointerEvent): void {
    if (this.alphaDragging()) {
      this.updateAlphaFromPointer(event);
    }
  }

  protected onAlphaPointerUp(event: PointerEvent): void {
    if (!this.alphaDragging()) {
      return;
    }
    this.alphaDragging.set(false);
    this.releaseCapture(event);
    this.onTouched();
  }

  private updateAlphaFromPointer(event: PointerEvent): void {
    const el = this.alphaRef()?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    this.setAlpha(clamp01((event.clientX - rect.left) / rect.width));
  }

  protected onAlphaKeydown(event: KeyboardEvent): void {
    const stepAmt = event.shiftKey ? 0.1 : 0.01;
    let a = this.hsva().a;
    let handled = true;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        a = clamp01(a - stepAmt);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        a = clamp01(a + stepAmt);
        break;
      case 'Home':
        a = 0;
        break;
      case 'End':
        a = 1;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      this.setAlpha(a);
    }
  }

  private setAlpha(a: number): void {
    this.hsva.update((x) => ({ ...x, a }));
    this.emit();
  }

  private releaseCapture(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement;
    try {
      el.releasePointerCapture?.(event.pointerId);
    } catch {
      // Capture may already be gone (pointercancel, test environments).
    }
  }

  // ---- Hex field -----------------------------------------------------------
  protected onHexInput(event: Event): void {
    this.hexText.set((event.target as HTMLInputElement).value);
  }

  protected onHexKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.commitHex();
    }
  }

  protected onHexBlur(): void {
    this.commitHex();
  }

  private commitHex(): void {
    const parsed = parseColor(this.hexText());
    if (parsed) {
      this.hsva.set(parsed);
      this.emit();
    } else {
      // Invalid input: silently revert to the current formatted value.
      this.syncHexText();
    }
  }

  // ---- Swatches ------------------------------------------------------------
  protected selectSwatch(hex: string): void {
    const parsed = parseColor(hex);
    if (!parsed) {
      return;
    }
    this.hsva.set(parsed);
    this.emit();
  }

  protected isSwatchActive(hex: string): boolean {
    const parsed = parseColor(hex);
    if (!parsed) {
      return false;
    }
    return formatHex(parsed, false) === formatHex(this.hsva(), false);
  }

  protected swatchCss(hex: string): string {
    const parsed = parseColor(hex);
    return parsed ? formatRgb(parsed, true) : hex;
  }

  // ---- Keyboard: trigger ---------------------------------------------------
  protected onTriggerKeydown(event: KeyboardEvent): void {
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
      }
    }
  }

  protected onTriggerBlur(): void {
    if (!this.open()) {
      this.onTouched();
    }
  }

  // ---- Keyboard: panel -----------------------------------------------------
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
}
