/*
 * Public API Surface of @dmaster/ui — the PRIMARY entry point.
 *
 * DEPRECATED since 0.12.0: import each component from its own entry point
 * instead (`@dmaster/ui/button`, `@dmaster/ui/menu`, `@dmaster/ui/core`…).
 * This file only re-exports every secondary entry point so existing
 * `import { … } from '@dmaster/ui'` keeps working; it will be removed in a
 * future version (see the CHANGELOG migration guide).
 *
 * Rules:
 * - Every entry point (a folder at the package root with an ng-package.json)
 *   is listed here — `scripts/check-entry-points.mjs` fails the build if one
 *   is missing.
 * - Nothing inside the library may import from `@dmaster/ui` (this file):
 *   entry points import each other by subpath only.
 */

// Core: configuration, providers, services, base types, utilities
export * from '@dmaster/ui/core';

// Components · primitives
export * from '@dmaster/ui/avatar';
export * from '@dmaster/ui/badge';
export * from '@dmaster/ui/chip';
export * from '@dmaster/ui/icon';
export * from '@dmaster/ui/kbd';
export * from '@dmaster/ui/skeleton';
export * from '@dmaster/ui/spinner';

// Components · layout
export * from '@dmaster/ui/accordion';
export * from '@dmaster/ui/card';
export * from '@dmaster/ui/divider';

// Components · buttons
export * from '@dmaster/ui/button';
export * from '@dmaster/ui/button-group';
export * from '@dmaster/ui/copy-button';

// Components · feedback
export * from '@dmaster/ui/alert';
export * from '@dmaster/ui/progress';

// Components · forms
export * from '@dmaster/ui/autocomplete';
export * from '@dmaster/ui/checkbox';
export * from '@dmaster/ui/color-picker';
export * from '@dmaster/ui/date-picker';
export * from '@dmaster/ui/error';
export * from '@dmaster/ui/file-upload';
export * from '@dmaster/ui/form-field';
export * from '@dmaster/ui/number-input';
export * from '@dmaster/ui/otp';
export * from '@dmaster/ui/radio-group';
export * from '@dmaster/ui/rating';
export * from '@dmaster/ui/search-field';
export * from '@dmaster/ui/select';
export * from '@dmaster/ui/slider';
export * from '@dmaster/ui/switch';
export * from '@dmaster/ui/toggle-group';

// Components · navigation
export * from '@dmaster/ui/breadcrumbs';
export * from '@dmaster/ui/pagination';
export * from '@dmaster/ui/stepper';
export * from '@dmaster/ui/tabs';

// Components · data-display
export * from '@dmaster/ui/empty-state';
export * from '@dmaster/ui/table';
export * from '@dmaster/ui/timeline';
export * from '@dmaster/ui/tree';

// Components · overlays
export * from '@dmaster/ui/command';
export * from '@dmaster/ui/dialog';
export * from '@dmaster/ui/drawer';
export * from '@dmaster/ui/menu';
export * from '@dmaster/ui/popover';
export * from '@dmaster/ui/toast';
export * from '@dmaster/ui/tooltip';
