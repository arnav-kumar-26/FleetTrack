import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
  template: `
    <button
      [type]="type"
      [attr.disabled]="disabled ? true : null"
      class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-normal transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid disabled:opacity-50"
      [class.bg-brand-mid]="variant === 'filled'"
      [class.text-on-dark]="variant === 'filled'"
      [class.rounded-button]="variant === 'filled'"
      [class.hover:brightness-95]="variant === 'filled'"
      [class.bg-transparent]="variant === 'outlined'"
      [class.border-[1.5px]]="variant === 'outlined'"
      [class.border-body]="variant === 'outlined'"
      [class.text-body]="variant === 'outlined'"
      [class.rounded-full]="variant === 'outlined'"
      [class.hover:bg-input]="variant === 'outlined'"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'filled' | 'outlined' = 'filled';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
}