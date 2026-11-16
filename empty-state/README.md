# dm-empty-state

Placeholder for "there is nothing here yet": an icon, a short explanation and
an optional call to action. Use it inside tables, lists, search results or
entire pages when the data set is empty.

## Usage

```html
<dm-empty-state title="No projects yet" description="Create your first project to get started.">
  <dm-button color="primary">New project</dm-button>
</dm-empty-state>
```

Everything projected into the default slot lands in the centered actions row.

### Custom icon

The built-in inbox glyph is replaced by any element marked with the
`dmEmptyStateIcon` attribute (a `dm-icon`, an inline `<svg>`, an image):

```html
<dm-empty-state title="No results" description="Try a different search.">
  <dm-icon dmEmptyStateIcon>search_off</dm-icon>
</dm-empty-state>
```

`hideIcon` removes the icon area entirely.

## API

| Input         | Type                   | Default | Description                         |
| ------------- | ---------------------- | ------- | ----------------------------------- |
| `title`       | `string`               | —       | Bold headline.                      |
| `description` | `string`               | —       | Supporting copy under the title.    |
| `size`        | `'sm' \| 'md' \| 'lg'` | `'md'`  | Icon, spacing and type scale.       |
| `hideIcon`    | `boolean`              | `false` | Removes the icon area (custom too). |

## Defaults

```ts
providers: [provideEmptyStateDefaults({ size: 'lg' })];
```

## Theming

| Token                      | Fallback          | Purpose                 |
| -------------------------- | ----------------- | ----------------------- |
| `--dm-empty-state-icon-bg` | `--dm-bg-muted`   | Circle behind the glyph |
| `--dm-empty-state-icon-fg` | `--dm-fg-subtle`  | Glyph color             |
| `--dm-empty-state-padding` | `space-8 space-4` | Outer padding           |

## Accessibility

- The icon area is decorative (`aria-hidden="true"`); the message is carried
  by the title/description text.
- No live region: an empty state is static content, not an announcement. If
  the emptiness is the result of a user action (a filter with zero matches),
  announce it from the consumer if needed.

## Design tokens

| Token                                    | Default                               | Description                                                              |
| ---------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `--dm-empty-state-icon-bg`               | `var(--dm-bg-muted)`                  | Circle behind the glyph.                                                 |
| `--dm-empty-state-icon-fg`               | `var(--dm-fg-subtle)`                 | Glyph color.                                                             |
| `--dm-empty-state-padding`               | `var(--dm-space-8) var(--dm-space-4)` | Outer padding.                                                           |
| `--dm-empty-state-gap`                   | `var(--dm-space-1)` (lg: `space-2`)   | Vertical gap between the text blocks.                                    |
| `--dm-empty-state-icon-size`             | `3.5rem` (md)                         | Icon circle diameter; overrides every `size` (sm `2.5rem`, lg `4.5rem`). |
| `--dm-empty-state-icon-radius`           | `var(--dm-radius-full)`               | Rounding of the icon circle.                                             |
| `--dm-empty-state-title-color`           | `var(--dm-fg)`                        | Headline text color.                                                     |
| `--dm-empty-state-title-weight`          | `var(--dm-font-semibold)`             | Headline font weight.                                                    |
| `--dm-empty-state-description-color`     | `var(--dm-fg-muted)`                  | Supporting copy color.                                                   |
| `--dm-empty-state-description-max-width` | `36ch`                                | Maximum measure of the supporting copy.                                  |
