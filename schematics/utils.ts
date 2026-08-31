/**
 * Shared helpers for the @dmaster/ui schematics (`ng-add`, `theme`): reading and
 * writing the workspace JSON files, resolving the target project, and mutating a
 * build target's `styles` array. Kept free of logging/flow so each schematic
 * decides how to warn and what to add.
 */

export type JsonRecord = Record<string, unknown>;

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses JSON, returning `null` (instead of throwing) for invalid content. */
export function parseJson(raw: string): JsonRecord | null {
  try {
    const parsed: unknown = JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
    return isJsonRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Serializes JSON keeping the source text's indentation and trailing newline. */
export function stringifyJson(value: JsonRecord, sourceText: string): string {
  const indentMatch = /^[ \t]+/m.exec(sourceText);
  const indent = indentMatch === null ? 2 : indentMatch[0];
  const text = JSON.stringify(value, null, indent);
  return sourceText.endsWith('\n') ? `${text}\n` : text;
}

/** Inserts a key in alphabetical order without reordering the existing keys. */
export function insertSorted(record: JsonRecord, key: string, value: string): JsonRecord {
  const result: JsonRecord = {};
  let inserted = false;
  for (const existingKey of Object.keys(record)) {
    if (!inserted && existingKey > key) {
      result[key] = value;
      inserted = true;
    }
    result[existingKey] = record[existingKey];
  }
  if (!inserted) {
    result[key] = value;
  }
  return result;
}

/** Normalizes a styles path for comparisons: forward slashes, no leading "./" or "/". */
export function normalizeStylePath(path: string): string {
  let normalized = path.replace(/\\/g, '/');
  while (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }
  while (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }
  return normalized;
}

/** Extracts the normalized path of a `styles` entry (plain string or `{ input: … }`). */
export function styleEntryPath(entry: unknown): string | null {
  if (typeof entry === 'string') {
    return normalizeStylePath(entry);
  }
  if (isJsonRecord(entry) && typeof entry['input'] === 'string') {
    return normalizeStylePath(entry['input']);
  }
  return null;
}

export function hasStyleEntry(styles: unknown[], stylePath: string): boolean {
  return styles.some((entry) => styleEntryPath(entry) === stylePath);
}

export interface ResolvedProject {
  name: string;
  project: JsonRecord;
}

/**
 * Picks the requested project, or the first `projectType: "application"` in the
 * workspace. Returns `null` when the requested name is missing or no app exists.
 */
export function resolveProject(
  projects: JsonRecord,
  requestedName?: string,
): ResolvedProject | null {
  if (requestedName !== undefined && requestedName !== '') {
    const requested = projects[requestedName];
    return isJsonRecord(requested) ? { name: requestedName, project: requested } : null;
  }

  for (const [name, project] of Object.entries(projects)) {
    if (isJsonRecord(project) && project['projectType'] === 'application') {
      return { name, project };
    }
  }
  return null;
}

/** The `projects` record of a parsed `angular.json`, or `null` if absent. */
export function workspaceProjects(workspace: JsonRecord): JsonRecord | null {
  return isJsonRecord(workspace['projects']) ? workspace['projects'] : null;
}

/**
 * The build target's `styles` array for a project, creating `options`/`styles`
 * if missing so callers can push to it. Returns `null` when the project has no
 * `build` target. Mutates the project in place — the caller re-serializes.
 */
export function getBuildStyles(project: JsonRecord): unknown[] | null {
  const targets =
    (isJsonRecord(project['architect']) ? project['architect'] : null) ??
    (isJsonRecord(project['targets']) ? project['targets'] : null);
  const build = targets !== null && isJsonRecord(targets['build']) ? targets['build'] : null;
  if (build === null) {
    return null;
  }

  let options: JsonRecord;
  if (isJsonRecord(build['options'])) {
    options = build['options'];
  } else {
    options = {};
    build['options'] = options;
  }

  if (Array.isArray(options['styles'])) {
    return options['styles'];
  }
  const styles: unknown[] = [];
  options['styles'] = styles;
  return styles;
}

/** The project's source root (`sourceRoot`, else `<root>/src`, else `src`). */
export function projectSourceRoot(project: JsonRecord): string {
  const root = typeof project['root'] === 'string' ? normalizeStylePath(project['root']) : '';
  if (typeof project['sourceRoot'] === 'string') {
    return normalizeStylePath(project['sourceRoot']);
  }
  return root === '' ? 'src' : `${root}/src`;
}
