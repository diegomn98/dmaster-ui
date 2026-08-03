/** Theme requested by the consumer. `auto` follows the OS preference. */
export type DmTheme = 'light' | 'dark' | 'auto';

/** Theme actually applied to the document after resolving `auto`. */
export type DmResolvedTheme = 'light' | 'dark';

/** Global density for controls and spacing. */
export type DmDensity = 'compact' | 'comfortable' | 'spacious';

/** Standard size scale shared by components. */
export type DmSize = 'sm' | 'md' | 'lg';

/**
 * A CSS size accepted by component inputs: a number is treated as pixels,
 * a string is passed through verbatim (`'50%'`, `'clamp(2rem, 10vw, 4rem)'`…).
 */
export type DmCssSize = string | number;
