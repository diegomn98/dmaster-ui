# DmAutocomplete

A free-text field with a filtered suggestions dropdown — the search-as-you-type
pattern. Unlike `dm-select`, the trigger **is** an editable `<input>`: the user
types arbitrary text, sees matching options in a CDK overlay, and either picks
one or keeps their own text. The value is always a plain `string`, and a
`ControlValueAccessor` wires it into template- and reactive-driven forms.

```ts
import { DmAutocompleteComponent } from '@dmaster/ui';
```

## Usage

```html
<dm-autocomplete
  label="Fruit"
  placeholder="Type to search…"
  [options]="fruits"
  [(value)]="fruit"
  (optionSelected)="onPick($event)"
/>
```

```ts
fruits: DmAutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot', description: 'Stone fruit' },
  { value: 'avocado', label: 'Avocado', disabled: true },
];
```

Wire it to a form (the control value is the free text):

```html
<dm-autocomplete [options]="fruits" [formControl]="fruitControl" ariaLabel="Fruit" />
```

## Inputs

| Input            | Type                                                                          | Default     | Description                                              |
| ---------------- | ----------------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| `options`        | `DmAutocompleteOption[]`                                                      | `[]`        | Suggestions to filter and render.                        |
| `value`          | `string` (model)                                                              | `''`        | Two-way free-text value (the CVA value).                 |
| `label`          | `string`                                                                      | `''`        | Visible label above the field.                           |
| `placeholder`    | `string`                                                                      | `''`        | Placeholder shown while empty.                           |
| `description`    | `string`                                                                      | `''`        | Help text below the field (hidden while `error` is set). |
| `error`          | `string`                                                                      | `''`        | Error text; non-empty activates the invalid state.       |
| `disabled`       | `boolean`                                                                     | `false`     | Disables the field.                                      |
| `required`       | `boolean`                                                                     | `false`     | Shows the required marker.                               |
| `clearable`      | `boolean`                                                                     | `true`      | Shows the × button once there is text.                   |
| `color`          | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Focus ring, caret and active-option color.               |
| `variant`        | `'flat' \| 'bordered' \| 'faded' \| 'underlined'`                             | `'flat'`    | Visual variant of the surface.                           |
| `size`           | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`      | Field height scale (32 / 40 / 48px).                     |
| `radius`         | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                                    | `'md'`      | Corner rounding (`full` = pill).                         |
| `ariaLabel`      | `string`                                                                      | `''`        | ARIA label for fields without a visible `label`.         |
| `clearAriaLabel` | `string`                                                                      | `'Clear'`   | ARIA label for the clear button.                         |
| `noResultsLabel` | `string`                                                                      | `''`        | Message shown when no option matches (hidden if empty).  |
| `openOnFocus`    | `boolean`                                                                     | `false`     | Show all options on focus, before any typing.            |

## Outputs

| Output           | Payload                | Fires when                   |
| ---------------- | ---------------------- | ---------------------------- |
| `optionSelected` | `DmAutocompleteOption` | The user picks a suggestion. |

## Methods

- `focus()` — programmatically focus the input.

## Behaviour

- **Filtering** is case-insensitive and trimmed: options whose `label` _includes_
  the current text are shown.
- The panel **opens** when there are matching options (or a `noResultsLabel` to
  show, once text is present) and either there is input text or `openOnFocus` is
  set and the field is focused. It **closes** on Escape, outside click,
  selection, or blur.
- Picking an option writes its `label` into the field, emits `optionSelected`
  (carrying the full option, so you can read its `value`/id), closes the panel
  and keeps focus in the input. **Free text is always kept** — the user is never
  forced to pick a suggestion.

## Defaults

Override every `dm-autocomplete` app- or route-wide:

```ts
providers: [provideAutocompleteDefaults({ variant: 'bordered', radius: 'md' })];
```

## Accessibility

- The input is a `role="combobox"` with `aria-autocomplete="list"`,
  `aria-expanded`, `aria-controls` pointing at the listbox, and
  `aria-activedescendant` tracking the active option while open.
- Keyboard: **ArrowDown / ArrowUp** move over enabled options (wraparound, with
  scroll-into-view), **Home / End** jump, **Enter** picks the active option,
  **Escape** closes, **Tab** closes and moves on. Disabled options are skipped
  and cannot be clicked.
- With a visible `label` the input is wired via `aria-labelledby`; without one,
  pass `ariaLabel`. `error` sets `aria-invalid` and links the message with
  `aria-describedby` (the message is `role="alert"`).
