/** Accepted-character mode of the OTP field. */
export type DmOtpMode = 'numeric' | 'alphanumeric' | 'text';

/**
 * Visual variant of the cells, mirroring the field family:
 * `flat` muted fill, `bordered` elevated (white) fill + border, `faded`
 * muted fill + border, `underlined` bare cells with a bottom rule.
 */
export type DmOtpVariant = 'flat' | 'bordered' | 'faded' | 'underlined';

/** Semantic color of the focus ring / active cell. */
export type DmOtpColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Control size, aligned with the rest of the field family. */
export type DmOtpSize = 'sm' | 'md' | 'lg';
