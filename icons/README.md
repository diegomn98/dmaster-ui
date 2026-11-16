# `@dmaster/ui/icons`

The curated icon set for [`@dmaster/ui`](https://www.npmjs.com/package/@dmaster/ui):
~50 hand-drawn outline icons on a 24×24 grid, in a single visual language (2px
stroke, round caps/joins, `currentColor`) so they sit consistently next to the
components.

These icons are **original artwork**, not derived from any third-party set — no
attribution or extra license applies (MIT, same as the library).

> **`icons` vs `icon`.** This entry point (`@dmaster/ui/icons`) is only the SVG
> **drawings** — data, no component. The component that draws them, its
> registry and `provideDmasterIcons()` live in `@dmaster/ui/icon` (singular). An
> app that only uses font-ligature icons never needs `@dmaster/ui/icons`.

## Usage

Register the whole set once, then draw any icon by name with `dm-icon`:

```ts
import { provideDmasterIcons } from '@dmaster/ui/icon';
import { DM_ICONS } from '@dmaster/ui/icons';

// app.config.ts
providers: [provideDmasterIcons(DM_ICONS)];
```

```html
<dm-icon name="search" /> <dm-icon name="chevron-down" size="sm" />
```

Every icon is also exported individually (camelCase) for tree-shaking or use
outside `dm-icon`:

```ts
import { search, chevronDown } from '@dmaster/ui/icons';
```

`DM_ICON_NAMES` lists every name (kebab-case), handy for pickers and galleries.

## Icons

`check`, `x`, `chevron-up/down/left/right`, `chevron-expand`, `arrow-left/right`,
`menu`, `more-horizontal/vertical`, `external-link`, `search`, `copy`, `plus`,
`minus`, `trash`, `edit`, `download`, `upload`, `filter`, `refresh`, `settings`,
`check-circle`, `x-circle`, `info`, `warning`, `bell`, `user`, `home`, `mail`,
`lock`, `calendar`, `clock`, `eye`, `eye-off`, `star`, `heart`, `globe`,
`smartphone`, `grid`, `clipboard`, `sun`, `moon`, `zap`, `layers`, `code`,
`box`, `sparkles`, `shield-check`, `palette`, `github`.
