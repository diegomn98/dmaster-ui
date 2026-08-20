import { InjectionToken, Provider } from '@angular/core';

import { DmTreeSelectionMode } from './tree.types';

/** Globally overridable defaults for `dm-tree`. */
export interface DmTreeDefaults {
  /** Selection behaviour applied when the consumer doesn't set one. */
  selectionMode: DmTreeSelectionMode;
  /** Whether clicking a parent node's row also toggles its expansion. */
  expandOnSelect: boolean;
  /** Draw the connector guide lines that trace each level's indentation. */
  showGuides: boolean;
}

export const DM_TREE_FALLBACK_DEFAULTS: DmTreeDefaults = {
  selectionMode: 'single',
  expandOnSelect: false,
  showGuides: false,
};

/** Injection token holding the defaults every `dm-tree` starts from. */
export const TREE_DEFAULTS = new InjectionToken<DmTreeDefaults>('TREE_DEFAULTS', {
  providedIn: 'root',
  factory: () => DM_TREE_FALLBACK_DEFAULTS,
});

/**
 * Convenience provider to change the tree defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideTreeDefaults({ selectionMode: 'multiple', showGuides: true })]
 * ```
 */
export function provideTreeDefaults(defaults: Partial<DmTreeDefaults>): Provider {
  return {
    provide: TREE_DEFAULTS,
    useValue: { ...DM_TREE_FALLBACK_DEFAULTS, ...defaults },
  };
}
