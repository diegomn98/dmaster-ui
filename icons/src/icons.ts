/**
 * Curated icon set for `@dmaster/ui`.
 *
 * Original outline icons drawn on a 24×24 grid in a single visual language
 * (2px stroke, round caps/joins, `currentColor`) so they sit consistently next
 * to the components. Register them with `provideDmasterIcons(DM_ICONS)` and draw
 * with `<dm-icon name="…">`. Every icon is also exported individually for
 * tree-shaking (`import { search } from '@dmaster/ui/icons'`).
 *
 * These are hand-authored, not derived from any third-party set — no attribution
 * or extra license applies.
 */

/** Wrap inner markup in the shared outline frame (2px stroke, round, currentColor). */
const o = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

/** Wrap inner markup in a solid (filled) frame — for brand marks like GitHub. */
const s = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">${inner}</svg>`;

// ---- Navigation & chrome ---------------------------------------------------
export const check = o('<path d="M20 6 9 17l-5-5"/>');
export const x = o('<path d="M18 6 6 18M6 6l12 12"/>');
export const chevronDown = o('<path d="m6 9 6 6 6-6"/>');
export const chevronUp = o('<path d="m18 15-6-6-6 6"/>');
export const chevronLeft = o('<path d="m15 18-6-6 6-6"/>');
export const chevronRight = o('<path d="m9 18 6-6-6-6"/>');
export const chevronExpand = o('<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>');
export const arrowRight = o('<path d="M5 12h14M12 5l7 7-7 7"/>');
export const arrowLeft = o('<path d="M19 12H5M12 19l-7-7 7-7"/>');
export const menu = o('<path d="M4 6h16M4 12h16M4 18h16"/>');
export const moreHorizontal = o(
  '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
);
export const moreVertical = o(
  '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
);
export const externalLink = o(
  '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
);

// ---- Actions ---------------------------------------------------------------
export const search = o('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');
export const copy = o(
  '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
);
export const plus = o('<path d="M12 5v14M5 12h14"/>');
export const minus = o('<path d="M5 12h14"/>');
export const trash = o(
  '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
);
export const edit = o(
  '<path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
);
export const download = o(
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
);
export const upload = o(
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
);
export const filter = o('<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>');
export const refresh = o(
  '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
);
export const settings = o(
  '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
);

// ---- Status ----------------------------------------------------------------
export const checkCircle = o('<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>');
export const xCircle = o('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>');
export const info = o('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>');
export const warning = o(
  '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
);
export const bell = o(
  '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
);

// ---- Objects ---------------------------------------------------------------
export const user = o(
  '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
);
export const home = o(
  '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
);
export const mail = o(
  '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
);
export const lock = o(
  '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
);
export const calendar = o(
  '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
);
export const clock = o('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>');
export const eye = o(
  '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
);
export const eyeOff = o(
  '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 5.06-1.51"/><path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/><path d="m2 2 20 20"/>',
);
export const star = o(
  '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/>',
);
export const heart = o(
  '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>',
);
export const globe = o(
  '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
);
export const smartphone = o(
  '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
);
export const grid = o(
  '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
);
export const clipboard = o(
  '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
);

// ---- Theme -----------------------------------------------------------------
export const sun = o(
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
);
export const moon = o('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>');

// ---- Product / marketing ---------------------------------------------------
export const zap = o('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>');
export const layers = o(
  '<path d="m12 2 10 5-10 5-10-5 10-5z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
);
export const code = o('<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>');
export const box = o(
  '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
);
export const sparkles = o('<path d="M12 3 13.9 8.8 20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/>');
export const shieldCheck = o(
  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
);
export const palette = o(
  '<circle cx="13.5" cy="6.5" r=".8"/><circle cx="17.5" cy="10.5" r=".8"/><circle cx="8.5" cy="7.5" r=".8"/><circle cx="6.5" cy="12.5" r=".8"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.1-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.6-1.6H16a5.5 5.5 0 0 0 6-5.5C22 6 17.5 2 12 2z"/>',
);

// ---- Brand -----------------------------------------------------------------
export const github = s(
  '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.69-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.19 1.18a11.1 11.1 0 0 1 5.81 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>',
);

/**
 * The whole curated set as a name → markup map, ready for `provideDmasterIcons`.
 * Names are kebab-case (`chevron-down`) even though the individual exports are
 * camelCase (`chevronDown`).
 */
export const DM_ICONS: Record<string, string> = {
  check,
  x,
  'chevron-down': chevronDown,
  'chevron-up': chevronUp,
  'chevron-left': chevronLeft,
  'chevron-right': chevronRight,
  'chevron-expand': chevronExpand,
  'arrow-right': arrowRight,
  'arrow-left': arrowLeft,
  menu,
  'more-horizontal': moreHorizontal,
  'more-vertical': moreVertical,
  'external-link': externalLink,
  search,
  copy,
  plus,
  minus,
  trash,
  edit,
  download,
  upload,
  filter,
  refresh,
  settings,
  'check-circle': checkCircle,
  'x-circle': xCircle,
  info,
  warning,
  bell,
  user,
  home,
  mail,
  lock,
  calendar,
  clock,
  eye,
  'eye-off': eyeOff,
  star,
  heart,
  globe,
  smartphone,
  grid,
  clipboard,
  sun,
  moon,
  zap,
  layers,
  code,
  box,
  sparkles,
  'shield-check': shieldCheck,
  palette,
  github,
};

/** Every icon name in the curated set, sorted. */
export const DM_ICON_NAMES: string[] = Object.keys(DM_ICONS).sort();
