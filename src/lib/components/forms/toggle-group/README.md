# dm-toggle-group

Segmented control / toggle group: a row of `<dm-toggle>` items inside one flat,
rounded surface. Two independent modes — an exclusive **single** choice (view
switchers) or independent **multiple** toggles (a formatting toolbar).

## Usage

### Single (segmented control)

```html
<dm-toggle-group [(value)]="view" ariaLabel="Layout">
  <dm-toggle value="list">List</dm-toggle>
  <dm-toggle value="grid">Grid</dm-toggle>
  <dm-toggle value="table">Table</dm-toggle>
</dm-toggle-group>
```

Behaves like a radio group: `role="radiogroup"`, one active segment, and a
roving-tabindex arrow-key model (←/→ or ↑/↓ move **and** select, Home/End jump
to the ends).

### Multiple (toggle toolbar)

```html
<dm-toggle-group multiple [(values)]="format" color="primary" ariaLabel="Format">
  <dm-toggle value="bold" ariaLabel="Bold"><strong>B</strong></dm-toggle>
  <dm-toggle value="italic" ariaLabel="Italic"><em>I</em></dm-toggle>
  <dm-toggle value="underline" ariaLabel="Underline"><u>U</u></dm-toggle>
</dm-toggle-group>
```

`role="group"` with independent `aria-pressed` buttons: Tab moves between them,
Space/Enter toggles. `value` and `values` are **separate** models, so adding
`multiple` never rewrites the single value.

### Reactive Forms

Both modes are a `ControlValueAccessor`. The control value is the single value,
or the array of values in multiple mode:

```html
<dm-toggle-group [formControl]="view" ariaLabel="Layout">…</dm-toggle-group>
```

## API

### `dm-toggle-group`

| Input         | Type                                      | Default        | Description                                        |
| ------------- | ----------------------------------------- | -------------- | -------------------------------------------------- |
| `multiple`    | `boolean` (attribute)                     | `false`        | Multi-select mode (`aria-pressed` toggle buttons). |
| `value`       | `unknown`                                 | `null`         | Selected value (single). Two-way `[(value)]`.      |
| `values`      | `unknown[]`                               | `[]`           | Selected values (multiple). Two-way `[(values)]`.  |
| `color`       | `'default' \| 'primary' \| … \| 'danger'` | `'default'`    | Color of the selected segment(s).                  |
| `size`        | `'sm' \| 'md' \| 'lg'`                    | `'md'`         | Control height (28 / 34 / 42 px inner).            |
| `orientation` | `'horizontal' \| 'vertical'`              | `'horizontal'` | Layout direction.                                  |
| `fullWidth`   | `boolean` (attribute)                     | `false`        | Stretch to fill, segments share the width.         |
| `disabled`    | `boolean` (attribute)                     | `false`        | Disables every segment.                            |
| `ariaLabel`   | `string`                                  | `''`           | Accessible label with no visible caption.          |

### `dm-toggle`

| Input       | Type      | Default | Description                                         |
| ----------- | --------- | ------- | --------------------------------------------------- |
| `value`     | `unknown` | —       | Value carried by this segment (required).           |
| `disabled`  | `boolean` | `false` | Disables just this segment.                         |
| `ariaLabel` | `string`  | `''`    | Accessible label — required for icon-only segments. |

## Defaults

```ts
providers: [provideToggleGroupDefaults({ color: 'primary', size: 'lg' })];
```

## Accessibility

- **Single** mode is a `radiogroup` with `radio` children (`aria-checked`), the
  standard roving-tabindex arrow-key pattern, and one tab stop.
- **Multiple** mode is a `group` of `button`s with `aria-pressed`; each segment
  is independently reachable by Tab and toggled with Space/Enter.
- Icon-only segments need `ariaLabel`; disabled segments are skipped by the
  keyboard model and are not tab stops.
