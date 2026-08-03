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
}
