import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideDynamicIcon } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon, ButtonComponent],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-page">
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="w-full max-w-sm space-y-4 rounded-shell bg-shell p-8 shadow-shell"
        animate.enter="fade-in-up"
      >
        <h1 class="text-page-title font-bold text-title">FleetTrack</h1>
        <p class="text-sm text-muted">Sign in to your account</p>

        <div>
          <label for="email" class="block text-meta font-normal text-muted">Email</label>
          <div class="relative">
            <svg
              lucideIcon="mail"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="mt-1 block w-full rounded-md border border-hairline py-2 pl-9 pr-3 text-body transition-colors duration-200 focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-meta font-normal text-muted">Password</label>
          <div class="relative">
            <svg
              lucideIcon="lock"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="mt-1 block w-full rounded-md border border-hairline py-2 pl-9 pr-3 text-body transition-colors duration-200 focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
            />
          </div>
        </div>

        <p *ngIf="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>

        <app-button type="submit" class="w-full" [disabled]="submitting || form.invalid">
          Sign in
        </app-button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  errorMessage: string | null = null;
  submitting = false;

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage =
          error.status === 401 ? 'Invalid email or password.' : 'An unexpected error occurred.';
      },
    });
  }
}
