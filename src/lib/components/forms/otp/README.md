# dm-otp

One-time-code / PIN field: a row of single-character cells that behaves as one
control. Typing advances to the next cell, Backspace clears and steps back,
arrows/Home/End move between cells and a paste is distributed across them.

## Usage

```html
<dm-otp [(value)]="code" [length]="6" (completed)="verify($event)" ariaLabel="Verification code" />
```

`(completed)` fires once, the moment every cell is filled — a natural hook to
submit the code.

### Reactive Forms

`dm-otp` is a `ControlValueAccessor`; the control value is the concatenated
string:

```html
<dm-otp [formControl]="pin" [length]="4" mode="numeric" mask />
```

### Modes

| `mode`         | Accepts            | `inputmode` |
| -------------- | ------------------ | ----------- |
| `numeric`      | digits `0-9`       | `numeric`   |
| `alphanumeric` | letters + digits   | `text`      |
| `text`         | any non-whitespace | `text`      |

### Label, description & error

`dm-otp` carries the same label / description / error scaffold as the rest of the
field family (`dm-search-field`, `dm-number-input`). The visible `label` sits
above the cells and names the group (`aria-labelledby`); `description` renders
under them and is announced via `aria-describedby`; a non-empty `error` replaces
the description, flips the cells to the invalid (danger) state and is exposed
with `role="alert"`.

```html
<dm-otp
  label="Verification code"
  description="Enter the 6-digit code we sent you."
  [error]="codeError()"
  [length]="6"
  required
  [(value)]="code"
/>
```

`readonly` keeps the current code visible and focusable while blocking every
edit (typing, Backspace/Delete and paste), so a submitted code can be shown
read-only without disabling (dimming) the cells.

## API

| Input         | Type                                              | Default     | Description                                                         |
| ------------- | ------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| `length`      | `number` (attribute)                              | `6`         | Number of cells.                                                    |
| `value`       | `string`                                          | `''`        | The code. Two-way `[(value)]`.                                      |
| `label`       | `string`                                          | `''`        | Visible label above the cells; labels the group.                    |
| `description` | `string`                                          | `''`        | Help text under the cells (hidden while `error` set).               |
| `error`       | `string`                                          | `''`        | Error text; non-empty activates the invalid state.                  |
| `mode`        | `'numeric' \| 'alphanumeric' \| 'text'`           | `'numeric'` | Accepted characters + mobile keyboard.                              |
| `variant`     | `'flat' \| 'bordered' \| 'faded' \| 'underlined'` | `'flat'`    | Cell surface (`bordered` = elevated + border).                      |
| `groupSize`   | `number` (attribute)                              | `0`         | Separator after every N cells (`123 – 456`).                        |
| `mask`        | `boolean` (attribute)                             | `false`     | Render filled cells as masked dots.                                 |
| `size`        | `'sm' \| 'md' \| 'lg'`                            | `'md'`      | Cell size.                                                          |
| `color`       | `'default' \| … \| 'danger'`                      | `'default'` | Focus ring color (`default` focuses primary).                       |
| `disabled`    | `boolean` (attribute)                             | `false`     | Disables every cell.                                                |
| `readonly`    | `boolean` (attribute)                             | `false`     | Code stays visible and focusable, but edits are blocked.            |
| `required`    | `boolean` (attribute)                             | `false`     | Shows the required marker next to the label.                        |
| `autoFocus`   | `boolean` (attribute)                             | `false`     | Focus the first cell on init.                                       |
| `ariaLabel`   | `string`                                          | `''`        | Accessible label of the group (no visible `label`) and cell prefix. |

| Output      | Type                | Description                          |
| ----------- | ------------------- | ------------------------------------ |
| `completed` | `OutputRef<string>` | Fires once when the last cell fills. |

## Defaults

```ts
providers: [provideOtpDefaults({ length: 4, mode: 'numeric' })];
```

## Accessibility

- The cells sit in a `role="group"` wrapper named by the visible `label`
  (`aria-labelledby`) or, without one, by `ariaLabel`; each cell is a labelled
  `<input>` announced as "`{label ?? ariaLabel}` N of M".
- `description` / `error` are wired to the group with `aria-describedby`; the
  `error` uses `role="alert"` and sets `aria-invalid` on every cell.
- `autocomplete="one-time-code"` lets the platform offer an SMS code on the
  first cell; a paste of the full code spreads across the remaining cells.
- Positions are preserved: clearing a middle cell never shifts the others.

## Design tokens

CSS variables, overridable at any scope (global, theme or a subtree). Each one
falls back to the default shown, so nothing changes until you set it:

| Token                    | Default                 | Description                                                  |
| ------------------------ | ----------------------- | ------------------------------------------------------------ |
| `--dm-otp-cell-size`     | `2.5rem`                | Cell width/height at the default `size="md"`.                |
| `--dm-otp-cell-bg`       | `var(--dm-bg-muted)`    | Cell surface (the bordered variant defaults to `-elevated`). |
| `--dm-otp-cell-fg`       | `var(--dm-fg)`          | Cell text color.                                             |
| `--dm-otp-cell-border`   | `var(--dm-border)`      | Cell border color (flat, bordered and faded variants).       |
| `--dm-otp-cell-radius`   | `var(--dm-radius-md)`   | Cell corner rounding.                                        |
| `--dm-otp-cell-bg-focus` | `var(--dm-bg-elevated)` | Cell surface while focused.                                  |
