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

## API

| Input       | Type                                              | Default     | Description                                    |
| ----------- | ------------------------------------------------- | ----------- | ---------------------------------------------- |
| `length`    | `number` (attribute)                              | `6`         | Number of cells.                               |
| `value`     | `string`                                          | `''`        | The code. Two-way `[(value)]`.                 |
| `mode`      | `'numeric' \| 'alphanumeric' \| 'text'`           | `'numeric'` | Accepted characters + mobile keyboard.         |
| `variant`   | `'flat' \| 'bordered' \| 'faded' \| 'underlined'` | `'flat'`    | Cell surface (`bordered` = elevated + border). |
| `groupSize` | `number` (attribute)                              | `0`         | Separator after every N cells (`123 – 456`).   |
| `mask`      | `boolean` (attribute)                             | `false`     | Render filled cells as masked dots.            |
| `size`      | `'sm' \| 'md' \| 'lg'`                            | `'md'`      | Cell size.                                     |
| `color`     | `'default' \| … \| 'danger'`                      | `'default'` | Focus ring color (`default` focuses primary).  |
| `disabled`  | `boolean` (attribute)                             | `false`     | Disables every cell.                           |
| `autoFocus` | `boolean` (attribute)                             | `false`     | Focus the first cell on init.                  |
| `ariaLabel` | `string`                                          | `''`        | Accessible label of the group and cell prefix. |

| Output      | Type                | Description                          |
| ----------- | ------------------- | ------------------------------------ |
| `completed` | `OutputRef<string>` | Fires once when the last cell fills. |

## Defaults

```ts
providers: [provideOtpDefaults({ length: 4, mode: 'numeric' })];
```

## Accessibility

- The host is `role="group"` with `ariaLabel`; each cell is a labelled
  `<input>` announced as "`{ariaLabel}` N of M".
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
