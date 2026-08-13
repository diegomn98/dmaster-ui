import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DensityService } from '../services/density.service';
import { ThemeService } from '../services/theme.service';
import { DMASTER_UI_CONFIG } from './dmaster-ui.config';
import { provideDmasterUI } from './provide-dmaster-ui';

describe('provideDmasterUI', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-dm-theme');
    document.documentElement.removeAttribute('data-dm-density');
  });

  it('falls back to the default config when provideDmasterUI() was not called', () => {
    const config = TestBed.inject(DMASTER_UI_CONFIG);

    expect(config).toEqual({ theme: 'auto', density: 'comfortable' });
  });

  it('exposes the full provided config through DMASTER_UI_CONFIG', () => {
    TestBed.configureTestingModule({
      providers: [provideDmasterUI({ theme: 'dark', density: 'compact' })],
    });

    expect(TestBed.inject(DMASTER_UI_CONFIG)).toEqual({ theme: 'dark', density: 'compact' });
  });

  it('merges a partial config over the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideDmasterUI({ density: 'spacious' })],
    });

    expect(TestBed.inject(DMASTER_UI_CONFIG)).toEqual({ theme: 'auto', density: 'spacious' });
  });

  it('keeps the defaults when called without arguments', () => {
    TestBed.configureTestingModule({
      providers: [provideDmasterUI()],
    });

    expect(TestBed.inject(DMASTER_UI_CONFIG)).toEqual({ theme: 'auto', density: 'comfortable' });
  });

  it('seeds ThemeService and DensityService with the provided config', () => {
    TestBed.configureTestingModule({
      providers: [provideDmasterUI({ theme: 'dark', density: 'compact' })],
    });

    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(TestBed.inject(DensityService).density()).toBe('compact');
  });

  it('eagerly stamps <html> at injector creation without injecting the services', () => {
    TestBed.configureTestingModule({
      providers: [provideDmasterUI({ theme: 'dark', density: 'compact' })],
    });

    // Creating the environment runs the initializer, which instantiates the services.
    TestBed.inject(ApplicationRef);
    TestBed.tick();

    expect(document.documentElement.getAttribute('data-dm-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-dm-density')).toBe('compact');
  });
});
