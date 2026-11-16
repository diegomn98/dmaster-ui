import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef, Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DmConfirmDialogComponent } from './confirm-dialog.component';
import { DIALOG_DEFAULTS } from './dialog.tokens';
import { DmConfirmOptions, DmDialogConfig } from './dialog.types';

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
 * Inside the content component/template: `inject(DIALOG_DATA)` for the data and
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
    componentOrTemplate: ComponentType<C> | TemplateRef<C>,
    config: DmDialogConfig<D> = {},
  ): DialogRef<R, C> {
    return this.dialog.open<R, D, C>(componentOrTemplate, {
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

  /**
   * Opens a confirmation dialog and resolves with the user's choice: `true`
   * on confirm, `false` on cancel — and on Escape or backdrop click, which
   * dismiss without confirming. The library ships no copy of its own, so
   * `title`, `confirmLabel` and `cancelLabel` are required.
   *
   * ```ts
   * const confirmed = await this.dialog.confirm({
   *   title: 'Delete this file?',
   *   message: 'This action cannot be undone.',
   *   confirmLabel: 'Delete',
   *   cancelLabel: 'Cancel',
   *   color: 'danger',
   * });
   * ```
   */
  confirm(options: DmConfirmOptions): Promise<boolean> {
    const ref = this.open<boolean, DmConfirmOptions, DmConfirmDialogComponent>(
      DmConfirmDialogComponent,
      {
        data: options,
        size: options.size,
        disableClose: options.disableClose,
        ariaLabel: options.title,
        panelClass: options.panelClass,
      },
    );
    return firstValueFrom(ref.closed).then((confirmed) => confirmed === true);
  }

  /** Closes every open dialog. */
  closeAll(): void {
    this.dialog.closeAll();
  }
}
