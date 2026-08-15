import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideDynamicIcon } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-xl"
        animate.enter="fade-in-up"
      >
        <h1 class="text-2xl font-bold text-gray-900">FleetTrack</h1>
        <p class="text-sm text-gray-500">Sign in to your account</p>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <div class="relative">
            <svg
              lucideIcon="mail"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <svg
              lucideIcon="lock"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <p *ngIf="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>

        <button
          type="submit"
          [disabled]="submitting || form.invalid"
          class="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white transition-transform duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
        >
          Sign in
        </button>
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
