import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { DMASTER_UI_CONFIG } from '../config/dmaster-ui.config';
import { DmResolvedTheme, DmTheme } from '../types/common.types';

/**
 * Owns the active theme. Resolves `auto` against `prefers-color-scheme`
 * (tracking OS changes live) and stamps the resolved value on
 * `<html data-dm-theme="...">`, which is what the CSS themes key off.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly media =
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly systemPrefersDark = signal(this.media?.matches ?? false);
  private readonly _theme = signal<DmTheme>(inject(DMASTER_UI_CONFIG).theme);

  /** Theme as requested (`'light' | 'dark' | 'auto'`). */
  readonly theme = this._theme.asReadonly();

  /** Theme actually applied after resolving `auto`. */
  readonly resolvedTheme = computed<DmResolvedTheme>(() => {
    const theme = this._theme();
    return theme === 'auto' ? (this.systemPrefersDark() ? 'dark' : 'light') : theme;
  });

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

  setTheme(theme: DmTheme): void {
    this._theme.set(theme);
  }

  /** Switches to the opposite of the currently resolved theme. */
  toggle(): void {
    this._theme.set(this.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }
}
