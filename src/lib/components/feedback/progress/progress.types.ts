/** Semantic color of the progress fill. */
export type DmProgressColor =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Track thickness scale. */
export type DmProgressSize = 'sm' | 'md' | 'lg';

/** Formats the value label shown at the end of the label row. */
export type DmProgressFormatFn = (value: number, max: number) => string;
