/** Layout direction of a button group. */
export type DmButtonGroupOrientation = 'horizontal' | 'vertical';

// `DM_BUTTON_GROUP` and `DmButtonGroupContext` live in `@dmaster/ui/button`
// (the button injects the token, so the group depends on the button and not
// the other way round — no cycle between the two entry points).
