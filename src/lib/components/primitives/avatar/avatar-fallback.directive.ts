import { Directive } from '@angular/core';

/**
 * Marks a projected element as the custom fallback of a `<dm-avatar>`.
 * It renders at the end of the fallback chain — image → initials → custom
 * fallback — replacing the generic person icon (e.g. a `dm-icon` or an
 * inline `<svg>`). Import it alongside the avatar component.
 *
 * ```html
 * <dm-avatar alt="Engineering team">
 *   <dm-icon dmAvatarFallback size="1.25rem">groups</dm-icon>
 * </dm-avatar>
 * ```
 */
@Directive({ selector: '[dmAvatarFallback]' })
export class DmAvatarFallbackDirective {}
