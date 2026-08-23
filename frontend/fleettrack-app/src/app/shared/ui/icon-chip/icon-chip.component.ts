import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-icon-chip"
      [class.bg-chip-blue]="color === 'blue'"
      [class.bg-chip-teal]="color === 'teal'"
      [class.bg-chip-violet]="color === 'violet'"
      [class.bg-chip-amber]="color === 'amber'"
    >
      <ng-content />
    </span>
  `,
})
export class IconChipComponent {
  @Input() color: 'blue' | 'teal' | 'violet' | 'amber' = 'blue';
}