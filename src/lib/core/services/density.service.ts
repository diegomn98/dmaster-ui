import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

import { DMASTER_UI_CONFIG } from '../config/dmaster-ui.config';
import { DmDensity } from '../types/common.types';

/**
 * Owns the global density and stamps it on `<html data-dm-density="...">`,
 * which drives the density token overrides in the stylesheet.
 */
@Injectable({ providedIn: 'root' })
export class DensityService {
  private readonly document = inject(DOCUMENT);
  private readonly _density = signal<DmDensity>(inject(DMASTER_UI_CONFIG).density);

  readonly density = this._density.asReadonly();

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-dm-density', this._density());
    });
  }

  setDensity(density: DmDensity): void {
    this._density.set(density);
  }
}
