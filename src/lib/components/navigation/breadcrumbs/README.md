# Breadcrumbs (`dm-breadcrumbs`)

A composite breadcrumb trail with a HeroUI look: flat text links that warm to
`--dm-fg` on hover, a chevron (or custom) separator, an auto-marked current
page, and optional middle-collapsing into a static `…`. **No `@angular/router`
dependency** — an item with `href` renders an anchor, an item without renders
plain text.

## Usage

```ts
import { DmBreadcrumbsComponent, DmBreadcrumbItemComponent } from '@dmaster/ui';
```

```html
<dm-breadcrumbs ariaLabel="Breadcrumb">
  <dm-breadcrumb-item href="/">Home</dm-breadcrumb-item>
  <dm-breadcrumb-item href="/library">Library</dm-breadcrumb-item>
  <dm-breadcrumb-item>Data</dm-breadcrumb-item>
</dm-breadcrumbs>
```

The **last item is always the current page**: it renders as a
`<span aria-current="page">` even if it was given an `href`, so you can drive
the whole trail from one data structure without special-casing the tail.

### Router / SPA navigation

The library never imports `@angular/router`. For single-page navigation you
have two options:

```html
<!-- 1. Plain href — a full document navigation. -->
<dm-breadcrumb-item href="/library">Library</dm-breadcrumb-item>

<!-- 2. Hrefless item + your own routerLink projected as the label. -->
<dm-breadcrumb-item>
  <a routerLink="/library">Library</a>
</dm-breadcrumb-item>
```

With option 2 the crumb renders plain text and your projected `<a routerLink>`
handles navigation, keeping breadcrumbs router-agnostic.

### Collapsing long trails

```html
<dm-breadcrumbs [maxItems]="4" [itemsBeforeCollapse]="1" [itemsAfterCollapse]="2">
  <dm-breadcrumb-item href="/">Home</dm-breadcrumb-item>
  <dm-breadcrumb-item href="/a">Section</dm-breadcrumb-item>
  <dm-breadcrumb-item href="/a/b">Category</dm-breadcrumb-item>
  <dm-breadcrumb-item href="/a/b/c">Subcategory</dm-breadcrumb-item>
  <dm-breadcrumb-item>Item</dm-breadcrumb-item>
</dm-breadcrumbs>
<!-- renders: Home … Subcategory Item -->
```

When the item count exceeds `maxItems`, the middle span collapses into a
non-interactive `…` (`aria-hidden`). Collapsed items are removed from the DOM,
not merely hidden.

## API — `<dm-breadcrumbs>`

| Input                 | Type                   | Default         | Description                                                          |
| --------------------- | ---------------------- | --------------- | -------------------------------------------------------------------- |
| `separator`           | `string`               | `''` (chevron)  | Custom separator text. Empty falls back to the built-in chevron SVG. |
| `size`                | `'sm' \| 'md' \| 'lg'` | `'md'`          | Size scale (`sm`/`md` → text-sm, `lg` → text-base).                  |
| `ariaLabel`           | `string`               | `'Breadcrumbs'` | Accessible label for the `<nav>` landmark.                           |
| `maxItems`            | `number \| null`       | `null`          | Collapse once the trail has more than this many items. `null` off.   |
| `itemsBeforeCollapse` | `number`               | `1`             | Items kept at the start when collapsed (min 1).                      |
| `itemsAfterCollapse`  | `number`               | `2`             | Items kept at the end when collapsed (min 1).                        |

## API — `<dm-breadcrumb-item>`

| Input      | Type      | Default | Description                                                     |
| ---------- | --------- | ------- | --------------------------------------------------------------- |
| `href`     | `string`  | —       | Destination URL. Present → `<a>`; absent → plain text `<span>`. |
| `disabled` | `boolean` | `false` | Renders the crumb as muted, non-interactive text.               |

## Global defaults

```ts
providers: [provideBreadcrumbsDefaults({ ariaLabel: 'You are here', size: 'lg' })];
```

Or provide `BREADCRUMBS_DEFAULTS` directly.

## Theming

CSS variables (inherit from the semantic tokens, overridable at any scope):

- `--dm-breadcrumbs-fg` — resting link/text color (defaults to `--dm-fg-muted`).
- `--dm-breadcrumbs-fg-active` — hover + current page color (defaults to `--dm-fg`).
- `--dm-breadcrumbs-sep` — separator color (defaults to `--dm-fg-subtle`).
- `--dm-breadcrumbs-gap` — inline spacing around separators (size-scaled).

## Accessibility

- Renders a `<nav aria-label>` landmark around an `<ol>` of `<li>` items.
- The current page carries `aria-current="page"` and is not a link.
- Separators and the `…` indicator are `aria-hidden="true"`.
- Links show the global focus ring on `:focus-visible` and squeeze on press.
- On narrow viewports intermediate crumbs truncate with an ellipsis; the cap is
  lifted from the `sm` breakpoint up.
- Motion is disabled under `prefers-reduced-motion`.
