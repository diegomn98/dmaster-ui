# Changelog

All notable changes to `@dmaster/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.1] - 2026-09-01

### Changed

- **npm `repository` now points at the public library repo `dmaster-ui`** instead
  of the `dmaster-ui-workspace` monorepo. The old flow was forced to point at the
  monorepo because npm provenance validates `repository.url` against the repo
  whose OIDC identity runs `npm publish`. The signed publish now runs from
  `dmaster-ui` itself — it checks out the monorepo at the release tag and
  publishes the byte-for-byte same build — so the package links to the library's
  own repository while keeping its signed, transparent provenance attestation. No
  API, runtime, or packaging change.

## [0.10.0] - 2026-08-31

### ⚠ BREAKING

- **`dm-search-field` — `readOnly` input renamed to `readonly`**, matching
  `dm-number-input` and the native attribute. Migration: replace
  `[readOnly]="…"` / `readOnly` on `dm-search-field` with `[readonly]="…"` /
  `readonly`. Behavior is unchanged (read-only field, no clear button).
- **`dm-popover` — imperative `open()` / `close()` renamed to `openPopover()` /
  `closePopover()`.** The `open` name is now the two-way `[(open)]` model.
  Migration: replace `popover.open()` / `popover.close()` with
  `popover.openPopover()` / `popover.closePopover()` (`toggle()` and `isOpen()`
  are unchanged).

### Added

- **Prebuilt color themes + `ng add` theme picker.** Nine curated brand palettes
  (Ocean, Cobalt, Iris, Grape, Rose, Ember, Sunset, Forest, Slate) ship as tiny
  CSS files on the new `@dmaster/ui/themes/*` subpath. Each recolors the app in
  **both** light and dark (the light/dark toggle keeps working) by overriding
  only `--dm-primary`; every derived token re-computes through the OKLCH cascade.
  `ng add @dmaster/ui` now prompts for a theme (or pass `--theme=<name>`) and
  wires the chosen CSS into `angular.json`. Every palette's label colour is
  gated at WCAG AA (>= 4.5:1) in both schemes by the build.
- **`ng generate @dmaster/ui:theme <name>` — custom theme scaffold.** Generates
  a plain-CSS theme seeded from a `--primary` color (with every other knob
  commented in) and wires it into `angular.json` for you. Default is a **global
  recolor** (`:root` + `[data-dm-theme='dark']`, so light/dark keeps working);
  `--named` emits a switchable `[data-dm-theme='<name>']` block and prints the
  `provideDmasterUI` registration. Both schematics now share `schematics/utils.ts`
  and are covered by `npm run verify:schematics`.
- **`dm-button` — `iconOnly` input (compact square shape).** A glyph-only button
  no longer stretches to a text button's `min-width`: set `iconOnly` (pair it
  with `ariaLabel`) and it renders as a compact square (width = height, no
  horizontal padding) at every size and radius. **`dm-copy-button` applies it
  automatically** whenever it has no visible `copyLabel`/`copiedLabel`, so
  icon-only copy buttons are now tidy squares instead of wide pills; adding a
  label opts back into the pill shape.
- **`dm-table` — custom cell and empty-state templates.** Project
  `ng-template[dmTableCell]="columnKey"` to render rich cells (badges, avatars,
  buttons — context: row, `index`, `column`) instead of the `string | number`
  the `cell` mapper allows, and `ng-template[dmTableEmpty]` (context flag
  `filtered`) to replace the built-in empty block with e.g. `dm-empty-state`.
  Both work in the native `<table>` mode **and** `virtualScroll`; search/sort
  still read `cell` / `sortValue` / `key`.
- **`dm-select` — custom option template.** Project `ng-template[dmSelectOption]`
  to replace the label + description block of every option row — icons, avatars,
  status dots, rich layouts (context: the `DmSelectItem` as `$implicit`, `index`,
  `selected`). The check indicator, disabled state, active highlight,
  `aria-selected` and click / keyboard handling stay built-in, and the template
  applies to sync `items` **and** server-driven `loadFn` rows alike.
  Multiple-mode trigger chips keep rendering the plain item `label`.
- **`dm-autocomplete` — custom option template.** Project
  `ng-template[dmAutocompleteOption]` to render rich suggestion rows (icons,
  avatars, highlighted matches — context: option, `index`, `active`) instead of
  the default label + description. The template replaces the row's inner
  content only: active highlight, disabled options, `aria-activedescendant` and
  mouse/keyboard selection keep working unchanged.
- **`dm-date-picker` — custom day-cell template.** Project
  `ng-template[dmDatePickerDay]` to replace the day number inside each day
  button — event dots, prices, availability badges (context: the day `Date`
  plus `selected` / `disabled` / `today` / `outside` flags). The button itself
  keeps every state attribute, ARIA wiring and interaction (selection, range
  preview, roving focus), it works in single **and** range mode, and the
  default render is unchanged when no template is projected.
- **`dm-tree` — custom node template.** Project `ng-template[dmTreeNode]` to
  render rich rows — icons, badges, counters — in place of the default label
  (context: the node, `level`, `expanded`, `selected`); the disclosure chevron,
  per-level indentation and the full treeitem ARIA/keyboard model stay
  untouched. `DmTreeNode.icon` is now honestly documented as data for this
  template: the default row never rendered it, and its dead empty `<span>` is
  gone from the default markup.
- **`dm-command` — custom item template.** Project `ng-template[dmCommandItem]`
  (context: the item as `$implicit` plus an `active` flag) to replace each
  result row's default label + shortcut chip with rich content — the natural
  place to render `DmCommandItem.icon`, descriptions or badges. The option
  shell (active highlight, ARIA, pointer/keyboard selection) and the filtering
  stay with the palette; without the template the default row is unchanged.
- **`dm-alert` — custom icon slot (`[dmAlertIcon]`).** Project any element with
  the `dmAlertIcon` attribute (import `DmAlertIconDirective`) to replace the
  built-in tone glyph inside the icon box — the tinted circle of the
  `flat`/`faded` variants is preserved, and `hideIcon` still hides everything.
- **`dm-avatar` — custom fallback slot (`[dmAvatarFallback]`).** A projected
  `dmAvatarFallback` element (import `DmAvatarFallbackDirective`) replaces the
  generic person icon at the end of the fallback chain — image → initials →
  custom fallback → default icon.
- **New outputs for reacting to state changes:**
  - **`dm-accordion` — `(itemToggled)`** emits `{ value, expanded }` on each
    expand/collapse (previously you had to diff the `expandedValues` model).
  - **`dm-stepper` — `(completed)`** fires when `next()` is called on the last
    reachable step, so a wizard can wire its submit there.
  - **`dm-slider` — `(changeEnd)`** fires on pointer release or after a keyboard
    step (commit-on-release), carrying the committed value — for deferring
    expensive work, unlike the continuous `valueChange`.
  - **`dm-select`, `dm-autocomplete`, `dm-date-picker` — `(openChange)`** emits a
    boolean when the overlay opens or closes.
  - **`dm-toast` — `DmToastRef.afterDismissed`** (a `Promise<void>`) resolves
    when the toast is gone (auto-dismiss, manual, or `dismissAll`).
- **`dm-select` — `compareWith` input.** Match a value against the options by an
  identity field instead of by reference, so object selections survive a form
  reset or a new-reference `writeValue`
  (`[compareWith]="(a, b) => a.id === b.id"`). Defaults to strict `===`.
- **`color` input on `dm-checkbox`, `dm-switch` and `dm-avatar`.** Brings them
  in line with the other selection controls (radio-group, rating, toggle-group):
  a semantic `color` (`default` | `primary` | `secondary` | `success` |
  `warning` | `danger`, default `primary`) tints the checked fill / track /
  initials. Each color uses its on-solid or `-text` token so contrast stays
  WCAG AA. Overridable per-app via the components' `*_DEFAULTS`.
- **`dm-button` — boolean `loading` input.** The ergonomic shortcut for the
  common async case: `<dm-button [loading]="saving()">` shows the spinner and
  disables the button, no string state needed. It accepts a bare attribute
  (`<dm-button loading>`). The full `state`
  (`idle`/`loading`/`success`/`error`) machine still works, and an explicit
  non-`idle` `state` takes precedence over `loading`.
- **`dm-autocomplete` — `filter` and `filterFn` inputs.** `[filter]="false"`
  turns off client-side filtering for server-driven suggestions (options are
  shown verbatim instead of being re-filtered by the typed text, which
  previously dropped async results whose label did not contain the query).
  `filterFn` supplies a custom matcher (e.g. match on a description or fuzzy).
- **`dm-file-upload` — custom dropzone content slot (`[dmDropzoneContent]`).**
  Project any element with the `dmDropzoneContent` attribute (import
  `DmDropzoneContentDirective`) to replace the built-in cloud icon + `label` +
  `hint` block inside the dropzone — drag & drop, click-to-browse, keyboard
  interaction and the focus ring stay untouched, and the default render is
  unchanged when nothing is projected.
- **`dm-breadcrumbs` — custom separator template.** Project
  `ng-template[dmBreadcrumbSeparator]` (context: `$implicit` = zero-based index
  of the preceding crumb) to replace the built-in chevron — and any `separator`
  string — between items with arbitrary markup (e.g. a `dm-icon`). Separators
  stay decorative (`aria-hidden`), the `separator` input remains the simple
  text case, and the default chevron is unchanged without the template.
- **`dm-stepper` — custom indicator template.** Project a single
  `ng-template[dmStepIndicator]` on the stepper to replace the indicator's
  inner content (number / check / error glyph) in **every** step header
  (context: `index`, `active`, `completed`, `error`). The indicator circle, its
  state styling hooks and the header button semantics stay untouched; without
  the template the default render is unchanged.
- **`dm-copy-button` — `disabled` input + custom icon slots.** A `disabled`
  attribute input forwards to the inner `dm-button` and blocks copying while
  set, and projected `[dmCopyIcon]` / `[dmCopiedIcon]` elements (import
  `DmCopyIconDirective` / `DmCopiedIconDirective`) replace the built-in copy /
  check glyphs — the `isCopied()` flip drives which slot shows, and a slot you
  don't project keeps its built-in glyph.
- **`dm-pagination` — derived page count (`length` + `pageSize`).** `totalPages`
  is now optional (`number | null`): pass the total item count as `length` and
  the items per page as `pageSize` (Material-paginator style) and the pager
  derives `Math.max(1, Math.ceil(length / pageSize))` itself. An explicit
  `totalPages` still wins, existing `[totalPages]` bindings keep working
  unchanged, and when neither pair resolves the pager renders a single page.
- **`DmDialogService` — `TemplateRef` support + `confirm()` helper.** `open()`
  now accepts `ComponentType<C> | TemplateRef<C>` (parity with
  `DmDrawerService`), so a one-off dialog needs no dedicated content component.
  New `confirm(options): Promise<boolean>` opens a ready-made confirmation
  dialog — title, optional message, cancel + confirm footer with a configurable
  `color` (default `primary`) — and resolves `true` on confirm, `false` on
  cancel, Escape or backdrop click. The library still ships no copy: `title`,
  `confirmLabel` and `cancelLabel` are required (`DmConfirmOptions`, which also
  passes `size` / `disableClose` / `panelClass` through); the content component
  `DmConfirmDialogComponent` is exported for reference.
- **`dm-toast` — title, action button and configurable position.**
  `DmToastOptions` gains `title` (bold line above the message) and `action`
  (`{ label, handler }` — a compact button that runs the handler and then
  dismisses that toast; `afterDismissed` resolves as usual). New
  `DmToastDefaults.position` (`'bottom-right' | 'bottom-left' | 'top-right' |
'top-left' | 'bottom-center' | 'top-center'`, default `'bottom-right'`) places
  the toast stack via `provideToastDefaults` — global by design: one container,
  read once when the first toast creates it. Default render is unchanged when
  the new options are not used.
- **`dmTooltip` — per-instance delays and `dmTooltipDisabled`.** New inputs
  `dmTooltipShowDelay` / `dmTooltipHideDelay` (`number | null`; `null` falls
  back to `TOOLTIP_DEFAULTS`) override the global show/hide delays per trigger,
  and `dmTooltipDisabled` (boolean attribute) suppresses the tooltip entirely —
  while `true` it never opens on hover or focus, an already-open panel closes
  and the `aria-describedby` wiring is removed.
- **`dm-checkbox` / `dm-switch` — new `lg` size.** `size` now accepts
  `'sm' | 'md' | 'lg'` on both controls: a 1.375rem checkbox box with a
  proportionally larger glyph and label, and a 3rem × 1.75rem switch track with
  a 1.375rem thumb. The `sm`/`md` scales and the `md` default are untouched.
- **`dm-badge` — `lg` size step.** `size` now accepts `'sm' | 'md' | 'lg'`: the
  new step scales padding and label font up proportionally (`--dm-text-sm`);
  `sm`/`md` render exactly as before and `md` stays the default.
- **`dm-divider` — `lineStyle` input (`'solid' | 'dashed' | 'dotted'`).** The
  default `solid` keeps the current background-fill rendering untouched;
  `dashed`/`dotted` draw the rule as a border (`border-top` horizontal,
  `border-left` vertical) reusing `--dm-divider-color` / `--dm-divider-thickness`,
  exposed as `data-line-style` on the host with a new `--dm-divider-style` token
  to override the border style.
- **`dm-color-picker` — output format.** New `format` input (`'hex'` default,
  `'rgb'`, `'hsl'`) picks how the committed value (model, CVA `onChange`, trigger
  text) is serialized: hex as before, `rgb(r g b)` / `rgb(r g b / a)`, or
  `hsl(h s% l%)` / `hsl(h s% l% / a)` (the alpha part follows `showAlpha`).
  `writeValue` accepts any of the three notations — hex, `rgb()`/`rgba()`,
  `hsl()`/`hsla()`, in legacy-comma or modern space/slash syntax — and
  re-serializes into the configured format; the in-panel hex field always edits
  hex.
- **`dm-otp` — field-family label / description / error scaffold.** New `label`
  (renders above the cells and names the `role="group"` wrapper via
  `aria-labelledby`), `description` (help text below, hidden while an `error` is
  set), `error` (`role="alert"`, flips the cells to the invalid/danger state and
  sets `aria-invalid`), `required` (marker on the label) and `readonly` (code
  stays visible and focusable, edits — typing, Backspace/Delete, paste — blocked)
  inputs, mirroring `dm-search-field` and `dm-number-input`. Default render is
  unchanged when none are set.
- **`dm-tabs` — lazy panels.** Add the bare `lazy` attribute to defer each
  panel's projected content until its tab is first activated; once visited a
  panel stays mounted (only hidden while inactive), so its state survives tab
  switches. The initially-active panel renders immediately and the default
  render is unchanged when `lazy` is off.
- **`dm-popover` — two-way `[(open)]`.** The open state is now a `model`, so you
  can drive and read the panel with `[(open)]` alongside the imperative
  `toggle()` / `openPopover()` / `closePopover()` methods (`isOpen()` still reads
  it); `opened` / `closed` fire exactly once per transition, including external
  open/close.

### Changed

- **`dm-radio-group` — `name` is now optional.** It defaults to a generated
  unique id; set it only when you rely on native `<form>` serialization.
  Backward compatible — groups that already pass `name` are unaffected.

### Fixed

- **Bare boolean attributes now work consistently across the library.** ~22
  components (slider, date-picker, color-picker, search-field, checkbox,
  switch, radio, tabs, pagination, accordion, alert, progress, icon, card,
  popover, menu, table, …) declared boolean inputs without `booleanAttribute`,
  so `<dm-slider disabled>` / `<dm-icon spin>` silently resolved to `false`.
  Every boolean input now coerces a bare attribute.
- **`dm-tabs` — a disabled tablist no longer activates via the keyboard.**
  `select()` and roving-focus navigation now honor the container `disabled`
  (previously only pointer events were blocked).
- **SSR — `dm-radio-group` / `dm-toggle-group`** now read the focused element
  through the injected `DOCUMENT` instead of the global `document`.

## [0.9.0] - 2026-08-27

### Added

- **`dm-copy-button`** + **`dmCopyToClipboard`** directive — copy text to the
  clipboard with built-in feedback. The component is a thin wrapper over
  `dm-button` (same `color` × `variant` × `size` × `radius`) whose icon flips
  from copy to a check for `resetDelay` ms; the directive adds the same
  behaviour to any button you already have (`[dmCopyToClipboard]="text"`,
  `exportAs` gives an `isCopied()` signal for feedback). Both emit `(copied)` /
  `(copyError)` and are SSR-safe — the write goes through the injected
  `Document` and the async Clipboard API, falling back to `execCommand('copy')`.
  Ships no built-in copy (`ariaLabel` / `copiedAriaLabel` / `copyLabel` are
  inputs). Defaults via `COPY_BUTTON_DEFAULTS` / `provideCopyButtonDefaults()`.

## [0.8.0] - 2026-08-27

### ⚠ BREAKING

- **`dm-paginated-select` merged into `dm-select`.** One combobox component:
  provide a `loadFn` and `dm-select` becomes server-driven — pages load via
  `rxResource` (initial fetch on open, infinite scroll or a "Load more"
  button), the inline filter turns into a debounced server search, and
  in-flight requests cancel automatically. Async now also works with
  `multiple`. Migration:
  - `<dm-paginated-select [loadFn]="…" [searchable]="true" />` →
    `<dm-select [loadFn]="…" filterable />`
  - `searchable`/`searchPlaceholder` → `filterable`/`filterPlaceholder`;
    `emptyLabel` → `noResultsLabel`; `selectedItem` (object) →
    `selectedItems` (array).
  - **Default change:** `emptyLabel` used to default to `'No results'` and
    `searchPlaceholder` to `'Search…'`; the new `noResultsLabel` and
    `filterPlaceholder` default to `''` (empty ⇒ no row / no placeholder). If
    you relied on the old visible text, pass `noResultsLabel` /
    `filterPlaceholder` explicitly. (In async mode `dm-select` also caches
    every item it has loaded, so a selected value's label survives a new
    search — `selectedItems` is only needed for a value never loaded at all.)
  - Types: `DmPaginatedSelectLoadFn` → `DmSelectLoadFn`,
    `DmPaginatedSelectResult` → `DmSelectLoadResult`,
    `DmPaginatedSelectItem` → `DmSelectItem`,
    `DmPaginatedSelectLoadMoreMode` → `DmSelectLoadMoreMode`, and the
    `DmPaginatedSelect{Color,Variant,Radius}` aliases → `DmSelect{Color,…}`.
    Defaults now live in `SELECT_DEFAULTS` / `provideSelectDefaults`
    (`pageSize`, `searchDebounceMs`, `loadMoreMode` included);
    `providePaginatedSelectDefaults` is gone.

### Added

- **Custom named themes.** Register alternate palettes with
  `provideDmasterUI({ themes: { midnight: { scheme: 'dark', label: 'Midnight' } } })`,
  author their tokens under a `[data-dm-theme='<name>']` CSS block, and apply
  them at runtime with `ThemeService.setTheme('<name>')`. New on
  `ThemeService`: `scheme()` (the light/dark base of the active theme — drives
  `toggle()`) and `themes()` (built-in + registered, for building a picker).
  `DmTheme` widens to `'light' | 'dark' | 'auto' | (string & {})`; new
  `DmThemeDefinition` type and `themes` field on `DmasterUIConfig`.
- **Derived color tokens — one override re-themes a whole color family.**
  `--dm-{color}-subtle` now derives from its base via `color-mix`, and
  `--dm-{color}-hover` / `--dm-{color}-text` derive via OKLCH relative color
  syntax at a fixed, calibrated lightness. Overriding `--dm-primary` (or any
  semantic color) automatically re-derives its hover shade, tinted-text shade
  and soft fill — with WCAG AA contrast quasi-guaranteed for arbitrary brand
  colors (fixed OKLCH lightness pins the contrast). Default rendering is
  visually identical (≤3/255 per channel vs the previous hand-picked hexes;
  ratios preserved to ±0.02).
- **Per-component design tokens — every component is now individually
  restylable.** All 44 components expose public `--dm-<component>-*` CSS
  custom properties (~300 tokens: surface bg/fg/border, radius, heights,
  paddings, part-specific knobs like `--dm-switch-track-bg-checked` or
  `--dm-table-header-bg`), consumed with their previous value as fallback —
  the default render is pixel-identical, overrides win at any scope (global,
  theme block, or a single subtree). Each component's `README.md` documents
  its tokens in a "Design tokens" table.
- **Scoped theming inside overlays.** `DmDialogConfig` and `DmDrawerConfig`
  accept `panelClass` (string or array), merged with the library's own panel
  classes — overlays portal to the document root, so this is the way to carry
  a subtree theme class into a dialog/drawer.
- **`dm-select`: clear (×) button in the inline filter.** Appears once there
  is text; clears and refocuses (in async mode it reloads page 0 with an
  empty query immediately, skipping the debounce). Escape is now two-stage
  while filtering — first press clears the text, second closes the panel
  (same pattern as `dm-search-field`). New `filterClearAriaLabel` input.

### Fixed

- **`dm-select`: the inline filter/search input was unusable.** A panel-level `mousedown` `preventDefault()` blocked click-to-focus
  on the input, and the open-time autofocus ran in a microtask that always lost
  the race against zoneless change detection (the overlay wasn't attached yet),
  so the input could never be focused at all. The `preventDefault` is now scoped
  to the listbox/actions rows only, and focus happens on the overlay's `attach`
  event (race-free). Typing while focus is still on the trigger is routed into
  the filter input.
- **`dm-select`: invisible click-blocking strip next to the panel.** The CDK pane is `display: flex`, so the panel collapsed to its
  content width and the leftover pane area (up to the full trigger width)
  silently swallowed clicks over the page. Panels now always fill the pane.
- **`dm-select` (async filter): Home/End pressed inside the filter input moved
  the active option instead of the caret.** No longer intercepted.
- **`dm-select` (async): a failed page in infinite mode no longer storms the
  server.** The infinite sentinel is suppressed on error (it would otherwise
  re-fire on the unchanged list), `loadNextPage` now advances from the last
  **loaded** page (a failed page is retried, never skipped), and the errored
  resource is read via `hasValue()`/`error()` instead of `value()` (which
  threw `ResourceValueError` into the effect). An errored empty panel no longer
  mislabels itself "no results". In `loadMoreMode="button"` the button stays
  and a click retries the failed page.
- **`dm-select` two-stage Escape and focus.** With a filter, the panel now sets
  `cdkConnectedOverlayDisableClose` — the CDK's own Escape→detach fired before
  the component handler (ignoring `defaultPrevented`), so a single Escape both
  cleared the filter and closed the panel, stranding focus on `<body>`. Escape
  is handled entirely by the component now. Tabbing out of a filterable/async
  select returns focus to the trigger (was dropping to `<body>` when the
  overlay pane detached).
- **`dm-select` (async): no-results / loading is now announced.** A persistent,
  visually-hidden `role="status"` region lives at component level (it used to
  mount already-populated inside the overlay, so the first "Loading…" and every
  empty-result state went unannounced). Removed an invalid `aria-label` on the
  presentational loading row, dropped a dead `[ariaLabel]` binding on the inner
  spinner, and moved the load-more `<button>` out of the `role="listbox"` (a
  button is not an allowed listbox child); keyboard users reach it by pressing
  ArrowDown on the last loaded option. `aria-activedescendant` is re-clamped
  when a shrinking server result would leave it pointing past the list.
- **`dm-select`: duplicate `@for` track keys (NG0955)** when the same group
  label appeared non-adjacently — group headers are now keyed positionally.

### Changed

- **`dm-select` overlay behavior.** The transparent
  backdrop is gone: clicking outside now closes the panel **and** reaches its
  target in one click (before, the first outside click was swallowed — e.g.
  opening another select needed two clicks). Page scroll is blocked while a
  panel is open (native-`<select>` behavior) instead of the panel repositioning
  and ending up floating detached from its trigger; the listbox's own scroll is
  unaffected.

## [0.7.0] - 2026-08-21

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
- **`dm-tabs`** visual polish: the selected tab is now semibold with a
  `default` cursor; unselected tabs get a subtle neutral hover wash on the
  contained variants (`underlined` stays flat, text-color only); tighter
  letter-spacing (−0.01em) and press scale (0.96); the `underlined` indicator
  thickens to 2.5px.

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

[0.10.1]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.3.0...v0.4.1
[0.3.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/diegomn98/dmaster-ui-workspace/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/diegomn98/dmaster-ui-workspace/releases/tag/v0.1.2
