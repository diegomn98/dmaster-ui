# Changelog

All notable changes to `@dmaster/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Surface ramp re-spaced for contrast** (both themes). The dark steps sat
  ~1.02:1 apart, so flat fills, the toggle's raised chip and "elevated" panels
  were indistinguishable; the light `muted` (#f4f4f5) was near-invisible on
  white. New values — dark: `--dm-bg-subtle` #131316, `--dm-bg-muted` #232328,
  `--dm-bg-elevated` #2b2b32; light: `--dm-bg-muted` #e9e9ec. `--dm-fg-subtle`
  adjusted in both themes (#64646c light / #92929a dark) to keep placeholders
  ≥4.5:1 against the lightest dark surface (`--dm-bg-elevated`). Every flat
  field, track and panel becomes visibly separable without adding borders.
- **Tinted fills re-tuned for the new (lighter) dark `elevated` surface.**
  Composited over it, `--dm-{default,primary,danger,warning}-subtle` used to
  land 0.15–0.5 below the 4.5:1 floor against their paired text token (axe
  caught this across badge/button/alert/radio-group/select/pagination/dialog
  in dark) — worst case, `warning`'s alert-with-a-nested-flat-button pattern
  double-composites the tint, compounding the miss. Alphas lowered in dark:
  `default-subtle` 10%→6%, `primary-subtle` 26%→19%, `danger-subtle` 24%→19%,
  `warning-subtle` 20%→18% (sized for the double-composite case). Light theme
  and `success`/`secondary` were unaffected and untouched.
- **`dm-otp`** cells gain a hairline `--dm-border` edge on the flat variant
  (a 40px fill alone can't define the cell edge), and the **`dm-toggle-group`**
  raised chip gains a hairline ring on top of its shadow.

### Fixed

- **`dm-toggle-group`** no longer sets `aria-orientation` in `multiple` mode:
  the attribute is only valid on `role="radiogroup"` (single mode), not on the
  generic `role="group"` multiple uses — axe: `aria-allowed-attr`.

### Added

- **`dm-otp`** — one-time-code / PIN field: a row of single-character cells that
  behaves as one control. Typing advances, Backspace clears and steps back,
  arrows/Home/End navigate, paste is distributed across cells and positions are
  preserved (clearing a middle cell never shifts the rest). `length`, `mode`
  (`numeric | alphanumeric | text`), `variant` (`flat | bordered | faded |
underlined` — `bordered` is the elevated "white" surface), `groupSize`
  (separator after every N cells: `123 – 456`), `mask`, `size`, `color`,
  `autoFocus`, `(completed)`. `ControlValueAccessor` + `[(value)]`;
  `autocomplete="one-time-code"`. Defaults via `OTP_DEFAULTS` /
  `provideOtpDefaults()`.
- **`dm-button-group`** — joins a row/column of `dm-button`s into one attached
  bar: outer corners keep the pill radius, a subtle 1px seam separates the
  segments (bordered buttons collapse their shared border instead) and the
  per-button elastic press is disabled so the bar stays rigid. Appearance set
  on the group **cascades** to every button (`color`, `variant`, `size`,
  `radius`, `disabled` — each button's own inputs win). `orientation`,
  `fullWidth`, `role="group"` + `ariaLabel`; the split-button pattern is a
  group of two with a `dmMenuTrigger` caret. Defaults via
  `BUTTON_GROUP_DEFAULTS` / `provideButtonGroupDefaults()`.
- **`dm-toggle-group`** + **`dm-toggle`** — segmented control grouping toggle
  items in one flat, rounded surface. Two modes: exclusive **single** choice
  (`[(value)]`, `role="radiogroup"` with roving-tabindex arrow keys) or
  independent **multiple** toggles (bare `multiple`, `[(values)]`, `role="group"`
  with `aria-pressed` buttons). `color`, `size` (sm/md/lg), `orientation`,
  `fullWidth`, per-item `disabled`. Both models are separate; the whole group is
  a `ControlValueAccessor`. Defaults via `TOGGLE_GROUP_DEFAULTS` /
  `provideToggleGroupDefaults()`.
- **`dm-empty-state`** — placeholder for "there is nothing here yet": built-in
  inbox glyph (replaceable via the `dmEmptyStateIcon` slot), `title`,
  `description`, a centered actions row for projected buttons, `size`
  (`sm | md | lg`) and `hideIcon`. Defaults injectable via
  `EMPTY_STATE_DEFAULTS` / `provideEmptyStateDefaults()`.

## [0.6.0] - 2026-08-20

### Added

- **Six new components** — the last pieces for a 1.0 catalogue (41 in total):
  - **`dm-stepper`** + **`dm-step`** — horizontal/vertical multi-step wizard with
    `[(activeStep)]`, `linear` mode (can't skip past an incomplete step),
    per-step `completed` / `error` / `optional` / `disabled` states, keyboard
    focus between steps, `next()` / `previous()`, and `aria-current="step"`.
  - **`dm-rating`** — star rating as a `ControlValueAccessor` (`role="slider"`):
    `[(value)]`, `max`, `allowHalf` (hover + keyboard half-stars), a `readonly`
    display mode that renders fractional averages (`3.7`), sizes, colors and a
    custom `character` glyph. Clicking the current value clears to `0`.
  - **`dm-tree`** — data-driven hierarchical tree implementing the full
    WAI-ARIA Tree View pattern: `role="tree"` / `treeitem` / `group`,
    `aria-level` / `setsize` / `posinset`, roving tabindex, and the complete
    keyboard model (arrows, Home/End, Enter/Space, `*`). Single or multiple
    selection via `[(selectedIds)]`, `[(expandedIds)]`, `expandAll()` /
    `collapseAll()`, optional guide lines.
  - **`dm-file-upload`** — drag-and-drop dropzone over a hidden native
    `<input type="file">`: `[(files)]`, `multiple`, `accept`, `maxSize`,
    `maxFiles`, image thumbnails, per-file `progress`, `(fileRejected)` with a
    typed reason, `role="alert"` rejections, labelled remove buttons, and a
    pure `formatFileSize()` helper. SSR-safe object URLs.
  - **`dm-timeline`** + **`dm-timeline-item`** — vertical/horizontal event
    timeline: `<time datetime>` stamps, per-item `color` / `variant`
    (`solid` | `outlined`) / `state` (`active` pulse, `completed`, `error`),
    `align="alternate"` zig-zag, and a `dmTimelineMarker` directive to project
    a custom marker (avatar, icon). `role="list"` / `listitem` semantics.
  - **`dm-number-input`** — numeric spinbutton that reads as a sibling of the
    field family: `role="spinbutton"` with ± controls, `min` / `max` / `step` /
    `precision`, the full keyboard map (arrows, Shift×10, PageUp/Down,
    Home/End), press-and-hold, `Intl` formatting on blur (`formatOptions`),
    `hideControls`, and `ControlValueAccessor`.
- **`dm-button` — `ariaLabel` input.** Sets the accessible name on the inner
  `<button>` (not the host wrapper), so **icon-only buttons** announce their
  action to screen readers: `<dm-button ariaLabel="Delete"><dm-icon name="trash" /></dm-button>`.
- **Accessible text tokens for tinted variants** — a `--dm-{color}-text` token
  per semantic color (`primary`, `secondary`, `success`, `warning`, `danger`),
  in both themes. It is the color's base hue darkened (light) / lightened (dark)
  just enough to meet WCAG AA as small text on that color's `-subtle` fill. The
  `flat` / `light` / `faded` / `bordered` variants of `dm-badge`, `dm-button`
  and `dm-alert` now use it, so a flat chip's label is readable while the fill
  stays vivid.

### Fixed (accessibility — WCAG 2.1 AA)

The whole library is now verified against **axe-core (WCAG 2.1 A + AA)** in
light **and** dark on every documented example — the following were fixed:

- **Contrast.** `--dm-fg-subtle` (labels/placeholders) was below AA on both
  themes and is now compliant. Tinted-variant text (badge/button/alert `flat`
  etc.), `dm-avatar` initials, `dm-table`'s selection toolbar, `dm-select`'s
  selected option, `dm-tabs`' active tab, and `dm-error` text all met their
  fill at less than 4.5:1 and now use the AA `-text` shade. Solid `danger`
  (light and dark) and dark `primary` / `secondary` were nudged a touch deeper
  so their **white label** clears 4.5:1 — the hues are unchanged to the eye.
- **`dm-breadcrumbs`.** The `<ol>` now exposes proper `list` / `listitem`
  semantics through the custom-element wrapper (was flagged `list`/`listitem`).
- **`dm-kbd`.** Symbol keys use `role="img"` so their `aria-label` is valid
  (`aria-label` is prohibited on a bare `<kbd>`).
- **`dm-checkbox`.** The indeterminate state now uses the native `indeterminate`
  property instead of `aria-checked="mixed"` on a native checkbox
  (`aria-conditional-attr`).
- **`dm-avatar`.** A fallback with no `alt` and no `initials` is now decorative
  (no `role="img"`) instead of a nameless image (`role-img-alt`).
- **`dm-date-picker`.** Dropped `aria-required` / `aria-invalid` from the
  trigger `<button>` (unsupported on the button role — `aria-allowed-attr`);
  invalidity is still conveyed via the `aria-describedby` error text.

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

[0.6.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.3.0...v0.4.1
[0.3.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/diegomn98/dmaster-ui-workspace/releases/tag/v0.1.2
