import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ReducedMotionService } from './reduced-motion.service';

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
 * BEFORE the first `TestBed.inject(ReducedMotionService)` because the service
 * captures the MediaQueryList at construction time.
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

describe('ReducedMotionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    delete matchMediaHost().matchMedia;
  });

  it('reports false when matchMedia is unavailable (jsdom default)', () => {
    const service = TestBed.inject(ReducedMotionService);

    expect(service.reducedMotion()).toBe(false);
  });

  it('reflects an active `prefers-reduced-motion: reduce` preference', () => {
    const media = installMatchMedia(true);
    const service = TestBed.inject(ReducedMotionService);

    expect(media.media).toBe('(prefers-reduced-motion: reduce)');
    expect(service.reducedMotion()).toBe(true);
  });

  it('reports false while the OS does not request reduced motion', () => {
    installMatchMedia(false);
    const service = TestBed.inject(ReducedMotionService);

    expect(service.reducedMotion()).toBe(false);
  });

  it('updates the signal live when the OS preference changes', () => {
    const media = installMatchMedia(false);
    const service = TestBed.inject(ReducedMotionService);

    expect(media.listeners.length).toBe(1);
    expect(service.reducedMotion()).toBe(false);

    media.emitChange(true);
    expect(service.reducedMotion()).toBe(true);

    media.emitChange(false);
    expect(service.reducedMotion()).toBe(false);
  });

  it('removes its media listener when the injector is destroyed', () => {
    const media = installMatchMedia(false);
    TestBed.inject(ReducedMotionService);
    expect(media.listeners.length).toBe(1);

    TestBed.resetTestingModule();

    expect(media.listeners.length).toBe(0);
  });
});
