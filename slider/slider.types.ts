/** Slider size scale. */
export type DmSliderSize = 'sm' | 'md' | 'lg';

/** Semantic color of the slider fill and thumb border. */
export type DmSliderColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** A dot rendered on the track, with an optional label below it. */
export interface DmSliderMark {
  /** Position of the mark, in the slider's value scale. */
  value: number;
  /** Optional text rendered under the track at the mark position. */
  label?: string;
}

/** Formatter used for the value bubble and `aria-valuetext`. */
export type DmSliderFormatter = (value: number) => string;
