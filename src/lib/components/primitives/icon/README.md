# Icon (`dm-icon`)

One icon component, three ways to draw an icon — simplest first:

```html
<!-- 1. Material Symbols font ligature (thousands of icons) -->
<dm-icon>home</dm-icon>

<!-- 2. A registered SVG by name (the curated set or your own) -->
<dm-icon name="check" />

<!-- 3. Project a raw SVG (escape hatch) -->
<dm-icon><svg viewBox="0 0 24 24" width="100%" height="100%">…</svg></dm-icon>
```

It inherits `currentColor` and scales to any size.

## Font mode

Type any [Material Symbols](https://fonts.google.com/icons) name as the content
and it renders as a font ligature.
Load the font once (a single `<link>`, or self-host it):

```html
<!-- index.html -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
```

Then style it via the variable-font axes:

```html
<dm-icon>favorite</dm-icon>
<!-- outlined -->
<dm-icon [fill]="true">favorite</dm-icon>
<!-- filled -->
<dm-icon family="rounded">favorite</dm-icon>
<dm-icon family="sharp">favorite</dm-icon>
<dm-icon [weight]="700">favorite</dm-icon>
```

Point `--dm-icon-font` at a different font to use any other icon font.

## Color

One-liner: a semantic token (`primary`, `secondary`, `success`, `warning`,
`danger`, `default`) or any CSS color. Empty inherits `currentColor`.

```html
<dm-icon name="heart" color="danger" />
<dm-icon>bolt</dm-icon>
<!-- inherits the text color -->
<dm-icon name="star" color="#8b5cf6" />
```

## Inputs

| Input    | Type                                 | Default      | Notes                                                           |
| -------- | ------------------------------------ | ------------ | --------------------------------------------------------------- |
| `name`   | `string`                             | `''`         | Registered SVG name. For font icons, use the content instead.   |
| `size`   | `DmIconSize`                         | `'md'`       | `sm`/`md`/`lg`, a px number, or any CSS length.                 |
| `color`  | `DmIconColor`                        | `''`         | Semantic token or any CSS color. Empty inherits `currentColor`. |
| `fill`   | `boolean`                            | `false`      | Font mode: filled vs outlined (`FILL` axis).                    |
| `weight` | `number`                             | `400`        | Font mode: stroke weight 100–700 (`wght` axis).                 |
| `family` | `'outlined' \| 'rounded' \| 'sharp'` | `'outlined'` | Font mode: Material Symbols family.                             |
| `spin`   | `boolean`                            | `false`      | Rotate continuously (loaders). Off under reduced motion.        |
| `label`  | `string`                             | `''`         | Accessible name. Empty → decorative (`aria-hidden`).            |

## Registering SVG icons

`provideDmasterIcons(icons)` merges a `Record<name, svgString>` into the global
registry. It is callable many times — the curated `@dmaster/ui/icons` set plus
your own:

```ts
import { provideDmasterIcons } from '@dmaster/ui';
import { DM_ICONS } from '@dmaster/ui/icons';

providers: [
  provideDmasterIcons(DM_ICONS),
  provideDmasterIcons({ brand: '<svg viewBox="0 0 24 24">…</svg>' }),
];
```

You can also register at runtime via `DmIconRegistry.register(name, svg)`.

> **Security.** Registered SVG strings are rendered with the Angular sanitizer
> bypassed (only registry strings are ever trusted), so only
> register **trusted** markup — never SVG from user input or the network.

## Accessibility

- **Decorative by default:** no `label` → the host is `aria-hidden`.
- Pass a `label` for a meaningful stand-alone icon → `role="img"` + `aria-label`.
- Spinning icons stop under `prefers-reduced-motion`.

## Defaults

```ts
import { provideIconDefaults } from '@dmaster/ui';

providers: [provideIconDefaults({ size: 'sm', weight: 500 })];
```

## Design tokens

| Token                     | Default                       | Description                                |
| ------------------------- | ----------------------------- | ------------------------------------------ |
| `--dm-icon-font`          | `'Material Symbols Outlined'` | Font family used in font (ligature) mode.  |
| `--dm-icon-font-rounded`  | `'Material Symbols Rounded'`  | Font family for `family="rounded"`.        |
| `--dm-icon-font-sharp`    | `'Material Symbols Sharp'`    | Font family for `family="sharp"`.          |
| `--dm-icon-spin-duration` | `1s`                          | One full rotation of the `spin` animation. |
