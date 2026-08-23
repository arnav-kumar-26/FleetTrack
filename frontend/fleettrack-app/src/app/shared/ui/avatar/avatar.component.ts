import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
      @if (src) {
        <img [src]="src" [alt]="name || ''" class="h-full w-full object-cover" />
      } @else {
        <span class="flex h-full w-full items-center justify-center bg-input text-body text-sm font-normal">
          {{ initials }}
        </span>
      }
    </span>
  `,
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name = '';

  get initials(): string {
    const trimmed = this.name.trim();
    if (!trimmed) {
      return 'U';
    }
    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }
}