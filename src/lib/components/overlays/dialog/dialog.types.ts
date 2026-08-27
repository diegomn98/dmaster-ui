import { DmSize } from '../../../core/types/common.types';

/** Configuration for `DmDialogService.open()`. */
export interface DmDialogConfig<D = unknown> {
  /** Data injected into the content component via `DIALOG_DATA`. */
  data?: D;
  /** Panel width: `sm` 22rem · `md` 30rem · `lg` 42rem. Default `md`. */
  size?: DmSize;
  /** Prevents closing via backdrop click / Escape. Default `false`. */
  disableClose?: boolean;
  /** Accessible name of the dialog. */
  ariaLabel?: string;
  /**
   * Extra class(es) added to the dialog panel. Overlays render at the document
   * root, so a subtree-scoped theme override doesn't reach them — put your
   * theme class here (or a `[data-dm-theme='<name>']` selector) to re-apply a
   * scoped theme inside the dialog.
   */
  panelClass?: string | readonly string[];
}
