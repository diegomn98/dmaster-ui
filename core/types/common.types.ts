/**
 * Theme requested by the consumer. `auto` follows the OS preference; `light`
 * and `dark` are built in. Any other string is a **custom named theme**
 * registered via `provideDmasterUI({ themes })` — its CSS lives under
 * `[data-dm-theme='<name>']`. The `(string & {})` keeps autocomplete on the
 * built-ins while still accepting custom names.
 */
export type DmTheme = 'light' | 'dark' | 'auto' | (string & {});

/**
 * The base light/dark scheme a theme resolves to — drives OS integration
 * (`color-scheme`) and the light/dark toggle. `auto` resolves to one of these;
 * a custom named theme declares its scheme when registered.
 */
export type DmResolvedTheme = 'light' | 'dark';

/** Metadata for a custom named theme, registered via `provideDmasterUI`. */
export interface DmThemeDefinition {
  /** Base scheme the theme is built on — used for the toggle and `color-scheme`. */
  readonly scheme: DmResolvedTheme;
  /** Human-readable name for building a theme picker (optional). */
  readonly label?: string;
}

/** Global density for controls and spacing. */
export type DmDensity = 'compact' | 'comfortable' | 'spacious';

/** Standard size scale shared by components. */
export type DmSize = 'sm' | 'md' | 'lg';

/**
 * A CSS size accepted by component inputs: a number is treated as pixels,
 * a string is passed through verbatim (`'50%'`, `'clamp(2rem, 10vw, 4rem)'`…).
 */
export type DmCssSize = string | number;
