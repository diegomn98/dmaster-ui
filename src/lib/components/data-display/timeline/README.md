# Timeline (`dm-timeline` + `dm-timeline-item`)

Displays a chronological sequence of events along a rail: a marker per event
(dot, glyph or any projected element), a connector to the next one, and a
title / time / body block. Vertical by default, with an `alternate` zig-zag
layout and a horizontal mode. Semantically a **list** (`role="list"` /
`role="listitem"`); markers and connectors are decorative. No Angular Material
dependency.

## Usage

```ts
import {
  DmTimelineComponent,
  DmTimelineItemComponent,
  DmTimelineMarkerDirective,
} from '@dmaster/ui';
```

```html
<dm-timeline ariaLabel="Order history" color="primary">
  <dm-timeline-item title="Order placed" time="Mar 3" datetime="2026-03-03" state="completed">
    We received your order.
  </dm-timeline-item>
  <dm-timeline-item title="Shipped" time="Mar 5" datetime="2026-03-05" state="active">
    Left the warehouse in Madrid.
  </dm-timeline-item>
  <dm-timeline-item title="Delivered" variant="outlined" />
</dm-timeline>
```

### Custom markers

Project any element with `dmTimelineMarker` to replace the default dot (an
avatar, an icon, a badge…). Import `DmTimelineMarkerDirective` alongside the
components.

```html
<dm-timeline-item title="Ana commented" time="2 hours ago">
  <dm-avatar dmTimelineMarker initials="AN" alt="Ana" size="sm" />
  Looks good to me!
</dm-timeline-item>
```

### Alternate layout

Centers the rail and zig-zags the content left / right from the `md`
breakpoint up (narrower viewports fall back to `start`).

```html
<dm-timeline align="alternate">
  <dm-timeline-item title="v1.0" time="Jan" state="completed">Initial release.</dm-timeline-item>
  <dm-timeline-item title="v1.1" time="Mar" state="completed">Dark mode.</dm-timeline-item>
  <dm-timeline-item title="v2.0" time="Jun" state="active">In progress.</dm-timeline-item>
</dm-timeline>
```

### Horizontal

One column per item; scrolls sideways when the items no longer fit. Tune the
minimum column width with `--dm-timeline-col`.

```html
<dm-timeline orientation="horizontal" size="sm" style="--dm-timeline-col: 12rem">
  <dm-timeline-item title="Plan" state="completed" />
  <dm-timeline-item title="Build" state="active" />
  <dm-timeline-item title="Ship" />
</dm-timeline>
```

## API — `dm-timeline`

| Input         | Type                                                                          | Default      | Description                                                        |
| ------------- | ----------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `orientation` | `'vertical' \| 'horizontal'`                                                  | `'vertical'` | Layout direction.                                                  |
| `align`       | `'start' \| 'alternate'`                                                      | `'start'`    | Content placement (vertical only). `alternate` zig-zags from `md`. |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`       | Marker diameter + spacing + type scale.                            |
| `color`       | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'`  | Default accent of the markers; each item may override it.          |
| `ariaLabel`   | `string`                                                                      | `''`         | Accessible label for the list.                                     |
| `itemCount`   | `Signal<number>` (read-only)                                                  | —            | Number of registered items.                                        |

## API — `dm-timeline-item`

| Input      | Type                                                                          | Default                     | Description                                                                                                   |
| ---------- | ----------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `title`    | `string`                                                                      | `''`                        | Event title, rendered as `<strong>`. Stripped from the host (no native tooltip).                              |
| `time`     | `string`                                                                      | `''`                        | Human-readable stamp (`"2 hours ago"`, `"Mar 5, 2026"`).                                                      |
| `datetime` | `string`                                                                      | `''`                        | ISO 8601 value; when set the stamp renders as `<time [datetime]>`.                                            |
| `color`    | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | inherits from `dm-timeline` | Per-item accent override.                                                                                     |
| `variant`  | `'solid' \| 'outlined'`                                                       | `'solid'`                   | Solid accent fill, or surface fill with an accent ring.                                                       |
| `state`    | `'default' \| 'active' \| 'completed' \| 'error'`                             | `'default'`                 | `active` pulses a ring, `completed` shows a check + accents the connector, `error` a warning glyph in danger. |

Read-only signals: `index` (zero-based position) and `isLast`.

The projected content of each `<dm-timeline-item>` is its body; an element
marked with `dmTimelineMarker` is pulled out into the marker slot.

## Global defaults

```ts
providers: [provideTimelineDefaults({ color: 'success', variant: 'outlined' })];
```

Or provide `TIMELINE_DEFAULTS` directly (`orientation`, `align`, `size`,
`color`, `variant`).

## Theming

CSS variables set on the container and consumed by the items:

- `--dm-timeline-marker` — marker diameter (set per `size`).
- `--dm-timeline-gap` / `--dm-timeline-col-gap` — space between items / between rail and content.
- `--dm-timeline-title-fs` / `--dm-timeline-body-fs` — title and body font sizes.
- `--dm-timeline-line` — connector color (turns accent after a `completed` item).
- `--dm-timeline-surface` — fill of `outlined` markers.
- `--dm-timeline-col` — minimum column width in horizontal mode.
- `--dm-timeline-pulse` — duration of the `active` ring pulse.
- `--dm-timeline-accent` / `-fg` / `-text` / `-soft` — mapped per item from its effective color.

## Accessibility

- Container is `role="list"`; each item is `role="listitem"`. Give the list an
  `ariaLabel` when several timelines share a page.
- Default markers, state glyphs and connectors are `aria-hidden`; state is
  conveyed by the visible title / time / body. A projected custom marker keeps
  its own semantics.
- Use `datetime` so the stamp is a real `<time>` element with a machine-readable value.
- The `active` pulse honors `prefers-reduced-motion`.
