# `@dmaster/ui/core`

```ts
import { provideDmasterUI, ThemeService } from '@dmaster/ui/core';
```

The cross-cutting part of `@dmaster/ui` that every component entry point builds
on — no components here:

| Export                                           | What it is                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `provideDmasterUI(config)`                       | App-level setup: default `theme`, `density` and custom named `themes`             |
| `DMASTER_UI_CONFIG`, `DmasterUIConfig`           | The resolved config token and its type                                            |
| `ThemeService`                                   | `theme()` / `resolvedTheme()` / `scheme()` / `themes()`, `setTheme()`, `toggle()` |
| `DensityService`                                 | `density()` and `setDensity()` — stamps `data-dm-density` on `<html>`             |
| `ReducedMotionService`                           | `reducedMotion()` signal (live `prefers-reduced-motion`), SSR-safe                |
| `DmSize`, `DmCssSize`, `DmTheme`, `DmDensity`, … | Shared types used across component inputs                                         |
| `toCssSize()`, `dmUid()`                         | Small utilities (size normalisation, unique ids for ARIA wiring)                  |

Components live in their own entry points (`@dmaster/ui/button`,
`@dmaster/ui/select`…) — see the [library README](https://github.com/diegomn98/dmaster-ui#entry-points).
