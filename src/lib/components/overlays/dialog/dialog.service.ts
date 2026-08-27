import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';

import { DIALOG_DEFAULTS } from './dialog.tokens';
import { DmDialogConfig } from './dialog.types';

/**
 * Thin wrapper over the CDK Dialog with the library look. Focus trap,
 * Escape/backdrop handling and `aria-modal` come from the CDK.
 *
 * ```ts
 * private readonly dialog = inject(DmDialogService);
 *
 * openSettings(): void {
 *   const ref = this.dialog.open(SettingsDialogComponent, { size: 'lg', data: { userId: 7 } });
 *   ref.closed.subscribe((result) => …);
 * }
 * ```
 *
 * Inside the content component: `inject(DIALOG_DATA)` for the data and
 * `inject(DialogRef)` to close (both re-exported from this entry point).
 *
 * Requires the CDK structural styles once per app:
 * `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", …]`
 */
@Injectable({ providedIn: 'root' })
export class DmDialogService {
  private readonly dialog = inject(Dialog);
  private readonly defaults = inject(DIALOG_DEFAULTS);

  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config: DmDialogConfig<D> = {},
  ): DialogRef<R, C> {
    return this.dialog.open<R, D, C>(component, {
      data: config.data,
      disableClose: config.disableClose ?? this.defaults.disableClose,
      ariaLabel: config.ariaLabel,
      ariaModal: true,
      panelClass: [
        'dm-dialog-panel',
        `dm-dialog-panel--${config.size ?? this.defaults.size}`,
        ...(config.panelClass ? [config.panelClass].flat() : []),
      ],
      backdropClass: 'dm-dialog-backdrop',
    });
  }

  /** Closes every open dialog. */
  closeAll(): void {
    this.dialog.closeAll();
  }
}
