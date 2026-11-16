import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { DMASTER_UI_CONFIG } from '../config/dmaster-ui.config';
import { DmResolvedTheme, DmTheme, DmThemeDefinition } from '../types/common.types';

/** A registered theme with its name attached — the shape a picker iterates. */
export interface DmRegisteredTheme extends DmThemeDefinition {
  /** The value stamped on `<html data-dm-theme>` and matched by the CSS block. */
  readonly name: string;
}

const BUILT_IN: Record<string, DmThemeDefinition> = {
  light: { scheme: 'light', label: 'Light' },
  dark: { scheme: 'dark', label: 'Dark' },
};

/**
 * Owns the active theme. Resolves `auto` against `prefers-color-scheme`
 * (tracking OS changes live) and stamps the resolved value on
 * `<html data-dm-theme="...">`, which is what the CSS themes key off.
 *
 * Beyond the built-in `light`/`dark`, any **custom named theme** registered
 * through `provideDmasterUI({ themes })` can be applied by name — its tokens
 * live under a `[data-dm-theme='<name>']` CSS block the consumer authors.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(DMASTER_UI_CONFIG);

  /** Built-in themes plus any registered by the consumer (consumer wins ties). */
  private readonly registry: Readonly<Record<string, DmThemeDefinition>> = {
    ...BUILT_IN,
    ...this.config.themes,
  };

  private readonly media =
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly systemPrefersDark = signal(this.media?.matches ?? false);
  private readonly _theme = signal<DmTheme>(inject(DMASTER_UI_CONFIG).theme);

  /** Theme as requested (`'auto' | 'light' | 'dark' | '<custom name>'`). */
  readonly theme = this._theme.asReadonly();

  /**
   * Theme actually applied to `<html data-dm-theme>` — `auto` resolved to
   * `light`/`dark`, every other value passed through unchanged.
   */
  readonly resolvedTheme = computed<string>(() => {
    const theme = this._theme();
    return theme === 'auto' ? (this.systemPrefersDark() ? 'dark' : 'light') : theme;
  });

  /**
   * The base light/dark scheme the active theme is built on (a custom named
   * theme declares this when registered; unknown names default to `light`).
   * Useful for `color-scheme`, icons and any app-side light/dark branching.
   */
  readonly scheme = computed<DmResolvedTheme>(
    () => this.registry[this.resolvedTheme()]?.scheme ?? 'light',
  );

  /** Every registered theme (built-in + custom), for building a theme picker. */
  readonly themes = computed<DmRegisteredTheme[]>(() =>
    Object.entries(this.registry).map(([name, def]) => ({ name, ...def })),
  );

  constructor() {
    if (this.media) {
      const onChange = (event: MediaQueryListEvent) => this.systemPrefersDark.set(event.matches);
      this.media.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => this.media?.removeEventListener('change', onChange));
    }

    effect(() => {
      this.document.documentElement.setAttribute('data-dm-theme', this.resolvedTheme());
    });
  }

  /** Applies a theme by name (`'auto' | 'light' | 'dark' | '<custom name>'`). */
  setTheme(theme: DmTheme): void {
    this._theme.set(theme);
  }

  /** Switches between the light and dark base schemes of the active theme. */
  toggle(): void {
    this._theme.set(this.scheme() === 'dark' ? 'light' : 'dark');
  }
}
