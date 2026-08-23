import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal"
      [class.bg-pill-completed-bg]="status === 'completed'"
      [class.text-pill-completed-text]="status === 'completed'"
      [class.bg-pill-progress-bg]="status === 'in-progress'"
      [class.text-pill-progress-text]="status === 'in-progress'"
      [class.bg-pill-pending-bg]="status === 'pending'"
      [class.text-pill-pending-text]="status === 'pending'"
    >
      <ng-content />
    </span>
  `,
})
export class StatusPillComponent {
  @Input() status: 'completed' | 'in-progress' | 'pending' = 'completed';
}