/** Semantic variant of the toast. */
export type DmToastVariant = 'neutral' | 'success' | 'warning' | 'danger';

/** Viewport placement of the (single, global) toast stack. */
export type DmToastPosition =
  'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center';

/** Action button rendered inside a toast. */
export interface DmToastAction {
  /** Button label. */
  label: string;
  /** Runs on click; the toast is dismissed right after. */
  handler: () => void;
}

/** Per-toast options. */
export interface DmToastOptions {
  variant?: DmToastVariant;
  /** Auto-dismiss delay in ms. `0` disables auto-dismiss. */
  duration?: number;
  /** Shows the dismiss button. */
  dismissible?: boolean;
  /** Bold title rendered above the message. */
  title?: string;
  /** Action button; running it also dismisses the toast. */
  action?: DmToastAction;
}

/** Handle returned by `show()` and its variant helpers. */
export interface DmToastRef {
  id: number;
  dismiss(): void;
  /** Resolves once the toast is gone (auto-dismiss, manual, or `dismissAll`). */
  readonly afterDismissed: Promise<void>;
}

/** Internal representation of an active toast. */
export interface DmToastData {
  id: number;
  message: string;
  variant: DmToastVariant;
  dismissible: boolean;
  title?: string;
  action?: DmToastAction;
}
