# Drawer (`DmDrawerService`)

Slide-in side panel served over the CDK Dialog with the library look. Focus trap, focus restore, Escape/backdrop handling come from the CDK; the panel is pinned to a viewport edge with a global position strategy and its panel/backdrop styling ships in the library's global stylesheet.

> Requires the CDK structural styles once per app:
> `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", ...]`

```ts
private readonly drawer = inject(DmDrawerService);

openFilters(): void {
  const ref = this.drawer.open(FiltersComponent, { placement: 'right', size: 'md', data: { userId: 7 } });
  ref.closed.subscribe((result) => …);
}
```

Content component (or a `TemplateRef` — `open()` accepts both):

```ts
export class FiltersComponent {
  protected readonly data = inject(DIALOG_DATA); // re-exported by @dmaster/ui
  private readonly ref = inject(DialogRef); // re-exported by @dmaster/ui
  apply(): void {
    this.ref.close('applied');
  }
}
```

## `DmDrawerConfig`

| Option         | Type                                     | Default   | Description                                                                                           |
| -------------- | ---------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `data`         | `D`                                      | —         | Injected via `DIALOG_DATA`.                                                                           |
| `placement`    | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Edge the panel slides in from.                                                                        |
| `size`         | `'sm' \| 'md' \| 'lg' \| 'full'`         | `'md'`    | Left/right → width (20 / 28 / 36rem / 100vw). Top/bottom → height (30 / 50 / 70dvh / 100dvh).         |
| `backdrop`     | `boolean`                                | `true`    | Renders the dimming backdrop. `false` leaves the page interactive (non-modal) and drops `aria-modal`. |
| `disableClose` | `boolean`                                | `false`   | Blocks backdrop click and Escape.                                                                     |
| `ariaLabel`    | `string`                                 | —         | Accessible name of the drawer.                                                                        |

## Global defaults

```ts
import { provideDrawerDefaults } from '@dmaster/ui';

providers: [provideDrawerDefaults({ placement: 'left', size: 'lg' })];
```

`DmDrawerService` reads `DRAWER_DEFAULTS` and each `open()` call merges its config on top.

## Accessibility

- CDK: focus trap, focus restore on close, Escape/backdrop close (unless `disableClose`).
- `role="dialog"`; give the drawer an accessible name — pass `ariaLabel`, or render a heading inside and wire it with `aria-labelledby`.
- `aria-modal` is set only when a backdrop is present; a `backdrop: false` drawer is non-modal and leaves the rest of the page reachable.
- The slide-in animation collapses to a plain fade under `prefers-reduced-motion`.
