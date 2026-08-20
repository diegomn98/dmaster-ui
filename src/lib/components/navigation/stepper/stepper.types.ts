/** Layout direction of the stepper. */
export type DmStepperOrientation = 'horizontal' | 'vertical';

/** Semantic color of the stepper accent (active / completed indicators). */
export type DmStepperColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** Size scale (indicator diameter + type). */
export type DmStepperSize = 'sm' | 'md' | 'lg';

/** Visual/interaction state of a single step, reflected on the host as `data-state`. */
export type DmStepState = 'upcoming' | 'active' | 'completed' | 'error' | 'disabled';
