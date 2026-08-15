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
      this.el.nativeElement.textContent = target.toLocaleString();
      return;
    }
    const duration = 650;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.el.nativeElement.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
