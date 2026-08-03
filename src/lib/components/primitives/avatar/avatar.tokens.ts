import { InjectionToken, Provider } from '@angular/core';

import { DmAvatarShape, DmAvatarSize } from './avatar.types';

/** Globally overridable defaults for `dm-avatar`. */
export interface DmAvatarDefaults {
  size: DmAvatarSize;
  shape: DmAvatarShape;
}

export const DM_AVATAR_FALLBACK_DEFAULTS: DmAvatarDefaults = {
  size: 'md',
  shape: 'circle',
};

/** Injection token holding the defaults every `dm-avatar` starts from. */
export const AVATAR_DEFAULTS = new InjectionToken<DmAvatarDefaults>('AVATAR_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_AVATAR_FALLBACK_DEFAULTS,
});

/** Convenience provider to change the avatar defaults app- or route-wide. */
export function provideAvatarDefaults(defaults: Partial<DmAvatarDefaults>): Provider {
  return {
    provide: AVATAR_DEFAULTS,
    useValue: { ...DM_AVATAR_FALLBACK_DEFAULTS, ...defaults },
  };
}
