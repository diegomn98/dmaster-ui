import { Injectable, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ICON_SETS } from './icon.tokens';
import { DmIconSet } from './icon.types';

/**
 * Holds every icon registered via {@link provideDmasterIcons} (plus any added at
 * runtime) and hands out sanitizer-trusted markup for `dm-icon` to render.
 *
 * SSR-safe: it never touches the DOM — only `DomSanitizer`, which is provided on
 * both the browser and server platforms.
 */
@Injectable({ providedIn: 'root' })
export class DmIconRegistry {
  private readonly sanitizer = inject(DomSanitizer);

  /** Sets contributed by `provideDmasterIcons` (constant for the app's lifetime). */
  private readonly seeded = inject(ICON_SETS, { optional: true }) ?? [];

  /** Icons registered imperatively at runtime; these override seeded ones. */
  private readonly runtime = signal<DmIconSet>({});

  /** All names → markup, seeded sets first, runtime last (later wins). */
  private readonly merged = computed<DmIconSet>(() => {
    const all: DmIconSet = {};
    for (const set of this.seeded) {
      Object.assign(all, set);
    }
    return Object.assign(all, this.runtime());
  });

  /** Per-name cache so each icon is sanitized at most once. */
  private readonly cache = new Map<string, SafeHtml>();

  /** Register (or override) a single icon by name at runtime. */
  register(name: string, svg: string): void {
    this.cache.delete(name);
    this.runtime.update((current) => ({ ...current, [name]: svg }));
  }

  /** Trusted markup for a registered icon, or `null` when the name is unknown. */
  get(name: string): SafeHtml | null {
    const svg = this.merged()[name];
    if (!svg) {
      return null;
    }
    let safe = this.cache.get(name);
    if (!safe) {
      safe = this.sanitizer.bypassSecurityTrustHtml(svg);
      this.cache.set(name, safe);
    }
    return safe;
  }

  /** Every known icon name, sorted — handy for docs, pickers and tests. */
  names(): string[] {
    return Object.keys(this.merged()).sort();
  }
}
