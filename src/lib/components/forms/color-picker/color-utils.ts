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

/** Expands a single hex nibble (`f`) into a byte (`ff`) and parses it. */
function nibble(ch: string): number {
  return parseInt(ch + ch, 16);
}

/**
 * Parses a color string into HSV(A), or `null` on anything it doesn't
 * understand. Tolerant of surrounding whitespace and case. Accepts:
 * `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(r, g, b)`, `rgba(r, g, b, a)`.
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

  const fn = str.match(/^rgba?\(([^)]+)\)$/);
  if (fn) {
    const parts = fn[1].split(',').map((p) => p.trim());
    if (parts.length < 3 || parts.length > 4) {
      return null;
    }
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts.length === 4 ? Number(parts[3]) : 1;
    if ([r, g, b, a].some((n) => !Number.isFinite(n)) || parts.some((p) => p === '')) {
      return null;
    }
    return rgbaToHsva({ r, g, b, a });
  }

  return null;
}
