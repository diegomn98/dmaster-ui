import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DMASTER_UI_CONFIG } from '../config/dmaster-ui.config';
import { DensityService } from './density.service';

function densityAttribute(): string | null {
  return document.documentElement.getAttribute('data-dm-density');
}

describe('DensityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-dm-density');
  });

  it('defaults to `comfortable` and stamps it on <html>', () => {
    const service = TestBed.inject(DensityService);

    expect(service.density()).toBe('comfortable');

    TestBed.tick();
    expect(densityAttribute()).toBe('comfortable');
  });

  it('restamps <html> when setDensity() changes the density', () => {
    const service = TestBed.inject(DensityService);
    TestBed.tick();
    expect(densityAttribute()).toBe('comfortable');

    service.setDensity('compact');
    TestBed.tick();
    expect(service.density()).toBe('compact');
    expect(densityAttribute()).toBe('compact');

    service.setDensity('spacious');
    TestBed.tick();
    expect(service.density()).toBe('spacious');
    expect(densityAttribute()).toBe('spacious');
  });

  it('starts from a custom density provided via DMASTER_UI_CONFIG', () => {
    TestBed.overrideProvider(DMASTER_UI_CONFIG, {
      useValue: { theme: 'auto', density: 'spacious' },
    });
    const service = TestBed.inject(DensityService);

    expect(service.density()).toBe('spacious');

    TestBed.tick();
    expect(densityAttribute()).toBe('spacious');
  });
});
