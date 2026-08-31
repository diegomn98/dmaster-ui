import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DmButtonColor, DmButtonComponent } from '../../buttons/button';
import { DmConfirmOptions } from './dialog.types';

/**
 * Content component behind `DmDialogService.confirm()`: title, optional
 * message and a cancel / confirm footer that closes the dialog with `false` /
 * `true`. Exported so the docs can reference it — open it through
 * `DmDialogService.confirm()` rather than instantiating it directly.
 *
 * Every visible string comes from {@link DmConfirmOptions}; the component
 * ships no copy of its own.
 */
@Component({
  selector: 'dm-confirm-dialog',
  imports: [DmButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmConfirmDialogComponent {
  protected readonly options = inject<DmConfirmOptions>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);

  /** Color of the confirming button; the cancel button stays neutral. */
  protected readonly confirmColor: DmButtonColor = this.options.color ?? 'primary';
}
