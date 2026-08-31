import { DmSize } from '../../../core/types/common.types';
import type { DmButtonColor } from '../../buttons/button';

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

/**
 * Options for `DmDialogService.confirm()`. The library ships no copy of its
 * own, so the title and both button labels are required — there are no
 * default strings.
 */
export interface DmConfirmOptions {
  /** Heading of the confirmation dialog. Doubles as its accessible name. */
  title: string;
  /** Optional supporting text under the title. */
  message?: string;
  /** Label of the confirming button; clicking it resolves with `true`. */
  confirmLabel: string;
  /** Label of the cancel button; clicking it resolves with `false`. */
  cancelLabel: string;
  /** Semantic color of the confirming button. Default `primary`. */
  color?: DmButtonColor;
  /** Panel width: `sm` 22rem · `md` 30rem · `lg` 42rem. Default `md`. */
  size?: DmSize;
  /** Prevents dismissing via backdrop click / Escape. Default `false`. */
  disableClose?: boolean;
  /**
   * Extra class(es) added to the dialog panel — same semantics as
   * `DmDialogConfig.panelClass`.
   */
  panelClass?: string | readonly string[];
}
