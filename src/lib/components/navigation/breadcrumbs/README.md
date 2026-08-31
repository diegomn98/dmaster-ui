# Breadcrumbs (`dm-breadcrumbs`)

A composite breadcrumb trail with a flat look: text links that warm to
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

### Custom separator template (`dmBreadcrumbSeparator`)

For separators beyond a plain string, project an
`ng-template[dmBreadcrumbSeparator]` (import `DmBreadcrumbSeparatorDirective`)
— it replaces the built-in chevron, and wins over the `separator` string,
between every pair of items:

```html
<dm-breadcrumbs>
  <ng-template dmBreadcrumbSeparator>
    <dm-icon name="arrow-right" size="0.9em" />
  </ng-template>
  <dm-breadcrumb-item href="/">Home</dm-breadcrumb-item>
  <dm-breadcrumb-item href="/library">Library</dm-breadcrumb-item>
  <dm-breadcrumb-item>Data</dm-breadcrumb-item>
</dm-breadcrumbs>
```

Context: `$implicit` (`let-index`) is the zero-based index of the crumb the
separator follows. Separators stay decorative (`aria-hidden` wrapper), so keep
the template free of interactive or focusable content. The `separator` input
remains the simple case for plain text.

## API — `<dm-breadcrumbs>`

| Input                 | Type                   | Default         | Description                                                          |
| --------------------- | ---------------------- | --------------- | -------------------------------------------------------------------- |
| `separator`           | `string`               | `''` (chevron)  | Custom separator text. Empty falls back to the built-in chevron SVG. |
| `size`                | `'sm' \| 'md' \| 'lg'` | `'md'`          | Size scale (`sm`/`md` → text-sm, `lg` → text-base).                  |
| `ariaLabel`           | `string`               | `'Breadcrumbs'` | Accessible label for the `<nav>` landmark.                           |
| `maxItems`            | `number \| null`       | `null`          | Collapse once the trail has more than this many items. `null` off.   |
| `itemsBeforeCollapse` | `number`               | `1`             | Items kept at the start when collapsed (min 1).                      |
| `itemsAfterCollapse`  | `number`               | `2`             | Items kept at the end when collapsed (min 1).                        |

Content projection: an `ng-template[dmBreadcrumbSeparator]` replaces the
separator entirely (`$implicit` = index of the preceding crumb) — see
[Custom separator template](#custom-separator-template-dmbreadcrumbseparator).

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

## Accessibility

- Renders a `<nav aria-label>` landmark around an `<ol>` of `<li>` items.
- The current page carries `aria-current="page"` and is not a link.
- Separators and the `…` indicator are `aria-hidden="true"`.
- Links show the global focus ring on `:focus-visible` and squeeze on press.
- On narrow viewports intermediate crumbs truncate with an ellipsis; the cap is
  lifted from the `sm` breakpoint up.
- Motion is disabled under `prefers-reduced-motion`.

## Design tokens

Public CSS custom properties, consumed with local fallbacks — override them at any scope (globally, per theme, or on a subtree) without touching the SCSS.

| Token                              | Default                              | Description                                                       |
| ---------------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `--dm-breadcrumbs-fg`              | `var(--dm-fg-muted)`                 | Resting link / crumb text color.                                  |
| `--dm-breadcrumbs-fg-active`       | `var(--dm-fg)`                       | Hover + current page text color.                                  |
| `--dm-breadcrumbs-fg-disabled`     | `var(--dm-fg-subtle)`                | Text color of a disabled crumb.                                   |
| `--dm-breadcrumbs-sep`             | `var(--dm-fg-subtle)`                | Separator (chevron / custom text) color.                          |
| `--dm-breadcrumbs-font-size`       | Size-scaled (`--dm-text-xs/sm/base`) | Trail font size (overrides the `size` scale).                     |
| `--dm-breadcrumbs-item-radius`     | `var(--dm-radius-sm)`                | Corner radius of each crumb (hover / focus surface).              |
| `--dm-breadcrumbs-item-padding`    | `0.125rem 0.25rem`                   | Inner padding of each crumb.                                      |
| `--dm-breadcrumbs-gap`             | Size-scaled (`0.375–0.625rem`)       | Inline spacing around separators (set per `size` on the list).    |
| `--dm-breadcrumbs-label-max-width` | `9rem`                               | Truncation cap for intermediate crumbs below the `sm` breakpoint. |
