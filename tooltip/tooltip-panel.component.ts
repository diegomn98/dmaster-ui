import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/**
 * Panel interno del tooltip. Lo instancia `DmTooltipDirective` dentro de un
 * overlay del CDK; no forma parte de la API pública.
 */
@Component({
  selector: 'dm-tooltip-panel',
  template: '{{ text() }}',
  styleUrl: './tooltip-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'tooltip' },
})
export class DmTooltipPanelComponent {
  readonly text = signal('');
}
