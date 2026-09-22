import { Observable } from 'rxjs';

/** Semantic variant of the toast. `loading` shows a spinner (used by `promise()`). */
export type DmToastVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'loading';

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

/** Fields `update()` can change on a live toast. `undefined` leaves a field as is. */
export interface DmToastUpdate extends DmToastOptions {
  message?: string;
}

/** Copy for the three states of `promise()`. Functions receive the value / error. */
export interface DmToastPromiseMessages<T> {
  loading: string;
  success: string | ((value: T) => string);
  error: string | ((error: unknown) => string);
}

/** Handle returned by `show()`, the variant helpers and `promise()`. */
export interface DmToastRef {
  id: number;
  dismiss(): void;
  /** Change message / variant / duration… of a live toast (no-op once dismissed). */
  update(patch: DmToastUpdate): void;
  /** Resolves once the toast is gone (auto-dismiss, manual, or `dismissAll`). */
  readonly afterDismissed: Promise<void>;
}

/** Internal representation of a toast (visible or waiting in the queue). */
export interface DmToastData {
  id: number;
  message: string;
  variant: DmToastVariant;
  dismissible: boolean;
  /** Auto-dismiss delay in ms (`0` = sticky); restarted by `update({ duration })`. */
  duration: number;
  title?: string;
  action?: DmToastAction;
}

/** What `promise()` accepts: a Promise, or an Observable (its first value). */
export type DmToastPromiseInput<T> = Promise<T> | Observable<T>;
