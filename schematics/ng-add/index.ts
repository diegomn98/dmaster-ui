import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import {
  JsonRecord,
  ResolvedProject,
  getBuildStyles,
  hasStyleEntry,
  insertSorted,
  isJsonRecord,
  parseJson,
  projectSourceRoot,
  resolveProject,
  stringifyJson,
  styleEntryPath,
  workspaceProjects,
} from '../utils';

/** Options accepted by the `ng add @dmaster/ui` schematic (see schema.json). */
export interface NgAddOptions {
  /** Workspace project to configure. Falls back to the first application in angular.json. */
  project?: string;
  /**
   * Prebuilt color theme to preload. `default` keeps the built-in blue; `custom`
   * preloads nothing (scaffold one later with `ng generate @dmaster/ui:theme`).
   */
  theme?: string;
}

const CDK_PACKAGE = '@angular/cdk';
const CDK_VERSION = '^20.0.0';
const OVERLAY_PREBUILT_CSS = 'node_modules/@angular/cdk/overlay-prebuilt.css';
const PRECOMPILED_CSS = 'node_modules/@dmaster/ui/styles/dmaster-ui.css';
const STYLES_MARKER = '@dmaster/ui/styles';
const SCSS_USE_STATEMENT = "@use '@dmaster/ui/styles/index';";

const THEMES_DIR = 'node_modules/@dmaster/ui/themes/';
/** Prebuilt theme names — mirrors scripts/themes.manifest.mjs and schema.json's enum. */
const PREBUILT_THEMES = [
  'ocean',
  'cobalt',
  'iris',
  'grape',
  'rose',
  'ember',
  'sunset',
  'forest',
  'slate',
];

const MANUAL_STYLES_HELP =
  `configure the styles manually: put "${OVERLAY_PREBUILT_CSS}" at the beginning of the ` +
  `"styles" array of your build target, and load the library styles with ` +
  `"${SCSS_USE_STATEMENT}" in your global stylesheet (or add "${PRECOMPILED_CSS}" to the ` +
  `"styles" array if your app does not use Sass).`;

/**
 * `ng add @dmaster/ui`:
 *
 * 1. Adds `@angular/cdk` to the host package.json (peer dependency used by the overlay
 *    components) and schedules an install, keeping any version already present.
 * 2. Puts the CDK `overlay-prebuilt.css` first in the `styles` array of the target project.
 * 3. Loads the library styles: `@use '@dmaster/ui/styles/index';` in the global Sass
 *    stylesheet, or the precompiled `dmaster-ui.css` bundle when the app does not use Sass.
 *
 * Every step is idempotent, and each one degrades to a logged warning (instead of aborting
 * the whole schematic) when the workspace files cannot be read or parsed.
 */
export function ngAdd(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addAngularCdkDependency(tree, context);
    setupStyles(tree, context, options);
    logNextSteps(context, options);
    return tree;
  };
}

export default ngAdd;

/** Adds `@angular/cdk` to the consumer's dependencies unless some version is already there. */
function addAngularCdkDependency(tree: Tree, context: SchematicContext): void {
  const path = '/package.json';
  if (!tree.exists(path)) {
    context.logger.warn(
      `Could not find ${path} — add "${CDK_PACKAGE}": "${CDK_VERSION}" to your dependencies manually.`,
    );
    return;
  }

  const raw = tree.readText(path);
  const pkg = parseJson(raw);
  if (pkg === null) {
    context.logger.warn(
      `Could not parse ${path} — add "${CDK_PACKAGE}": "${CDK_VERSION}" to your dependencies manually.`,
    );
    return;
  }

  const dependencies = isJsonRecord(pkg['dependencies']) ? pkg['dependencies'] : {};
  const devDependencies = isJsonRecord(pkg['devDependencies']) ? pkg['devDependencies'] : {};
  if (
    typeof dependencies[CDK_PACKAGE] === 'string' ||
    typeof devDependencies[CDK_PACKAGE] === 'string'
  ) {
    context.logger.info(`"${CDK_PACKAGE}" is already installed — keeping the existing version.`);
    return;
  }

  pkg['dependencies'] = insertSorted(dependencies, CDK_PACKAGE, CDK_VERSION);
  tree.overwrite(path, stringifyJson(pkg, raw));
  context.addTask(new NodePackageInstallTask());
  context.logger.info(`Added "${CDK_PACKAGE}": "${CDK_VERSION}" to package.json.`);
}

/** Wires the CDK overlay styles and the library styles into the target project. */
function setupStyles(tree: Tree, context: SchematicContext, options: NgAddOptions): void {
  const path = '/angular.json';
  if (!tree.exists(path)) {
    context.logger.warn(`Could not find ${path} — ${MANUAL_STYLES_HELP}`);
    return;
  }

  const raw = tree.readText(path);
  const workspace = parseJson(raw);
  if (workspace === null) {
    context.logger.warn(
      `Could not parse ${path} (comments or trailing commas?) — ${MANUAL_STYLES_HELP}`,
    );
    return;
  }

  const projects = workspaceProjects(workspace);
  if (projects === null) {
    context.logger.warn(`No "projects" section found in ${path} — ${MANUAL_STYLES_HELP}`);
    return;
  }

  const resolved = resolveProject(projects, options.project);
  if (resolved === null) {
    const message =
      options.project !== undefined && options.project !== ''
        ? `Project "${options.project}" was not found in ${path} — ${MANUAL_STYLES_HELP}`
        : `No application project was found in ${path} — ${MANUAL_STYLES_HELP}`;
    context.logger.warn(message);
    return;
  }

  const styles = getBuildStyles(resolved.project);
  if (styles === null) {
    context.logger.warn(
      `Project "${resolved.name}" has no "build" target in ${path} — ${MANUAL_STYLES_HELP}`,
    );
    return;
  }

  let workspaceChanged = false;

  // 1. CDK overlay structural styles, first in the bundle (required by tooltip/dialog/toast).
  if (!hasStyleEntry(styles, OVERLAY_PREBUILT_CSS)) {
    styles.unshift(OVERLAY_PREBUILT_CSS);
    workspaceChanged = true;
    context.logger.info(
      `Added "${OVERLAY_PREBUILT_CSS}" to the styles of project "${resolved.name}".`,
    );
  }

  // 2. Library styles (Sass @use, or the precompiled CSS bundle as a fallback).
  workspaceChanged = addLibraryStyles(tree, context, resolved, styles) || workspaceChanged;

  // 3. Prebuilt color theme, loaded LAST so its brand tokens win over the base.
  workspaceChanged = addPrebuiltTheme(context, resolved, styles, options.theme) || workspaceChanged;

  if (workspaceChanged) {
    tree.overwrite(path, stringifyJson(workspace, raw));
  }
}

/**
 * Appends the chosen prebuilt theme's CSS to the project's `styles` — last in the
 * array so it overrides the base tokens. No-op for `default`/`custom`/unset, and
 * skipped (with a note) if a `@dmaster/ui` theme is already wired. Returns `true`
 * when the styles array was modified.
 */
function addPrebuiltTheme(
  context: SchematicContext,
  resolved: ResolvedProject,
  styles: unknown[],
  theme: string | undefined,
): boolean {
  if (theme === undefined || theme === '' || theme === 'default' || theme === 'custom') {
    if (theme === 'custom') {
      context.logger.info(
        'Scaffold a custom theme any time with: ng generate @dmaster/ui:theme <name>',
      );
    }
    return false;
  }

  if (!PREBUILT_THEMES.includes(theme)) {
    context.logger.warn(
      `Unknown theme "${theme}" — skipping. Valid themes: ${PREBUILT_THEMES.join(', ')}.`,
    );
    return false;
  }

  const alreadyThemed = styles.some((entry) =>
    (styleEntryPath(entry) ?? '').startsWith(THEMES_DIR),
  );
  if (alreadyThemed) {
    context.logger.info('A @dmaster/ui theme is already configured — leaving it in place.');
    return false;
  }

  const entry = `${THEMES_DIR}${theme}.css`;
  styles.push(entry);
  context.logger.info(`Added the "${theme}" theme ("${entry}") to project "${resolved.name}".`);
  return true;
}

/**
 * Loads the library styles. Prepends `@use '@dmaster/ui/styles/index';` to the project's
 * global Sass stylesheet when there is one; otherwise falls back to adding the precompiled
 * CSS bundle to the `styles` array. Returns `true` when the styles array was modified.
 */
function addLibraryStyles(
  tree: Tree,
  context: SchematicContext,
  resolved: ResolvedProject,
  styles: unknown[],
): boolean {
  const stylesheet = findGlobalStylesheet(resolved.project, styles);

  if (stylesheet !== null && /\.(scss|sass)$/.test(stylesheet)) {
    const filePath = `/${stylesheet}`;
    if (tree.exists(filePath)) {
      const content = tree.readText(filePath);
      if (!content.includes(STYLES_MARKER)) {
        // The indented `.sass` syntax does not allow semicolons.
        const useStatement = stylesheet.endsWith('.sass')
          ? "@use '@dmaster/ui/styles/index'\n"
          : `${SCSS_USE_STATEMENT}\n`;
        tree.overwrite(filePath, useStatement + content);
        context.logger.info(`Added "${SCSS_USE_STATEMENT}" to ${stylesheet}.`);
      }
      return false;
    }
  }

  // No usable Sass stylesheet — load the precompiled CSS bundle instead.
  if (hasStyleEntry(styles, PRECOMPILED_CSS)) {
    return false;
  }
  const overlayIndex = styles.findIndex((entry) => styleEntryPath(entry) === OVERLAY_PREBUILT_CSS);
  styles.splice(overlayIndex + 1, 0, PRECOMPILED_CSS);
  context.logger.info(
    `Added "${PRECOMPILED_CSS}" to the styles of project "${resolved.name}" ` +
      `(no global Sass stylesheet was found).`,
  );
  return true;
}

/**
 * Finds the project's global stylesheet: the first injected `styles` entry (string or
 * `{ input: … }` object) that points inside the project's source root.
 */
function findGlobalStylesheet(project: JsonRecord, styles: unknown[]): string | null {
  const sourceRoot = projectSourceRoot(project);

  for (const entry of styles) {
    if (isJsonRecord(entry) && entry['inject'] === false) {
      continue; // Not part of the global bundle.
    }
    const stylePath = styleEntryPath(entry);
    if (
      stylePath !== null &&
      !stylePath.startsWith('node_modules/') &&
      (sourceRoot === '' || stylePath.startsWith(`${sourceRoot}/`))
    ) {
      return stylePath;
    }
  }
  return null;
}

/** Prints the optional provider setup and a pointer to the getting-started guide. */
function logNextSteps(context: SchematicContext, options: NgAddOptions): void {
  const themedNote =
    options.theme !== undefined &&
    options.theme !== '' &&
    options.theme !== 'default' &&
    options.theme !== 'custom'
      ? `The "${options.theme}" theme is preloaded — the light/dark toggle still works on top of it.`
      : 'Tip: preload a color theme with a prebuilt CSS from @dmaster/ui/themes, or scaffold your own with `ng generate @dmaster/ui:theme <name>`.';

  const lines = [
    '',
    '@dmaster/ui has been added to your workspace.',
    '',
    themedNote,
    '',
    'Optional next step — configure the global defaults in app.config.ts:',
    '',
    "  import { provideDmasterUI } from '@dmaster/ui';",
    '',
    '  export const appConfig: ApplicationConfig = {',
    '    providers: [',
    '      // ...',
    "      provideDmasterUI({ theme: 'auto', density: 'comfortable' }),",
    '    ],',
    '  };',
    '',
    'Getting started: https://dmasterui.com/getting-started',
  ];
  for (const line of lines) {
    context.logger.info(line);
  }
}
