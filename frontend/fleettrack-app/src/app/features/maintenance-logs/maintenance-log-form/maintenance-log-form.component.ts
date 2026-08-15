import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MaintenanceLogService } from '../../../core/services/maintenance-log.service';

@Component({
  selector: 'app-maintenance-log-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-xl p-6">
      <a [routerLink]="['/vehicles', vehicleId]" class="text-sm text-blue-600 hover:underline">
        ← Back to vehicle
      </a>

      <h1 class="mt-4 text-2xl font-bold text-gray-900">Add Maintenance Log</h1>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label for="serviceDate" class="block text-sm font-medium text-gray-700">Service date</label>
          <input
            id="serviceDate"
            type="date"
            formControlName="serviceDate"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows="3"
            formControlName="description"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label for="cost" class="block text-sm font-medium text-gray-700">Cost</label>
          <input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            formControlName="cost"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="mileageAtService" class="block text-sm font-medium text-gray-700">
            Mileage at service (km)
          </label>
          <input
            id="mileageAtService"
            type="number"
            min="0"
            formControlName="mileageAtService"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">
            The vehicle's current mileage is updated automatically when this is higher than the current value.
          </p>
        </div>

        <p *ngIf="errorMessage()" class="text-sm text-red-600">{{ errorMessage() }}</p>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="submitting() || form.invalid"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save log
          </button>
          <a [routerLink]="['/vehicles', vehicleId]" class="text-sm text-gray-500 hover:underline">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class MaintenanceLogFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly maintenanceLogService = inject(MaintenanceLogService);

  readonly vehicleId = Number(this.route.snapshot.paramMap.get('id'));

  readonly form = this.fb.nonNullable.group({
    serviceDate: [this.today(), Validators.required],
    description: ['', Validators.required],
    cost: [0, [Validators.required, Validators.min(0)]],
    mileageAtService: [0, [Validators.required, Validators.min(0)]],
  });

  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  ngOnInit() {
    if (!this.vehicleId) {
      this.errorMessage.set('Invalid vehicle id.');
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.vehicleId) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const values = this.form.getRawValue();
    this.maintenanceLogService
      .create({
        vehicleId: this.vehicleId,
        serviceDate: values.serviceDate,
        description: values.description,
        cost: values.cost,
        mileageAtService: values.mileageAtService,
      })
      .subscribe({
        next: () => this.router.navigate(['/vehicles', this.vehicleId]),
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set('Failed to save maintenance log.');
        },
      });
  }

  private today(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }
}