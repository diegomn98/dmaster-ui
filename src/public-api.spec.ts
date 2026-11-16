/**
 * Contract of the deprecated primary entry point `@dmaster/ui` (0.12+).
 *
 * The primary is only `export *` of every secondary entry point. These specs
 * guard what that must keep meaning for apps that haven't migrated yet:
 * every runtime export of every `@dmaster/ui/<name>` is reachable from
 * `@dmaster/ui` as the SAME value (no duplicated classes/tokens), and no two
 * entry points export different values under one name — at runtime, `export *`
 * silently DROPS such a name from the primary (ES semantics). TypeScript
 * already rejects the clash when compiling the primary (TS2308); the runtime
 * check here is the second line of defence.
 *
 * Imported relatively on purpose: nothing inside the library may import the
 * `@dmaster/ui` specifier (scripts/check-entry-points.mjs).
 */
import * as primary from './public-api';

import * as accordionEntry from '@dmaster/ui/accordion';
import * as alertEntry from '@dmaster/ui/alert';
import * as autocompleteEntry from '@dmaster/ui/autocomplete';
import * as avatarEntry from '@dmaster/ui/avatar';
import * as badgeEntry from '@dmaster/ui/badge';
import * as breadcrumbsEntry from '@dmaster/ui/breadcrumbs';
import * as buttonGroupEntry from '@dmaster/ui/button-group';
import * as buttonEntry from '@dmaster/ui/button';
import * as cardEntry from '@dmaster/ui/card';
import * as checkboxEntry from '@dmaster/ui/checkbox';
import * as chipEntry from '@dmaster/ui/chip';
import * as colorPickerEntry from '@dmaster/ui/color-picker';
import * as commandEntry from '@dmaster/ui/command';
import * as copyButtonEntry from '@dmaster/ui/copy-button';
import * as coreEntry from '@dmaster/ui/core';
import * as datePickerEntry from '@dmaster/ui/date-picker';
import * as dialogEntry from '@dmaster/ui/dialog';
import * as dividerEntry from '@dmaster/ui/divider';
import * as drawerEntry from '@dmaster/ui/drawer';
import * as emptyStateEntry from '@dmaster/ui/empty-state';
import * as errorEntry from '@dmaster/ui/error';
import * as fileUploadEntry from '@dmaster/ui/file-upload';
import * as formFieldEntry from '@dmaster/ui/form-field';
import * as iconEntry from '@dmaster/ui/icon';
import * as kbdEntry from '@dmaster/ui/kbd';
import * as menuEntry from '@dmaster/ui/menu';
import * as numberInputEntry from '@dmaster/ui/number-input';
import * as otpEntry from '@dmaster/ui/otp';
import * as paginationEntry from '@dmaster/ui/pagination';
import * as popoverEntry from '@dmaster/ui/popover';
import * as progressEntry from '@dmaster/ui/progress';
import * as radioGroupEntry from '@dmaster/ui/radio-group';
import * as ratingEntry from '@dmaster/ui/rating';
import * as searchFieldEntry from '@dmaster/ui/search-field';
import * as selectEntry from '@dmaster/ui/select';
import * as skeletonEntry from '@dmaster/ui/skeleton';
import * as sliderEntry from '@dmaster/ui/slider';
import * as spinnerEntry from '@dmaster/ui/spinner';
import * as stepperEntry from '@dmaster/ui/stepper';
import * as switchEntry from '@dmaster/ui/switch';
import * as tableEntry from '@dmaster/ui/table';
import * as tabsEntry from '@dmaster/ui/tabs';
import * as timelineEntry from '@dmaster/ui/timeline';
import * as toastEntry from '@dmaster/ui/toast';
import * as toggleGroupEntry from '@dmaster/ui/toggle-group';
import * as tooltipEntry from '@dmaster/ui/tooltip';
import * as treeEntry from '@dmaster/ui/tree';

const ENTRIES: Record<string, Record<string, unknown>> = {
  accordion: accordionEntry,
  alert: alertEntry,
  autocomplete: autocompleteEntry,
  avatar: avatarEntry,
  badge: badgeEntry,
  breadcrumbs: breadcrumbsEntry,
  'button-group': buttonGroupEntry,
  button: buttonEntry,
  card: cardEntry,
  checkbox: checkboxEntry,
  chip: chipEntry,
  'color-picker': colorPickerEntry,
  command: commandEntry,
  'copy-button': copyButtonEntry,
  core: coreEntry,
  'date-picker': datePickerEntry,
  dialog: dialogEntry,
  divider: dividerEntry,
  drawer: drawerEntry,
  'empty-state': emptyStateEntry,
  error: errorEntry,
  'file-upload': fileUploadEntry,
  'form-field': formFieldEntry,
  icon: iconEntry,
  kbd: kbdEntry,
  menu: menuEntry,
  'number-input': numberInputEntry,
  otp: otpEntry,
  pagination: paginationEntry,
  popover: popoverEntry,
  progress: progressEntry,
  'radio-group': radioGroupEntry,
  rating: ratingEntry,
  'search-field': searchFieldEntry,
  select: selectEntry,
  skeleton: skeletonEntry,
  slider: sliderEntry,
  spinner: spinnerEntry,
  stepper: stepperEntry,
  switch: switchEntry,
  table: tableEntry,
  tabs: tabsEntry,
  timeline: timelineEntry,
  toast: toastEntry,
  'toggle-group': toggleGroupEntry,
  tooltip: tooltipEntry,
  tree: treeEntry,
};

describe('@dmaster/ui primary entry point (deprecated re-export)', () => {
  const primaryExports = primary as Record<string, unknown>;

  it('covers every secondary entry point except the icons set', () => {
    expect(Object.keys(ENTRIES)).toHaveLength(47);
    for (const [entry, mod] of Object.entries(ENTRIES)) {
      expect(
        Object.keys(mod).length,
        `@dmaster/ui/${entry} has no runtime exports`,
      ).toBeGreaterThan(0);
    }
  });

  it('re-exports every runtime export of every entry point, by identity', () => {
    const missing: string[] = [];
    for (const [entry, mod] of Object.entries(ENTRIES)) {
      for (const [name, value] of Object.entries(mod)) {
        if (primaryExports[name] !== value) missing.push(`@dmaster/ui/${entry} › ${name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has no export of its own beyond the secondaries', () => {
    const fromSecondaries = new Set(Object.values(ENTRIES).flatMap((mod) => Object.keys(mod)));
    expect(Object.keys(primaryExports).filter((name) => !fromSecondaries.has(name))).toEqual([]);
  });

  it('has no name exported with different values by two entry points', () => {
    const owner = new Map<string, { entry: string; value: unknown }>();
    const clashes: string[] = [];
    for (const [entry, mod] of Object.entries(ENTRIES)) {
      for (const [name, value] of Object.entries(mod)) {
        const seen = owner.get(name);
        if (seen && seen.value !== value) clashes.push(`${name}: ${seen.entry} vs ${entry}`);
        else owner.set(name, { entry, value });
      }
    }
    expect(clashes).toEqual([]);
  });

  it('shares the CDK dialog symbols between dialog and drawer', () => {
    expect(ENTRIES['drawer']['DIALOG_DATA']).toBe(ENTRIES['dialog']['DIALOG_DATA']);
    expect(ENTRIES['drawer']['DialogRef']).toBe(ENTRIES['dialog']['DialogRef']);
  });

  it('exposes the button-group token from @dmaster/ui/button (no entry-point cycle)', () => {
    expect(ENTRIES['button']['DM_BUTTON_GROUP']).toBeDefined();
    expect(primaryExports['DM_BUTTON_GROUP']).toBe(ENTRIES['button']['DM_BUTTON_GROUP']);
  });
});
