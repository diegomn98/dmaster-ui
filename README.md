# @dmaster/ui

Modern, premium Angular UI component library. Standalone components built with signals, fully themeable via CSS custom properties, and inspired by the HeroUI design language.

[![npm](https://img.shields.io/npm/v/@dmaster/ui?color=006FEE&style=flat-square)](https://www.npmjs.com/package/@dmaster/ui)
[![license](https://img.shields.io/npm/l/@dmaster/ui?style=flat-square)](https://github.com/diegomn98/dmaster-ui/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular)](https://angular.dev)

## Features

- **Standalone** — no NgModule required, just import what you need
- **Signals-based** — `input()`, `output()`, `model()`, `computed()` throughout; zero decorators
- **Zoneless-ready** — works with `provideZonelessChangeDetection()`
- **Themeable** — light / dark / custom via CSS custom properties (`--dm-*`)
- **HeroUI design language** — flat colors, pill radii, elastic press, color × variant system
- **Accessible** — ARIA attributes on host, `:focus-visible` focus rings, touch targets ≥ 44px
- **Angular CDK** — overlays (tooltip, dialog, toast) built on `@angular/cdk`

## Installation

```bash
npm install @dmaster/ui
```

### Peer dependencies

```bash
npm install @angular/cdk
```

## Setup

### 1. Import the global styles

In your `styles.scss` (or `angular.json` styles array):

```scss
@use '@dmaster/ui/styles/index';
```

For overlay components (tooltip, dialog, toast), also add the CDK prebuilt styles in `angular.json`:

```json
"styles": [
  "node_modules/@angular/cdk/overlay-prebuilt.css",
  "src/styles.scss"
]
```

### 2. Configure the provider (optional)

```ts
import { provideDmasterUI } from '@dmaster/ui';

bootstrapApplication(AppComponent, {
  providers: [
    provideDmasterUI({ theme: 'auto', density: 'comfortable' }),
  ],
});
```

## Usage

Import only the components you need — all are standalone:

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

## Components

### Primitives
| Component | Selector | Description |
|---|---|---|
| Button | `dm-button` | color × variant (solid, flat, faded, bordered, light, ghost, shadow) |
| Badge / Chip | `dm-badge` | color × variant with dot, solid, flat, bordered, light, shadow |
| Avatar | `dm-avatar` | image with fallback initials |
| Spinner | `dm-spinner` | animated loading indicator |
| Skeleton | `dm-skeleton` | content placeholder with shimmer |

### Forms
| Component | Selector | Description |
|---|---|---|
| Switch | `dm-switch` | toggle, ControlValueAccessor |
| Checkbox | `dm-checkbox` | checkbox, ControlValueAccessor |
| Form Field | `dm-form-field` + `dmInput` | label + hint + error wrapper for native inputs |
| Select | `dm-select` | combobox with CDK overlay, keyboard nav, typeahead, CVA |
| Paginated Select | `dm-paginated-select` | async-loadable select with pagination |
| Radio Group | `dm-radio-group` + `dm-radio` | radio group, ControlValueAccessor |

### Layout
| Component | Selector | Description |
|---|---|---|
| Card | `dm-card` | container with container queries |
| Accordion | `dm-accordion` + `dm-accordion-item` | animated collapsible sections |

### Navigation
| Component | Selector | Description |
|---|---|---|
| Tabs | `dm-tabs` + `dm-tab` + `dm-tab-panel` | 5 variants (solid, bordered, light, underlined, segment), sliding indicator |

### Overlays (require CDK)
| Component | Selector / Service | Description |
|---|---|---|
| Tooltip | `dmTooltip` directive | CDK-powered tooltip with configurable placement |
| Dialog | `DmDialogService` | CDK dialog with typed data and return value |
| Toast | `DmToastService` | queued toast notifications with signal-based state |

## Theming

Set the theme via the `data-dm-theme` attribute on `<html>`:

```ts
// Auto (follows prefers-color-scheme)
provideDmasterUI({ theme: 'auto' })

// Manual
document.documentElement.setAttribute('data-dm-theme', 'dark');
```

Override any token in your own stylesheet:

```scss
:root {
  --dm-primary: #7c3aed;
  --dm-radius-full: 0.5rem; // make buttons rectangular instead of pill
}
```

## Density

Three density levels via `data-dm-density`:

```ts
provideDmasterUI({ density: 'compact' }) // compact | comfortable | spacious
```

## License

MIT © [Diego Maestro](https://github.com/diegomn98)
