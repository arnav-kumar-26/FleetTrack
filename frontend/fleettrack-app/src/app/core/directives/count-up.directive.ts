import { Directive, ElementRef, inject, Input } from '@angular/core';

@Directive({
  selector: '[countUp]',
  standalone: true,
})
export class CountUpDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  @Input({ required: true }) set countUp(target: number) {
    if (this.mediaQuery.matches) {
      this.el.nativeElement.textContent = this.format(target);
      return;
    }
    const duration = 650;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.el.nativeElement.textContent = this.format(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  @Input() countUpCurrency?: string;

  private format(value: number): string {
    if (this.countUpCurrency) {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: this.countUpCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  }
}
