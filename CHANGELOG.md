# Changelog

All notable changes to `@dmaster/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-08-19

### Added

- **`dm-autocomplete`** — a free-text field that suggests options as you type.
  Unlike `dm-select`, the trigger is an editable input: type anything, filter
  the suggestions in a CDK overlay, and pick one or keep your own text. Full
  keyboard navigation, an `(optionSelected)` output carrying the chosen option,
  `openOnFocus`, `ControlValueAccessor`, and `aria-autocomplete="list"`.
- **Bundle-size audit** — the README now documents the real tree-shaken cost
  per component (a button is ~3.6 kB gzip; the entire library ~70 kB),
  measured with the same linker + minify pipeline the Angular CLI applies to
  published libraries. Reproducible from the repo with `npm run size`.

### Changed

- **`dm-select`** gained **multiple selection** (`multiple` + `[(values)]`,
  rendered as removable chips), an **inline filter** (`filterable` +
  `filterPlaceholder` / `noResultsLabel`), **option groups**
  (`DmSelectGroup` / `DmSelectOptionOrGroup` in the `items` input), and
  **select-all / clear-all** actions (`selectAllLabel` / `clearAllLabel`).
  Single-select is unchanged — the new modes are additive (`value` stays for
  single, `values` is separate for multiple), so existing usage is untouched.
  Boolean inputs (`multiple`, `filterable`, `clearable`, `disabled`,
  `required`) accept bare attributes via `booleanAttribute`. The trigger is now
  a `div[role="combobox"]` (was a `<button>`) so chips can carry remove buttons.
- **`dm-date-picker`** gained a **range** mode (`range` attribute +
  `[(rangeValue)]`, a `DmDateRange { start; end }`): pick a start, then an end,
  with a live hover-preview band between them and a `"start – end"` trigger.
  Single mode (`[(value)]`) is unchanged — the range value flows through a
  separate model, so nothing breaks.
- **`dm-table`** gained a **virtual-scroll** mode (inputs `virtualScroll`,
  `rowHeight`, `viewportHeight`): rows render inside a
  `cdk-virtual-scroll-viewport` as a `role="table"` div-grid, so thousands of
  rows stay smooth without bloating the DOM. Sticky header, selection, sort and
  search all still work. Off by default — the native `<table>` path is
  unchanged.
- The **`dm-select` / `dm-autocomplete` dropdown panels** were visually
  refined: the active/selected option now uses the primary tint (matching the
  trigger's focus ring instead of a flat grey), the inline filter is a filled
  search pill, and the panel gains a hairline border, a softer lifted shadow
  and a slim custom scrollbar.
- **Documentation site** — every one of the 35 component pages was brought
  to the same standard: ~6 realistic demos each (up from 1–2 on the thinnest
  pages) plus a **"Composition"** recipe that uses the component together
  with its siblings as real product UI (a pricing card, a signup form, a
  billing panel, an admin table, a shopping-cart drawer…), each with
  Preview / HTML / TS tabs. Form pages now consistently demonstrate
  validation with `<dm-error>`. All new copy is translated (en/es/fr).

### Fixed

- **`dm-form-field`** — its control wrapper is now a positioning context
  (`position: relative`), so a projected trailing icon (e.g. a show/hide
  password toggle) can be absolutely positioned inside it without extra
  markup. Purely additive CSS — no visual change unless a consumer opts in.

## [0.4.2] - 2026-08-18

### Changed

- Rewrote design-language copy across the README, CHANGELOG, JSDoc comments,
  per-component `README.md` files, SCSS comments and the docs site's en/es/fr
  translations to describe the library's flat, pill-radius, color × variant
  design language on its own terms, without attributing it to another UI
  library.

## [0.4.1] - 2026-08-18

### Added

- **`dm-date-picker`** — a single-date calendar field in the forms family
  (color × variant, `ControlValueAccessor`). Native `Date` model
  normalized to local midnight; **no date library** — pure, timezone-safe
  calendar math plus `Intl.DateTimeFormat` for every month/weekday name and the
  trigger text, so the whole calendar follows the `locale` input and prerenders.
  Layered day → month → year navigation, full WAI-ARIA keyboard support
  (roving-tabindex grid, PageUp/Down for month, Shift for year), `min`/`max` and
  an `isDateDisabled` predicate, and a "Today" quick-jump. `firstDayOfWeek`
  defaults to `'auto'`: the week convention is derived from the locale's CLDR
  week data (Monday in Spain/France, Sunday in the US, Saturday in much of
  MENA), and day digits also render through `Intl` (native numerals for
  `ar`/`fa`). Locale can also be provided app-wide and reactively via the new
  **`DM_DATE_LOCALE`** token (`provideDateLocale`), which accepts a plain
  string or a `Signal<string>` — the reactive analogue of `MAT_DATE_LOCALE`, so
  every picker re-renders live on a language switch. `provideDatePickerDefaults`
  also covers `displayFormat` and `weekdayFormat`.
- **`dm-color-picker`** — a full color picker in the forms family
  (`ControlValueAccessor`, hex string value): a draggable saturation/brightness
  area, hue slider, optional alpha slider, editable hex input and quick swatches,
  in a field-family trigger that opens a CDK overlay. Pure `color-utils`
  (hex ⇄ rgb ⇄ hsv) underneath; `role="slider"` areas with `aria-valuetext`.
- **`dm-error`** — a standalone validation line (the Angular equivalent of
  `mat-error`): danger color, `role="alert"`, fully projected content. It
  carries **no icon of its own** — project one (e.g. `<dm-icon>`) when you
  want one. `dm-form-field` accepts a projected `<dm-error>` and wires
  `aria-invalid` / `aria-describedby` automatically.
- **`dm-search-field`** — a text field specialised for search: leading
  magnifier, trailing clear button that appears once there is text, and
  search semantics (Escape clears, Enter emits `(searchSubmit)`).
  `color` × `variant`, full `ControlValueAccessor` support.
- **Icon system.** `dm-icon` draws an icon three ways: a **Material Symbols font
  ligature** from its text content (`<dm-icon>home</dm-icon>`, thousands of icons,
  like `mat-icon`), a **registered SVG** by `name`, or a **projected `<svg>`**.
  Font mode exposes the variable-font axes via `fill` (outlined ⇄ filled),
  `weight` and `family` (`outlined`/`rounded`/`sharp`). A `color` input takes a
  semantic token (`primary`, `success`, …) or any CSS color; otherwise it inherits
  `currentColor`. Sizes via `size`, `spin` for loaders, decorative by default
  (`label` promotes it to `role="img"`). SVG icons are registered app-wide with
  `provideDmasterIcons(...)` (merges multiple sets) and resolved by `DmIconRegistry`.
- **`@dmaster/ui/icons`** — a new entry point shipping `DM_ICONS`, a curated set
  of ~53 original outline icons (24×24, 2px stroke), plus individual tree-shakeable
  exports and `DM_ICON_NAMES`.

## [0.3.0] - 2026-08-14

### Added

- **11 new components**, all standalone, signals-based, `OnPush`, accessible and themeable via CSS variables:
  - Primitives: `dm-kbd` (keyboard-key display; named keys resolve to their symbol, content projection for letters, `sm`/`md` sizes).
  - Layout: `dm-divider` (horizontal/vertical, optional projected label).
  - Feedback (new category): `dm-progress` (determinate/indeterminate, striped, value label) and `dm-alert` (color × variant, semantic icon, dismissible, action slot).
  - Forms: `dm-slider` (`ControlValueAccessor`, pointer drag + full keyboard, value bubble, marks).
  - Navigation: `dm-breadcrumbs` (+ `dm-breadcrumb-item`, router-agnostic, collapsing) and `dm-pagination` (windowed pager, two-way `page`, localizable labels).
  - Overlays (CDK): `dm-menu` (WAI-ARIA menu pattern, `FocusKeyManager`, type-ahead, sections/dividers/shortcuts), `dm-popover` (rich click-triggered panel with an arrow that follows the flip), `DmDrawerService` (edge-anchored panel over `cdk/dialog`, four placements) and `dm-command` (⌘K command palette: combobox + listbox, grouped/filterable actions, global hotkey, focus trap, restores focus on close).
- Published `engines` range (Node `^20.19.0 || ^22.12.0 || >=24.0.0`).

### Changed

- Releases are now published with signed npm **provenance** (Sigstore attestation via GitHub Actions OIDC). `repository` points to the monorepo (`dmaster-ui-workspace`) with a `directory` field so the provenance validates.

## [0.2.0] - 2026-08-13

### Added

- `rxjs` declared as an explicit peer dependency (it appears in the public typings via `dm-paginated-select`).
- `exports` subpaths for stylesheets: `@dmaster/ui/styles`, `@dmaster/ui/styles/index` and `@dmaster/ui/styles/*` now resolve under strict `exports`-aware tooling (Vite, Nx, pnpm).
- Precompiled `styles/dmaster-ui.css` for consumers without Sass.
- `ng add @dmaster/ui` schematic: installs `@angular/cdk`, registers the CDK overlay styles and wires the global stylesheet.
- `LICENSE` and `CHANGELOG.md` shipped inside the npm package.
- SSR: core services (`ThemeService`, `DensityService`, `ReducedMotionService`) are verified server-safe (no direct `window`/`localStorage` access; `matchMedia` is feature-detected via `DOCUMENT`).

## [0.1.2] - 2026-08-13

Initial public surface.

### Added

- **18 components** across 7 categories, all standalone, signals-based (`input()` / `output()` / `model()`), `OnPush`, zoneless-ready:
  - Primitives: `dm-avatar`, `dm-badge`, `dm-skeleton`, `dm-spinner`.
  - Layout: `dm-card`, `dm-accordion` (+ `dm-accordion-item`).
  - Buttons: `dm-button` (color × variant system, idle/loading/success/error states with live region).
  - Forms: `dm-checkbox`, `dm-switch`, `dm-form-field` + `dmInput`, `dm-radio-group` (+ `dm-radio`), `dm-select`, `dm-paginated-select` (server-driven, `rxResource`-based). All form controls implement `ControlValueAccessor`.
  - Navigation: `dm-tabs` (+ `dm-tab`, `dm-tab-panel`) with animated sliding indicator.
  - Data display: `dm-table` (search → sort → paginate pipeline, selection, server-side mode).
  - Overlays (CDK-based): `dmTooltip`, `DmDialogService`, `DmToastService`.
- Theming system: `--dm-*` design tokens, light/dark/auto via `data-dm-theme`, three densities via `data-dm-density`, `prefers-reduced-motion` support.
- Per-component injectable defaults (`provideXxxDefaults()`), global `provideDmasterUI()`.
- Flat, pill-radius design language: flat fills, pill radii, elastic press, color × variant tokens.

[0.5.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.3.0...v0.4.1
[0.3.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/diegomn98/dmaster-ui-workspace/releases/tag/v0.1.2
