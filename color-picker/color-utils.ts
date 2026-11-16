import { DmColorPickerFormat } from './color-picker.types';

/**
 * Pure, dependency-free color math for `dm-color-picker`.
 *
 * The picker works internally in HSV(A) — the natural space for a
 * saturation/value plane plus a hue rail — and only crosses to RGB/hex at the
 * edges (parsing input, formatting the CVA value). Every function here is
 * deterministic and free of globals, so it is safe under SSR/prerender and
 * trivially unit-testable.
 */

/** A color in HSV(A): hue 0–360, saturation/value/alpha 0–1. */
export interface HSVA {
  /** Hue in degrees, 0–360. */
  h: number;
  /** Saturation, 0–1. */
  s: number;
  /** Value (brightness), 0–1. */
  v: number;
  /** Alpha, 0–1. */
  a: number;
}

/** A color in HSL(A): hue 0–360, saturation/lightness/alpha 0–1. */
export interface HSLA {
  /** Hue in degrees, 0–360. */
  h: number;
  /** Saturation, 0–1. */
  s: number;
  /** Lightness, 0–1. */
  l: number;
  /** Alpha, 0–1. */
  a: number;
}

/** An sRGB color with 8-bit channels and 0–1 alpha. */
export interface RGBA {
  /** Red, 0–255. */
  r: number;
  /** Green, 0–255. */
  g: number;
  /** Blue, 0–255. */
  b: number;
  /** Alpha, 0–1. */
  a: number;
}

/** Clamps a raw channel into a rounded 0–255 integer. */
export function clampChannel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Clamps a raw alpha into 0–1. */
function clampAlpha(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0, Math.min(1, value));
}

/**
 * Solid hue → sRGB (saturation and value pinned to 1). Handy when you only need
 * the pure spectrum color for a given angle.
 */
export function hueToRgb(hue: number): { r: number; g: number; b: number } {
  const { r, g, b } = hsvaToRgba({ h: hue, s: 1, v: 1, a: 1 });
  return { r, g, b };
}

/** HSV(A) → sRGB(A). Channels come out as rounded 0–255 integers. */
export function hsvaToRgba(hsva: HSVA): RGBA {
  const h = ((hsva.h % 360) + 360) % 360;
  const s = Math.max(0, Math.min(1, hsva.s));
  const v = Math.max(0, Math.min(1, hsva.v));
  const a = clampAlpha(hsva.a);

  const c = v * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp >= 0 && hp < 1) {
    [r1, g1, b1] = [c, x, 0];
  } else if (hp < 2) {
    [r1, g1, b1] = [x, c, 0];
  } else if (hp < 3) {
    [r1, g1, b1] = [0, c, x];
  } else if (hp < 4) {
    [r1, g1, b1] = [0, x, c];
  } else if (hp < 5) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }
  const m = v - c;
  return {
    r: clampChannel((r1 + m) * 255),
    g: clampChannel((g1 + m) * 255),
    b: clampChannel((b1 + m) * 255),
    a,
  };
}

/** sRGB(A) → HSV(A). */
export function rgbaToHsva(rgba: RGBA): HSVA {
  const r = clampChannel(rgba.r) / 255;
  const g = clampChannel(rgba.g) / 255;
  const b = clampChannel(rgba.b) / 255;
  const a = clampAlpha(rgba.a);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max, a };
}

/** sRGB(A) → HSL(A). */
export function rgbaToHsla(rgba: RGBA): HSLA {
  const { h, s, v, a } = rgbaToHsva(rgba);
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l, a };
}

/** HSL(A) → sRGB(A). Channels come out as rounded 0–255 integers. */
export function hslaToRgba(hsla: HSLA): RGBA {
  const l = Math.max(0, Math.min(1, hsla.l));
  const s = Math.max(0, Math.min(1, hsla.s));
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return hsvaToRgba({ h: hsla.h, s: sv, v, a: hsla.a });
}

/** Two-digit lowercase hex for a raw channel. */
function toHex2(value: number): string {
  return clampChannel(value).toString(16).padStart(2, '0');
}

/**
 * Formats an HSV(A) color as a lowercase hex string. `#rrggbb`, or `#rrggbbaa`
 * when `includeAlpha` is true.
 */
export function formatHex(hsva: HSVA, includeAlpha: boolean): string {
  const { r, g, b, a } = hsvaToRgba(hsva);
  let out = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
  if (includeAlpha) {
    out += toHex2(a * 255);
  }
  return out;
}

/** Formats an HSV(A) color as `rgb(...)` / `rgba(...)`. */
export function formatRgb(hsva: HSVA, includeAlpha: boolean): string {
  const { r, g, b, a } = hsvaToRgba(hsva);
  if (includeAlpha) {
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Formats an HSV(A) color as modern space-separated `rgb(r g b)`, or
 * `rgb(r g b / a)` when `includeAlpha` is true.
 */
export function formatRgbModern(hsva: HSVA, includeAlpha: boolean): string {
  const { r, g, b, a } = hsvaToRgba(hsva);
  if (includeAlpha) {
    return `rgb(${r} ${g} ${b} / ${Number(a.toFixed(2))})`;
  }
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Formats an HSV(A) color as `hsl(h s% l%)`, or `hsl(h s% l% / a)` when
 * `includeAlpha` is true. Hue is rounded to whole degrees, saturation and
 * lightness to whole percents.
 */
export function formatHsl(hsva: HSVA, includeAlpha: boolean): string {
  const { h, s, l, a } = rgbaToHsla(hsvaToRgba(hsva));
  const base = `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  if (includeAlpha) {
    return `hsl(${base} / ${Number(a.toFixed(2))})`;
  }
  return `hsl(${base})`;
}

/**
 * Serializes an HSV(A) color in the given `DmColorPickerFormat` — the single
 * entry point the picker uses to produce its committed value.
 */
export function formatColor(
  hsva: HSVA,
  format: DmColorPickerFormat,
  includeAlpha: boolean,
): string {
  switch (format) {
    case 'rgb':
      return formatRgbModern(hsva, includeAlpha);
    case 'hsl':
      return formatHsl(hsva, includeAlpha);
    default:
      return formatHex(hsva, includeAlpha);
  }
}

/** Expands a single hex nibble (`f`) into a byte (`ff`) and parses it. */
function nibble(ch: string): number {
  return parseInt(ch + ch, 16);
}

/** Strict `Number(...)`: `null` on the empty string and non-finite values. */
function parseNumber(text: string): number | null {
  if (text === '') {
    return null;
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

/** Parses a percentage-flavored channel (`50%` or bare `50`) into 0–1. */
function parsePercent(text: string): number | null {
  const n = parseNumber(text.replace(/%$/, ''));
  return n === null ? null : n / 100;
}

/** Parses an alpha channel: bare numbers are 0–1, `%`-suffixed are 0–100. */
function parseAlphaText(text: string): number | null {
  if (text.endsWith('%')) {
    return parsePercent(text);
  }
  return parseNumber(text);
}

/**
 * Parses a color string into HSV(A), or `null` on anything it doesn't
 * understand. Tolerant of surrounding whitespace and case. Accepts:
 * `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, and the `rgb()`/`rgba()`/`hsl()`/
 * `hsla()` functions in both legacy comma syntax (`rgb(r, g, b)`,
 * `hsla(h, s%, l%, a)`) and modern space syntax (`rgb(r g b / a)`,
 * `hsl(h s% l% / a)`).
 */
export function parseColor(input: string): HSVA | null {
  if (typeof input !== 'string') {
    return null;
  }
  const str = input.trim().toLowerCase();
  if (str === '') {
    return null;
  }

  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (/^[0-9a-f]{3}$/.test(hex)) {
      return rgbaToHsva({ r: nibble(hex[0]), g: nibble(hex[1]), b: nibble(hex[2]), a: 1 });
    }
    if (/^[0-9a-f]{4}$/.test(hex)) {
      return rgbaToHsva({
        r: nibble(hex[0]),
        g: nibble(hex[1]),
        b: nibble(hex[2]),
        a: nibble(hex[3]) / 255,
      });
    }
    if (/^[0-9a-f]{6}$/.test(hex)) {
      return rgbaToHsva({
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      });
    }
    if (/^[0-9a-f]{8}$/.test(hex)) {
      return rgbaToHsva({
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      });
    }
    return null;
  }

  const fn = str.match(/^(rgba?|hsla?)\(([^)]+)\)$/);
  if (fn) {
    const isHsl = fn[1].startsWith('hsl');
    let body = fn[2];

    // Modern syntax carries the alpha after a slash: `rgb(r g b / a)`.
    let alphaText: string | null = null;
    const slash = body.indexOf('/');
    if (slash !== -1) {
      alphaText = body.slice(slash + 1).trim();
      body = body.slice(0, slash);
    }

    const parts = body.includes(',')
      ? body.split(',').map((p) => p.trim())
      : body.trim().split(/\s+/);
    if (parts.some((p) => p === '')) {
      return null;
    }
    if (alphaText === null && parts.length === 4) {
      // Legacy syntax carries the alpha as a fourth comma part.
      alphaText = parts.pop()!;
    }
    if (parts.length !== 3) {
      return null;
    }
    const a = alphaText === null ? 1 : parseAlphaText(alphaText);
    if (a === null) {
      return null;
    }

    if (isHsl) {
      const h = parseNumber(parts[0].replace(/deg$/, ''));
      const s = parsePercent(parts[1]);
      const l = parsePercent(parts[2]);
      if (h === null || s === null || l === null) {
        return null;
      }
      return rgbaToHsva(hslaToRgba({ h, s, l, a }));
    }

    const r = parseNumber(parts[0]);
    const g = parseNumber(parts[1]);
    const b = parseNumber(parts[2]);
    if (r === null || g === null || b === null) {
      return null;
    }
    return rgbaToHsva({ r, g, b, a });
  }

  return null;
}
