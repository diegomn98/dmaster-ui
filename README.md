# @dmaster/ui

**Premium Angular UI components.** Standalone, signals-based, zoneless-ready, and fully themeable via CSS custom properties — with a clean HeroUI-inspired design language.

[![npm version](https://img.shields.io/npm/v/@dmaster/ui?color=006FEE&style=flat-square)](https://www.npmjs.com/package/@dmaster/ui)
[![npm downloads](https://img.shields.io/npm/dm/@dmaster/ui?color=338EF7&style=flat-square)](https://www.npmjs.com/package/@dmaster/ui)
[![license](https://img.shields.io/npm/l/@dmaster/ui?color=7EE7FC&style=flat-square)](https://github.com/diegomn98/dmaster-ui/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)

---

## Why @dmaster/ui?

- **Modern Angular API** — `input()` / `output()` / `model()` signals, standalone components, no NgModules, no decorators
- **Zoneless-ready** — designed for `provideZonelessChangeDetection()` from day one
- **HeroUI design language** — flat colors, pill radii (`border-radius: 9999px` by default), elastic press scale, color × variant token system
- **Deeply themeable** — light / dark / auto via `data-dm-theme`; every visual decision is a `--dm-*` CSS custom property you can override
- **Accessible by default** — ARIA attributes on host elements, `:focus-visible` focus rings, touch targets ≥ 44px, `prefers-reduced-motion` support
- **CDK-powered overlays** — tooltip, dialog and toast built on `@angular/cdk`, no third-party overlay dependencies
- **Three density levels** — `compact`, `comfortable`, `spacious` via `data-dm-density`

---

## Installation

```bash
npm install @dmaster/ui
```

> **Peer dependencies:** `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/cdk` (^20)

---

## Quick start

**1. Add the global styles** in `styles.scss`:

```scss
@use '@dmaster/ui/styles/index';
```

**2. Add CDK overlay styles** in `angular.json` (required for tooltip, dialog, toast):

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

### Primitives

| Component | Selector | Highlights |
|---|---|---|
| Button | `dm-button` | 7 variants · 6 colors · loading / success / error states · live region |
| Badge / Chip | `dm-badge` | 7 variants · 6 colors · dot, shadow, bordered |
| Avatar | `dm-avatar` | image + fallback initials · 5 sizes |
| Spinner | `dm-spinner` | animated indicator · 3 sizes |
| Skeleton | `dm-skeleton` | shimmer placeholder · wave animation |

### Forms

| Component | Selector | Highlights |
|---|---|---|
| Switch | `dm-switch` | ControlValueAccessor · 3 sizes |
| Checkbox | `dm-checkbox` | ControlValueAccessor · indeterminate state |
| Form Field | `dm-form-field` + `dmInput` | label · hint · error · native input wrapper |
| Select | `dm-select` | CDK overlay · keyboard nav · typeahead · CVA |
| Paginated Select | `dm-paginated-select` | async load · infinite pagination · CDK overlay |
| Radio Group | `dm-radio-group` | ControlValueAccessor · horizontal / vertical |

### Layout & Navigation

| Component | Selector | Highlights |
|---|---|---|
| Card | `dm-card` | container queries · shadow variants |
| Accordion | `dm-accordion` | animated · multiple / single open · keyboard nav |
| Tabs | `dm-tabs` | 5 variants · sliding indicator · segment control · full-width |

### Overlays (require CDK)

| Component | Selector / Service | Highlights |
|---|---|---|
| Tooltip | `dmTooltip` directive | 12 placements · open / close delay |
| Dialog | `DmDialogService` | typed data · typed return · backdrop click to close |
| Toast | `DmToastService` | queued notifications · signals state · dismiss label |

---

## Theming

Tokens live on `<html>` attributes — no class toggling, no JavaScript:

```ts
// Auto (follows prefers-color-scheme)
provideDmasterUI({ theme: 'auto' })

// Force dark
document.documentElement.setAttribute('data-dm-theme', 'dark');
```

Override any token globally:

```scss
:root {
  --dm-primary: #7c3aed;          // swap the primary color
  --dm-radius-full: 0.5rem;       // rectangular buttons instead of pill
  --dm-duration-base: 100ms;      // faster animations
}
```

---

## Who is this for?

@dmaster/ui is a good fit for:

- **SaaS dashboards** — tables, forms, overlays, and toasts out of the box
- **Admin panels** — dense layouts with consistent design tokens and three density modes
- **Component-library starters** — use as a base or reference architecture for signals-based Angular components
- **Teams migrating to zoneless Angular** — built for `provideZonelessChangeDetection()` from day one

---

## Compared to

| Library | How @dmaster/ui differs |
|---|---|
| Angular Material | Signals-based API (`input()`/`model()`), no NgModules, HeroUI aesthetic instead of Material Design |
| PrimeNG | Lighter surface area, CSS-variables-only theming, no runtime theme engine |
| ng-zorro | Zero Ant Design dependency, no icon font required, standalone-first |

---

## Contributing

Issues and PRs are welcome on [GitHub](https://github.com/diegomn98/dmaster-ui).

---

## License

MIT © [Diego Maestro](https://github.com/diegomn98)
