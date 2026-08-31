import { Directive } from '@angular/core';

/**
 * Marks a projected element as the custom icon of a `<dm-alert>`.
 * When present it replaces the built-in tone glyph inside the icon box
 * (e.g. a `dm-icon` or an inline `<svg>`); `hideIcon` still hides the whole
 * box, custom icon included. Import it alongside the alert component.
 *
 * ```html
 * <dm-alert color="success" title="Deployed">
 *   <dm-icon dmAlertIcon size="1.25rem">rocket_launch</dm-icon>
 * </dm-alert>
 * ```
 */
@Directive({ selector: '[dmAlertIcon]' })
export class DmAlertIconDirective {}
