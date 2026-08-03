import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TOAST_DEFAULTS } from './toast.tokens';
import { DmToastService } from './toast.service';

/**
 * Pila de toasts. La instancia `DmToastService` dentro de un overlay global
 * del CDK la primera vez que se muestra un toast; no es API pública.
 */
@Component({
  selector: 'dm-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmToastContainerComponent {
  protected readonly service = inject(DmToastService);
  protected readonly defaults = inject(TOAST_DEFAULTS);
}
