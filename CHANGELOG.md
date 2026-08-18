# Changelog

All notable changes to `@dmaster/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2026-08-18

### Added

- **`dm-date-picker`** — a single-date calendar field in the forms family
  (HeroUI-style color × variant, `ControlValueAccessor`). Native `Date` model
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
- **`dm-error`** — a standalone validation line (mat-error / HeroUI
  FieldError): danger color, `role="alert"`, fully projected content. It
  carries **no icon of its own** — project one (e.g. `<dm-icon>`) when you
  want one. `dm-form-field` accepts a projected `<dm-error>` and wires
  `aria-invalid` / `aria-describedby` automatically.
- **`dm-search-field`** — a text field specialised for search: leading
  magnifier, trailing clear button that appears once there is text, and
  search semantics (Escape clears, Enter emits `(searchSubmit)`). HeroUI-style
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
- HeroUI-inspired design language: flat fills, pill radii, elastic press, color × variant tokens.

[0.4.1]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.3.0...v0.4.1
[0.3.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/diegomn98/dmaster-ui-workspace/releases/tag/v0.1.2
