import { InjectionToken, Provider } from '@angular/core';

/** Globally overridable defaults for `dm-command`. */
export interface DmCommandDefaults {
  /** Global toggle hotkey. `mod` = ⌘ on macOS / Ctrl elsewhere. `''` disables. */
  hotkey: string;
  /** Placeholder shown in the search input. */
  placeholder: string;
  /** Message shown when the query matches nothing. */
  emptyLabel: string;
  /** Footer hint label for the ↑↓ navigation keys. */
  navigateHint: string;
  /** Footer hint label for the ↵ select key. */
  selectHint: string;
  /** Footer hint label for the esc close key. */
  closeHint: string;
}

export const DM_COMMAND_FALLBACK_DEFAULTS: DmCommandDefaults = {
  hotkey: 'mod+k',
  placeholder: 'Search…',
  emptyLabel: 'No results found',
  navigateHint: 'Navigate',
  selectHint: 'Select',
  closeHint: 'Close',
};

/** Injection token holding the defaults every `dm-command` starts from. */
export const COMMAND_DEFAULTS = new InjectionToken<DmCommandDefaults>('COMMAND_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_COMMAND_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the command-palette defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideCommandDefaults({ hotkey: 'mod+p', placeholder: 'Jump to…' })]
 * ```
 */
export function provideCommandDefaults(defaults: Partial<DmCommandDefaults>): Provider {
  return {
    provide: COMMAND_DEFAULTS,
    useValue: { ...DM_COMMAND_FALLBACK_DEFAULTS, ...defaults },
  };
}
