import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { ALERT_DEFAULTS } from './alert.tokens';
import { DmAlertColor, DmAlertVariant } from './alert.types';

/**
 * Contextual feedback banner with a color × variant API, a
 * semantic icon per color, an optional dismiss button and an action slot.
 *
 * ```html
 * <dm-alert color="success" title="Payment received" description="We emailed the receipt." />
 *
 * <dm-alert color="danger" variant="faded" title="Message deleted" [dismissible]="true">
 *   <dm-button dmAlertAction size="sm" variant="light" color="danger">Undo</dm-button>
 * </dm-alert>
 * ```
 *
 * Dismissing is self-contained: the alert hides itself and emits `closed`.
 * To show it again, re-create it with an `@if` in the consumer.
 */
@Component({
  selector: 'dm-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    '[attr.data-color]': 'color()',
    '[attr.data-variant]': 'variant()',
    '[class.dm-alert--hidden]': '!visible()',
  },
})
export class DmAlertComponent {
  private readonly defaults = inject(ALERT_DEFAULTS);

  /** Semantic color. It also selects the built-in icon. */
  readonly color = input<DmAlertColor>(this.defaults.color);

  /** Visual variant. */
  readonly variant = input<DmAlertVariant>(this.defaults.variant);

  /** Bold first line of the alert. */
  readonly title = input<string>();

  /** Supporting text under the title. Free content can also be projected. */
  readonly description = input<string>();

  /** Hides the semantic icon. */
  readonly hideIcon = input<boolean>(false);

  /** Shows the dismiss button; the alert hides itself when pressed. */
  readonly dismissible = input<boolean>(false);

  /** Accessible label of the dismiss button. Defaults from `ALERT_DEFAULTS`. */
  readonly dismissLabel = input<string>(this.defaults.dismissLabel);

  /** Emitted after the alert dismisses itself. */
  readonly closed = output<void>();

  /** Self-dismiss state: once false, the host collapses via `display: none`. */
  protected readonly visible = signal(true);

  /** Icon family: status colors keep their own glyph, the rest share info. */
  protected readonly tone = computed<'info' | 'success' | 'warning' | 'danger'>(() => {
    const color = this.color();
    return color === 'success' || color === 'warning' || color === 'danger' ? color : 'info';
  });

  protected dismiss(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
