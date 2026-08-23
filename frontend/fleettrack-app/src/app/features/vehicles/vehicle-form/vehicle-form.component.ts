import { Component, inject, ChangeDetectorRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleCreateRequest, VehicleUpdateRequest } from '../../../core/models/vehicle.model';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  template: `
    <div class="mx-auto max-w-xl p-4">
      <h1 class="text-page-title font-light text-title">{{ isEdit ? 'Edit Vehicle' : 'New Vehicle' }}</h1>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="mt-3 space-y-4 rounded-card border border-hairline bg-card p-card-padding"
      >
        <div>
          <label for="make" class="block text-meta font-normal text-muted">Make</label>
          <input
            id="make"
            formControlName="make"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
          />
        </div>

        <div>
          <label for="model" class="block text-meta font-normal text-muted">Model</label>
          <input
            id="model"
            formControlName="model"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
          />
        </div>

        <div>
          <label for="year" class="block text-meta font-normal text-muted">Year</label>
          <input
            id="year"
            type="number"
            formControlName="year"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
          />
        </div>

        <div>
          <label for="plateNumber" class="block text-meta font-normal text-muted">Plate number</label>
          <input
            id="plateNumber"
            formControlName="plateNumber"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20 disabled:bg-input"
          />
          <p *ngIf="isEdit" class="mt-1 text-xs text-muted">Plate number cannot be changed.</p>
        </div>

        <div>
          <label for="currentMileage" class="block text-meta font-normal text-muted">Current mileage</label>
          <input
            id="currentMileage"
            type="number"
            formControlName="currentMileage"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20 disabled:bg-input"
          />
          <p *ngIf="isEdit" class="mt-1 text-xs text-muted">Mileage is updated automatically from maintenance logs.</p>
        </div>

        <div>
          <label for="serviceIntervalMonths" class="block text-meta font-normal text-muted">
            Service interval (months)
          </label>
          <input
            id="serviceIntervalMonths"
            type="number"
            formControlName="serviceIntervalMonths"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
          />
          <p class="mt-1 text-xs text-muted">Optional. Used to estimate the next service due date.</p>
        </div>

        <div>
          <label for="serviceIntervalMileage" class="block text-meta font-normal text-muted">
            Service interval (mileage)
          </label>
          <input
            id="serviceIntervalMileage"
            type="number"
            formControlName="serviceIntervalMileage"
            class="mt-1 block w-full rounded-md border border-hairline px-3 py-2 text-body focus:border-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-mid/20"
          />
          <p class="mt-1 text-xs text-muted">Optional. Used to estimate the next service due mileage.</p>
        </div>

        <p *ngIf="errorMessage()" class="text-sm text-red-600">{{ errorMessage() }}</p>

        <div class="flex items-center gap-3 pt-2">
          <app-button type="submit" [disabled]="submitting() || form.invalid">
            Save
          </app-button>
          <a
            [routerLink]="isEdit ? ['/vehicles', vehicleId] : ['/vehicles']"
            class="text-sm text-muted hover:underline"
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