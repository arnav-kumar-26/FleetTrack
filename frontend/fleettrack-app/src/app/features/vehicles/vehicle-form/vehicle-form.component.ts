import { Component, inject, ChangeDetectorRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleCreateRequest, VehicleUpdateRequest } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-xl p-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Edit Vehicle' : 'New Vehicle' }}</h1>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label for="make" class="block text-sm font-medium text-gray-700">Make</label>
          <input
            id="make"
            formControlName="make"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="model" class="block text-sm font-medium text-gray-700">Model</label>
          <input
            id="model"
            formControlName="model"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="year" class="block text-sm font-medium text-gray-700">Year</label>
          <input
            id="year"
            type="number"
            formControlName="year"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="plateNumber" class="block text-sm font-medium text-gray-700">Plate number</label>
          <input
            id="plateNumber"
            formControlName="plateNumber"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p *ngIf="isEdit" class="mt-1 text-xs text-gray-500">Plate number cannot be changed.</p>
        </div>

        <div>
          <label for="currentMileage" class="block text-sm font-medium text-gray-700">Current mileage</label>
          <input
            id="currentMileage"
            type="number"
            formControlName="currentMileage"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p *ngIf="isEdit" class="mt-1 text-xs text-gray-500">Mileage is updated automatically from maintenance logs.</p>
        </div>

        <div>
          <label for="serviceIntervalMonths" class="block text-sm font-medium text-gray-700">
            Service interval (months)
          </label>
          <input
            id="serviceIntervalMonths"
            type="number"
            formControlName="serviceIntervalMonths"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">Optional. Used to estimate the next service due date.</p>
        </div>

        <div>
          <label for="serviceIntervalMileage" class="block text-sm font-medium text-gray-700">
            Service interval (mileage)
          </label>
          <input
            id="serviceIntervalMileage"
            type="number"
            formControlName="serviceIntervalMileage"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">Optional. Used to estimate the next service due mileage.</p>
        </div>

        <p *ngIf="errorMessage()" class="text-sm text-red-600">{{ errorMessage() }}</p>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="submitting() || form.invalid"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save
          </button>
          <a
            [routerLink]="isEdit ? ['/vehicles', vehicleId] : ['/vehicles']"
            class="text-sm text-gray-500 hover:underline"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  `,
})
export class VehicleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isEdit = this.route.snapshot.paramMap.has('id');
  readonly vehicleId = Number(this.route.snapshot.paramMap.get('id'));

  readonly form = this.fb.nonNullable.group({
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1980), Validators.max(new Date().getFullYear() + 1)]],
    plateNumber: ['', Validators.required],
    currentMileage: [0, [Validators.required, Validators.min(0)]],
    serviceIntervalMonths: [null as number | null],
    serviceIntervalMileage: [null as number | null],
  });

  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  ngOnInit() {
    if (this.isEdit) {
      this.form.controls.plateNumber.disable();
      this.form.controls.currentMileage.disable();
    }

    if (this.isEdit && this.vehicleId) {
      this.vehicleService.getById(this.vehicleId).subscribe({
        next: (vehicle) => {
          this.form.patchValue({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            plateNumber: vehicle.plateNumber,
            currentMileage: vehicle.currentMileage,
            serviceIntervalMonths: vehicle.serviceIntervalMonths,
            serviceIntervalMileage: vehicle.serviceIntervalMileage,
          });
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage.set('Failed to load vehicle.');
        },
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const values = this.form.getRawValue();

    if (this.isEdit && this.vehicleId) {
      const request: VehicleUpdateRequest = {
        make: values.make,
        model: values.model,
        year: values.year,
        serviceIntervalMonths: values.serviceIntervalMonths,
        serviceIntervalMileage: values.serviceIntervalMileage,
      };

      this.vehicleService.update(this.vehicleId, request).subscribe({
        next: () => this.router.navigate(['/vehicles', this.vehicleId]),
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set('Update failed.');
        },
      });
      return;
    }

    const request: VehicleCreateRequest = {
      make: values.make,
      model: values.model,
      year: values.year,
      plateNumber: values.plateNumber,
      currentMileage: values.currentMileage,
      serviceIntervalMonths: values.serviceIntervalMonths,
      serviceIntervalMileage: values.serviceIntervalMileage,
    };

    this.vehicleService.create(request).subscribe({
      next: (vehicle) => this.router.navigate(['/vehicles', vehicle.id]),
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Create failed.');
      },
    });
  }
}