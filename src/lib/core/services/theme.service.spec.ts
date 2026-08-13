import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DMASTER_UI_CONFIG } from '../config/dmaster-ui.config';
import { ThemeService } from './theme.service';

type ChangeListener = (event: MediaQueryListEvent) => void;

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  readonly listeners: ChangeListener[];
  addEventListener(type: string, listener: ChangeListener): void;
  removeEventListener(type: string, listener: ChangeListener): void;
  emitChange(matches: boolean): void;
}

interface MatchMediaHost {
  matchMedia?: (query: string) => MediaQueryList;
}

function matchMediaHost(): MatchMediaHost {
  return document.defaultView as unknown as MatchMediaHost;
}

/**
 * jsdom does not implement `matchMedia`, so by default the service sees no media
 * query at all (`media === null`). This installs a controllable stub; it must run
 * BEFORE the first `TestBed.inject(ThemeService)` because the service captures
 * the MediaQueryList at construction time.
 */
function installMatchMedia(matches: boolean): FakeMediaQueryList {
  const listeners: ChangeListener[] = [];
  const fake: FakeMediaQueryList = {
    matches,
    media: '',
    listeners,
    addEventListener(_type: string, listener: ChangeListener): void {
      listeners.push(listener);
    },
    removeEventListener(_type: string, listener: ChangeListener): void {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    },
    emitChange(next: boolean): void {
      fake.matches = next;
      for (const listener of [...listeners]) {
        listener({ matches: next, media: fake.media } as MediaQueryListEvent);
      }
    },
  };

  matchMediaHost().matchMedia = vi.fn((query: string): MediaQueryList => {
    fake.media = query;
    return fake as unknown as MediaQueryList;
  });

  return fake;
}

function themeAttribute(): string | null {
  return document.documentElement.getAttribute('data-dm-theme');
}

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    delete matchMediaHost().matchMedia;
    document.documentElement.removeAttribute('data-dm-theme');
  });

  it('defaults to `auto` and resolves it to light when matchMedia is unavailable', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('auto');
    expect(service.resolvedTheme()).toBe('light');

    TestBed.tick();
    expect(themeAttribute()).toBe('light');
  });

  it('stamps an explicit light theme from the config on <html>', () => {
    TestBed.overrideProvider(DMASTER_UI_CONFIG, {
      useValue: { theme: 'light', density: 'comfortable' },
    });
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');

    TestBed.tick();
    expect(themeAttribute()).toBe('light');
  });

  it('stamps an explicit dark theme from the config on <html>', () => {
    TestBed.overrideProvider(DMASTER_UI_CONFIG, {
      useValue: { theme: 'dark', density: 'comfortable' },
    });
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(service.resolvedTheme()).toBe('dark');

    TestBed.tick();
    expect(themeAttribute()).toBe('dark');
  });

  it('restamps <html> when setTheme() changes the theme', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(themeAttribute()).toBe('light');

    service.setTheme('dark');
    TestBed.tick();

    expect(service.theme()).toBe('dark');
    expect(themeAttribute()).toBe('dark');
  });

  it('toggle() switches to the opposite of the resolved theme', () => {
    // `auto` without matchMedia resolves to light, so the first toggle lands on dark.
    const service = TestBed.inject(ThemeService);

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(service.resolvedTheme()).toBe('dark');

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');

    TestBed.tick();
    expect(themeAttribute()).toBe('light');
  });

  it('resolves `auto` to dark when the OS prefers a dark scheme', () => {
    const media = installMatchMedia(true);
    const service = TestBed.inject(ThemeService);

    expect(media.media).toBe('(prefers-color-scheme: dark)');
    expect(service.theme()).toBe('auto');
    expect(service.resolvedTheme()).toBe('dark');

    TestBed.tick();
    expect(themeAttribute()).toBe('dark');
  });

  it('toggle() from auto resolved as dark lands on explicit light', () => {
    installMatchMedia(true);
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
  });

  it('tracks OS scheme changes live while the theme is `auto`', () => {
    const media = installMatchMedia(false);
    const service = TestBed.inject(ThemeService);

    expect(media.listeners.length).toBe(1);

    TestBed.tick();
    expect(themeAttribute()).toBe('light');

    media.emitChange(true);
    expect(service.resolvedTheme()).toBe('dark');
    TestBed.tick();
    expect(themeAttribute()).toBe('dark');

    media.emitChange(false);
    expect(service.resolvedTheme()).toBe('light');
    TestBed.tick();
    expect(themeAttribute()).toBe('light');
  });

  it('ignores OS scheme changes once an explicit theme is set', () => {
    const media = installMatchMedia(false);
    const service = TestBed.inject(ThemeService);

    service.setTheme('light');
    media.emitChange(true);

    expect(service.resolvedTheme()).toBe('light');
  });

  it('removes its media listener when the injector is destroyed', () => {
    const media = installMatchMedia(false);
    TestBed.inject(ThemeService);
    expect(media.listeners.length).toBe(1);

    TestBed.resetTestingModule();

    expect(media.listeners.length).toBe(0);
  });
});
