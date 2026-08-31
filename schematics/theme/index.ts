import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';

import {
  getBuildStyles,
  hasStyleEntry,
  normalizeStylePath,
  parseJson,
  projectSourceRoot,
  resolveProject,
  stringifyJson,
  workspaceProjects,
} from '../utils';

/** Options accepted by `ng generate @dmaster/ui:theme` (see schema.json). */
export interface ThemeOptions {
  /** Theme name — the file name and, in named mode, the `data-dm-theme` value. */
  name: string;
  /** Workspace project to add the theme to. Falls back to the first application. */
  project?: string;
  /** Seed brand color (#rrggbb or #rgb). Everything else derives from it. */
  primary?: string;
  /** Switchable named theme (`data-dm-theme`) instead of a global recolor. */
  named?: boolean;
  /** Base scheme for a named theme. */
  scheme?: 'light' | 'dark';
  /** Directory for the generated file. Defaults to the project source root. */
  path?: string;
  /** Skip wiring the generated CSS into angular.json. */
  skipImport?: boolean;
}

const DEFAULT_PRIMARY = '#7c3aed';
const FULL_HEX = /^#[0-9a-f]{6}$/;
const SHORT_HEX = /^#[0-9a-f]{3}$/;
const ANGULAR_JSON = '/angular.json';

/**
 * `ng generate @dmaster/ui:theme <name>`:
 *
 * Scaffolds a custom theme as plain CSS (overriding `--dm-primary`, with a
 * commented map of every other knob) and wires it into the project's
 * `angular.json` styles — last, so it overrides the base tokens.
 *
 * Default is a **global recolor** (`:root` + `[data-dm-theme='dark']`, so the
 * light/dark toggle keeps working). `--named` instead emits a switchable
 * `[data-dm-theme='<name>']` block and prints the `provideDmasterUI` snippet to
 * register it.
 */
export function theme(options: ThemeOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const name = strings.dasherize(options.name ?? '');
    if (name === '') {
      throw new SchematicsException(
        'A theme name is required, e.g. `ng generate @dmaster/ui:theme brand`.',
      );
    }

    const primary = normalizeHex(options.primary);
    if (options.primary !== undefined && options.primary !== '' && primary === null) {
      context.logger.warn(
        `"${options.primary}" is not a valid hex color — using the default ${DEFAULT_PRIMARY}.`,
      );
    }

    const named = options.named === true;
    const scheme = options.scheme === 'dark' ? 'dark' : 'light';
    const label = strings.classify(name);
    const targetDir = resolveTargetDir(tree, options);

    const templateSource = apply(url('./files'), [
      applyTemplates({
        ...strings,
        name,
        label,
        primary: primary ?? DEFAULT_PRIMARY,
        named,
        scheme,
      }),
      move(targetDir),
    ]);

    return chain([
      mergeWith(templateSource),
      (host, ctx) => {
        if (options.skipImport !== true) {
          wireStyle(host, ctx, options, name, targetDir);
        }
        return host;
      },
      (host, ctx) => {
        logNextSteps(ctx, { name, label, named, scheme, primary: primary ?? DEFAULT_PRIMARY });
        return host;
      },
    ])(tree, context);
  };
}

export default theme;

/** Normalizes a hex color to lowercase `#rrggbb`, expanding `#rgb`. `null` if invalid. */
function normalizeHex(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const hex = value.trim().toLowerCase();
  if (FULL_HEX.test(hex)) {
    return hex;
  }
  if (SHORT_HEX.test(hex)) {
    const [r, g, b] = hex.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

/** Directory for the generated file: explicit `path`, else the project source root. */
function resolveTargetDir(tree: Tree, options: ThemeOptions): string {
  if (options.path !== undefined && options.path !== '') {
    return normalizeStylePath(options.path);
  }
  if (tree.exists(ANGULAR_JSON)) {
    const workspace = parseJson(tree.readText(ANGULAR_JSON));
    const projects = workspace !== null ? workspaceProjects(workspace) : null;
    const resolved = projects !== null ? resolveProject(projects, options.project) : null;
    if (resolved !== null) {
      return projectSourceRoot(resolved.project);
    }
  }
  return 'src';
}

/** Appends the generated theme CSS to the project's build `styles` (last = wins). */
function wireStyle(
  tree: Tree,
  context: SchematicContext,
  options: ThemeOptions,
  name: string,
  targetDir: string,
): void {
  const entry = `${targetDir}/${name}.theme.css`;
  const manualHelp = `add "${entry}" to the "styles" array of your build target in angular.json (after the @dmaster/ui base styles).`;

  if (!tree.exists(ANGULAR_JSON)) {
    context.logger.warn(`Could not find angular.json — ${manualHelp}`);
    return;
  }
  const raw = tree.readText(ANGULAR_JSON);
  const workspace = parseJson(raw);
  const projects = workspace !== null ? workspaceProjects(workspace) : null;
  if (workspace === null || projects === null) {
    context.logger.warn(`Could not read angular.json — ${manualHelp}`);
    return;
  }
  const resolved = resolveProject(projects, options.project);
  if (resolved === null) {
    context.logger.warn(`No application project found in angular.json — ${manualHelp}`);
    return;
  }
  const styles = getBuildStyles(resolved.project);
  if (styles === null) {
    context.logger.warn(`Project "${resolved.name}" has no "build" target — ${manualHelp}`);
    return;
  }
  if (hasStyleEntry(styles, entry)) {
    return;
  }
  styles.push(entry);
  tree.overwrite(ANGULAR_JSON, stringifyJson(workspace, raw));
  context.logger.info(`Added "${entry}" to the styles of project "${resolved.name}".`);
}

interface NextStepsInfo {
  name: string;
  label: string;
  named: boolean;
  scheme: 'light' | 'dark';
  primary: string;
}

/** Prints what was created and, for named themes, the provider registration. */
function logNextSteps(context: SchematicContext, info: NextStepsInfo): void {
  const lines = [
    '',
    `Created the "${info.label}" theme (${info.named ? 'named' : 'global'} recolor, primary ${info.primary}).`,
    '',
  ];

  if (info.named) {
    lines.push(
      `Register it so ThemeService.setTheme('${info.name}') works — in your ApplicationConfig:`,
      '',
      "  import { provideDmasterUI } from '@dmaster/ui';",
      '',
      '  providers: [',
      `    provideDmasterUI({ themes: { '${info.name}': { scheme: '${info.scheme}', label: '${info.label}' } } }),`,
      '  ],',
      '',
      `Then apply it at runtime: inject(ThemeService).setTheme('${info.name}').`,
    );
  } else {
    lines.push(
      'Tweak --dm-primary (and any token) in the generated file — the whole color',
      'family re-derives automatically, in both light and dark.',
    );
  }

  for (const line of lines) {
    context.logger.info(line);
  }
}
