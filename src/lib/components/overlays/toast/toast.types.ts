/** Semantic variant of the toast. */
export type DmToastVariant = 'neutral' | 'success' | 'warning' | 'danger';

/** Per-toast options. */
export interface DmToastOptions {
  variant?: DmToastVariant;
  /** Auto-dismiss delay in ms. `0` disables auto-dismiss. */
  duration?: number;
  /** Shows the dismiss button. */
  dismissible?: boolean;
}

/** Handle returned by `show()` and its variant helpers. */
export interface DmToastRef {
  id: number;
  dismiss(): void;
}

/** Internal representation of an active toast. */
export interface DmToastData {
  id: number;
  message: string;
  variant: DmToastVariant;
  dismissible: boolean;
}
