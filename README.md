# @dmaster/ui

**Premium Angular UI components.** Standalone, signals-based, zoneless-ready, and fully themeable via CSS custom properties — with a clean, flat, pill-radius design language.

[![npm version](https://img.shields.io/npm/v/@dmaster/ui?color=006FEE&style=flat-square)](https://www.npmjs.com/package/@dmaster/ui)
[![npm downloads](https://img.shields.io/npm/dm/@dmaster/ui?color=338EF7&style=flat-square)](https://www.npmjs.com/package/@dmaster/ui)
[![license](https://img.shields.io/npm/l/@dmaster/ui?color=7EE7FC&style=flat-square)](https://github.com/diegomn98/dmaster-ui/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)
[![docs](https://img.shields.io/badge/docs-dmasterui.com-7c3aed?style=flat-square)](https://dmasterui.com)

**35 components · 3 languages (EN/ES/FR) in the docs · 0 runtime deps beyond Angular CDK · 500+ tests**

**[→ Browse every component live at dmasterui.com/components](https://dmasterui.com/components)** — each tile is the real, interactive component, not a screenshot.

**[▶ Try it now on StackBlitz](https://stackblitz.com/github/diegomn98/dmaster-ui-workspace/tree/main/examples/starter)** — a minimal zoneless Angular 20 app already wired up with the library; no install needed. (Source: [`examples/starter`](https://github.com/diegomn98/dmaster-ui-workspace/tree/main/examples/starter).)

---

## Why @dmaster/ui?

- **Modern Angular API** — `input()` / `output()` / `model()` signals, standalone components, no NgModules, no decorators
- **Zoneless-ready** — designed for `provideZonelessChangeDetection()` from day one
- **Flat, pill-radius design language** — flat colors, pill radii (`border-radius: 9999px` by default), elastic press scale, color × variant token system
- **Deeply themeable** — light / dark / auto via `data-dm-theme`; every visual decision is a `--dm-*` CSS custom property you can override
- **Accessible by default** — ARIA attributes on host elements, `:focus-visible` focus rings, touch targets ≥ 44px, `prefers-reduced-motion` support
- **CDK-powered overlays** — tooltip, popover, menu, dialog, drawer, toast and command palette built on `@angular/cdk`, no third-party overlay dependencies
- **Three density levels** — `compact`, `comfortable`, `spacious` via `data-dm-density`
- **Pay only for what you import** — fully tree-shakeable: a button costs ~3.6 kB gzip, a card ~1.3 kB, the entire 35-component library ~70 kB (see [Bundle size](#bundle-size))

---

## Installation

```bash
ng add @dmaster/ui
```

`ng add` installs `@angular/cdk`, registers the CDK overlay styles and wires the global stylesheet for you. Prefer manual setup?

```bash
npm install @dmaster/ui @angular/cdk
```

> **Peer dependencies:** `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/cdk` (^20) and `rxjs`

---

## Quick start

**1. Add the global styles** in `styles.scss`:

```scss
@use '@dmaster/ui/styles/index';
```

No Sass in your build? Use the precompiled CSS instead — add it to the `styles` array in `angular.json`:

```json
"styles": ["node_modules/@dmaster/ui/styles/dmaster-ui.css", "src/styles.css"]
```

**2. Add CDK overlay styles** in `angular.json` (required for tooltip, popover, menu, dialog, drawer, toast, command):

```json
"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", "src/styles.scss"]
```

**3. Register the provider** (optional — sets default theme and density):

```ts
import { provideDmasterUI } from '@dmaster/ui';

bootstrapApplication(AppComponent, {
  providers: [provideDmasterUI({ theme: 'auto', density: 'comfortable' })],
});
```

**4. Import and use any component:**

```ts
import { DmButtonComponent, DmBadgeComponent } from '@dmaster/ui';

@Component({
  imports: [DmButtonComponent, DmBadgeComponent],
  template: `
    <dm-button color="primary" variant="solid">Save</dm-button>
    <dm-badge color="success" variant="flat">Active</dm-badge>
  `,
})
export class MyComponent {}
```

---

## Components

35 components across 8 categories. Every row links to its live docs page (playground, API table, a11y notes).

### Primitives

| Component                                              | Selector      | Highlights                                                                 |
| ------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| [Skeleton](https://dmasterui.com/components/skeleton)  | `dm-skeleton` | Shimmer placeholder, wave animation                                        |
| [Spinner](https://dmasterui.com/components/spinner)    | `dm-spinner`  | Animated indicator, 3 sizes                                                |
| [Badge / Chip](https://dmasterui.com/components/badge) | `dm-badge`    | 7 variants · 6 colors · dot, shadow, bordered                              |
| [Avatar](https://dmasterui.com/components/avatar)      | `dm-avatar`   | Image + fallback initials, 5 sizes                                         |
| [Keyboard Key](https://dmasterui.com/components/kbd)   | `dm-kbd`      | Named keys resolve to their symbol (⌘, ⇧…), content projection             |
| [Icon](https://dmasterui.com/components/icon)          | `dm-icon`     | Font ligature, registered SVG, or projected `<svg>` — 3 modes, 1 primitive |

### Layout

| Component                                               | Selector       | Highlights                                    |
| ------------------------------------------------------- | -------------- | --------------------------------------------- |
| [Card](https://dmasterui.com/components/card)           | `dm-card`      | Container queries, shadow variants            |
| [Accordion](https://dmasterui.com/components/accordion) | `dm-accordion` | Animated, single/multiple open, keyboard nav  |
| [Divider](https://dmasterui.com/components/divider)     | `dm-divider`   | Horizontal/vertical, optional projected label |

### Feedback

| Component                                             | Selector      | Highlights                                               |
| ----------------------------------------------------- | ------------- | -------------------------------------------------------- |
| [Progress](https://dmasterui.com/components/progress) | `dm-progress` | Determinate/indeterminate, striped, value label          |
| [Alert](https://dmasterui.com/components/alert)       | `dm-alert`    | Color × variant, semantic icon, dismissible, action slot |

### Buttons

| Component                                         | Selector    | Highlights                                                              |
| ------------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| [Button](https://dmasterui.com/components/button) | `dm-button` | 7 variants · 6 colors · idle/loading/success/error states · live region |

### Forms

| Component                                                             | Selector                      | Highlights                                                                                 |
| --------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| [Switch](https://dmasterui.com/components/switch)                     | `dm-switch`                   | ControlValueAccessor, 3 sizes                                                              |
| [Checkbox](https://dmasterui.com/components/checkbox)                 | `dm-checkbox`                 | ControlValueAccessor, indeterminate state                                                  |
| [Radio Group](https://dmasterui.com/components/radio-group)           | `dm-radio-group` + `dm-radio` | ControlValueAccessor, horizontal/vertical                                                  |
| [Select](https://dmasterui.com/components/select)                     | `dm-select`                   | Single or multiple (chips), inline filter, option groups, select-all, keyboard nav, CVA    |
| [Autocomplete](https://dmasterui.com/components/autocomplete)         | `dm-autocomplete`             | Free-text input with filtered suggestions, `optionSelected` event, keyboard nav, CVA       |
| [Paginated Select](https://dmasterui.com/components/paginated-select) | `dm-paginated-select`         | Server-driven async load, infinite pagination                                              |
| [Search Field](https://dmasterui.com/components/search-field)         | `dm-search-field`             | Leading icon, clear button, Escape clears, Enter submits                                   |
| [Date Picker](https://dmasterui.com/components/date-picker)           | `dm-date-picker`              | Day→month→year calendar, `Intl`-only (no date library), reactive locale (`DM_DATE_LOCALE`) |
| [Color Picker](https://dmasterui.com/components/color-picker)         | `dm-color-picker`             | Saturation/hue/alpha area, editable hex, swatches                                          |
| [Slider](https://dmasterui.com/components/slider)                     | `dm-slider`                   | Pointer drag + full keyboard map, value bubble, marks                                      |
| [Form Field](https://dmasterui.com/components/form-field)             | `dm-form-field` + `dmInput`   | Label, hint, error, wraps any native input/textarea/select                                 |
| [Error](https://dmasterui.com/components/error-message)               | `dm-error`                    | Validation line, `role="alert"`, no built-in icon (project your own)                       |

### Navigation

| Component                                                   | Selector                                | Highlights                                             |
| ----------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| [Breadcrumbs](https://dmasterui.com/components/breadcrumbs) | `dm-breadcrumbs` + `dm-breadcrumb-item` | Router-agnostic, collapsible                           |
| [Tabs](https://dmasterui.com/components/tabs)               | `dm-tabs` + `dm-tab` + `dm-tab-panel`   | 5 variants, sliding indicator, full-width, scroll-fade |
| [Pagination](https://dmasterui.com/components/pagination)   | `dm-pagination`                         | Windowed pager, two-way page binding                   |

### Data Display

| Component                                       | Selector   | Highlights                                       |
| ----------------------------------------------- | ---------- | ------------------------------------------------ |
| [Table](https://dmasterui.com/components/table) | `dm-table` | Search → sort → paginate pipeline, row selection |

### Overlays (require CDK)

| Component                                           | Selector / Service    | Highlights                                        |
| --------------------------------------------------- | --------------------- | ------------------------------------------------- |
| [Tooltip](https://dmasterui.com/components/tooltip) | `dmTooltip` directive | 12 placements, open/close delay                   |
| [Popover](https://dmasterui.com/components/popover) | `dm-popover`          | Rich floating panel, arrow follows the real flip  |
| [Menu](https://dmasterui.com/components/menu)       | `dm-menu`             | WAI-ARIA menu, `FocusKeyManager`, typeahead       |
| [Dialog](https://dmasterui.com/components/dialog)   | `DmDialogService`     | Typed data, typed return, backdrop click to close |
| [Drawer](https://dmasterui.com/components/drawer)   | `DmDrawerService`     | Slide-in panel over `cdk/dialog`                  |
| [Toast](https://dmasterui.com/components/toast)     | `DmToastService`      | Queued notifications, signal-driven state         |
| [Command](https://dmasterui.com/components/command) | `dm-command`          | ⌘K command palette, fuzzy filter                  |

---

## Theming

Tokens live on `<html>` attributes — no class toggling, no JavaScript:

```ts
// Auto (follows prefers-color-scheme)
provideDmasterUI({ theme: 'auto' });

// Force dark
document.documentElement.setAttribute('data-dm-theme', 'dark');
```

Override any token globally:

```scss
:root {
  --dm-primary: #7c3aed; // swap the primary color
  --dm-radius-full: 0.5rem; // rectangular buttons instead of pill
  --dm-duration-base: 100ms; // faster animations
}
```

---

## SSR / prerendering

The library is server-safe: no component or service touches `window`, `localStorage` or browser-only APIs at construction time — `matchMedia` is feature-detected through Angular's `DOCUMENT`, and overlays only open on user interaction. The [docs site](https://dmasterui.com) itself is fully statically prerendered with `@angular/ssr` as a permanent smoke test.

---

## Bundle size

Fully tree-shakeable — your app only pays for the components it imports. Measured with the same pipeline the Angular CLI applies to published libraries (linker + minify + gzip, `@angular/*` and `rxjs` external):

| Import                    | Gzip     |
| ------------------------- | -------- |
| `DmCardComponent`         | ~1.3 kB  |
| `DmBadgeComponent`        | ~1.8 kB  |
| `DmButtonComponent`       | ~3.6 kB  |
| `DmSelectComponent`       | ~5.4 kB  |
| `DmTableComponent`        | ~10.4 kB |
| **Entire library** (35)   | ~70 kB   |
| Global CSS (tokens+reset) | ~4 kB    |

Reproduce the full per-component table from the repo with `npm run size`.

---

## Who is this for?

@dmaster/ui is a good fit for:

- **SaaS dashboards** — tables, forms, overlays, and toasts out of the box
- **Admin panels** — dense layouts with consistent design tokens and three density modes
- **Component-library starters** — use as a base or reference architecture for signals-based Angular components
- **Teams migrating to zoneless Angular** — built for `provideZonelessChangeDetection()` from day one

---

## Compared to other Angular libraries

There's no shortage of component libraries in the Angular ecosystem. Here's how @dmaster/ui differs from the ones you're most likely evaluating alongside it — read this as "different tradeoffs," not "objectively better":

|                     | **@dmaster/ui**                                                  | Angular Material                                   | PrimeNG                                      | Taiga UI                                 | Spartan · ng-primitives                                                  |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| **API style**       | `input()`/`output()`/`model()` signals, standalone, no NgModules | Mix of legacy + newer APIs, NgModule-based         | NgModule + standalone hybrid                 | Signals, standalone                      | Signals, standalone                                                      |
| **What you get**    | Pre-styled components, own flat/pill design language             | Pre-styled components (Material Design)            | Pre-styled components, several theme presets | Pre-styled components, own design system | **Unstyled primitives** — copy-paste styled blocks you own, shadcn-style |
| **Theming**         | CSS custom properties only, no runtime engine                    | Sass theming API + Material 3 design tokens        | Runtime theme switcher + design tokens       | CSS custom properties                    | Tailwind-based, per-component                                            |
| **Component count** | 35                                                               | Comprehensive Material Design set (CDK + Material) | Very large, kitchen-sink surface area        | 130+ (their own count)                   | 55+ primitives (their own count)                                         |
| **Zoneless**        | Built for it from day one                                        | Supported                                          | Supported                                    | Supported                                | Supported                                                                |
| **Install model**   | `ng add`, then import & use                                      | `ng add`, then import & use                        | Install & import                             | Install & import                         | CLI **copies component source into your repo**                           |

If you want a batteries-included, opinionated kit you install and start using immediately — that's @dmaster/ui, Angular Material, PrimeNG or Taiga UI, and the choice between them comes down to design language and API generation. If you want unstyled, accessible primitives you fully own the markup and CSS for, Spartan/ng-primitives is the better starting point.

---

## Contributing

Issues and PRs are welcome on [GitHub](https://github.com/diegomn98/dmaster-ui).

---

## License

MIT © [Diego Maestro](https://github.com/diegomn98)
