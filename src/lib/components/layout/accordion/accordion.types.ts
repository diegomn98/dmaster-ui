/** Visual treatment of the accordion container. */
export type DmAccordionVariant = 'light' | 'bordered' | 'shadow' | 'splitted';

/** Whether one or many items can be expanded at the same time. */
export type DmAccordionSelectionMode = 'single' | 'multiple';

/** Payload of the accordion `(itemToggled)` output. */
export interface DmAccordionToggleEvent {
  /** The `value` of the item that toggled. */
  value: string;
  /** `true` if it expanded, `false` if it collapsed. */
  expanded: boolean;
}
