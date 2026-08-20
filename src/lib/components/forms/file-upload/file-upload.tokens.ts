import { InjectionToken, Provider } from '@angular/core';

/** Globally overridable behavioural defaults for `dm-file-upload`. */
export interface DmFileUploadDefaults {
  /** Whether more than one file may be selected/dropped. */
  multiple: boolean;
  /** Maximum accepted size per file, in bytes (`null` = no limit). */
  maxSize: number | null;
  /** Maximum number of files kept at once (`null` = no cap). */
  maxFiles: number | null;
}

export const DM_FILE_UPLOAD_FALLBACK_DEFAULTS: DmFileUploadDefaults = {
  multiple: false,
  maxSize: null,
  maxFiles: null,
};

/** Injection token holding the defaults every `dm-file-upload` starts from. */
export const FILE_UPLOAD_DEFAULTS = new InjectionToken<DmFileUploadDefaults>(
  'FILE_UPLOAD_DEFAULTS',
  {
    providedIn: 'root',
    factory: () => DM_FILE_UPLOAD_FALLBACK_DEFAULTS,
  },
);

/**
 * Convenience provider to change the file-upload defaults app- or route-wide.
 *
 * ```ts
 * providers: [provideFileUploadDefaults({ multiple: true, maxSize: 5 * 1024 * 1024 })]
 * ```
 */
export function provideFileUploadDefaults(defaults: Partial<DmFileUploadDefaults>): Provider {
  return {
    provide: FILE_UPLOAD_DEFAULTS,
    useValue: { ...DM_FILE_UPLOAD_FALLBACK_DEFAULTS, ...defaults },
  };
}
