import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { Router } from '@angular/router';
import { Vehicle, VehicleCreateRequest, VehicleUpdateRequest } from '../../../core/models/vehicle.model';
import { VehicleService } from '../../../core/services/vehicle.service';

@Component({
  selector: 'app-vehicle-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 bg-black/40" animate.enter="fade-in-up" (click)="close()"></div>
      <div
        #panel
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="isEdit() ? 'Edit vehicle' : 'New vehicle'"
        class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        animate.enter="drawer-slide-in"
        animate.leave="drawer-slide-out"
        (keydown)="onPanelKeydown($event)"
        tabindex="-1"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 class="text-lg font-bold text-gray-900">{{ isEdit() ? 'Edit Vehicle' : 'New Vehicle' }}</h2>
          <button
            #closeBtn
            type="button"
            (click)="close()"
            aria-label="Close"
            class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg lucideIcon="x" [size]="18" />
          </button>
        </div>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <div>
            <label for="make" class="block text-sm font-medium text-gray-700">Make</label>
            <input
              id="make"
              formControlName="make"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label for="model" class="block text-sm font-medium text-gray-700">Model</label>
            <input
              id="model"
              formControlName="model"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label for="year" class="block text-sm font-medium text-gray-700">Year</label>
            <input
              id="year"
              type="number"
              formControlName="year"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label for="plateNumber" class="block text-sm font-medium text-gray-700">Plate number</label>
            <input
              id="plateNumber"
              formControlName="plateNumber"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100"
            />
            <p *ngIf="isEdit()" class="mt-1 text-xs text-gray-500">Plate number cannot be changed.</p>
          </div>

          <div>
            <label for="currentMileage" class="block text-sm font-medium text-gray-700">Current mileage</label>
            <input
              id="currentMileage"
              type="number"
              formControlName="currentMileage"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100"
            />
            <p *ngIf="isEdit()" class="mt-1 text-xs text-gray-500">
              Mileage is updated automatically from maintenance logs.
            </p>
          </div>

          <div>
            <label for="serviceIntervalMonths" class="block text-sm font-medium text-gray-700">
              Service interval (months)
            </label>
            <input
              id="serviceIntervalMonths"
              type="number"
              formControlName="serviceIntervalMonths"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p class="mt-1 text-xs text-gray-500">Optional. Used to estimate the next service due mileage.</p>
          </div>

          <p *ngIf="errorMessage()" class="text-sm text-red-600" role="alert">{{ errorMessage() }}</p>
        </form>

        <div class="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            (click)="close()"
            class="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="submitting() || form.invalid"
            (click)="onSubmit()"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    }
  `,
})
export class VehicleDrawerComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('panel') private readonly panel?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') private readonly closeBtn?: ElementRef<HTMLElement>;

  @Output() readonly saved = new EventEmitter<void>();

  readonly isOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  private editingVehicle: Vehicle | null = null;
  private returnFocusEl: HTMLElement | null = null;

  readonly form = this.fb.nonNullable.group({
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(1980), Validators.max(new Date().getFullYear() + 1)],
    ],
    plateNumber: ['', Validators.required],
    currentMileage: [0, [Validators.required, Validators.min(0)]],
    serviceIntervalMonths: [null as number | null],
    serviceIntervalMileage: [null as number | null],
  });

  constructor() {
    document.addEventListener('keydown', this.onGlobalKeydown);
  }

  ngAfterViewInit() {
    /* no-op; focus is managed on open */
  }

  isEdit() {
    return this.editingVehicle !== null;
  }

  open(vehicle: Vehicle | null) {
    this.editingVehicle = vehicle;
    this.returnFocusEl = (document.activeElement as HTMLElement) ?? null;
    this.errorMessage.set(null);
    this.submitting.set(false);
    this.resetForm(vehicle);
    this.isOpen.set(true);
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      const first = this.panel?.nativeElement;
      if (first) {
        first.focus();
      }
    });
  }

  close() {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.cdr.detectChanges();
    this.returnFocusEl?.focus();
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const values = this.form.getRawValue();

    if (this.editingVehicle) {
      const request: VehicleUpdateRequest = {
        make: values.make,
        model: values.model,
        year: values.year,
        serviceIntervalMonths: values.serviceIntervalMonths,
        serviceIntervalMileage: values.serviceIntervalMileage,
      };
      this.vehicleService.update(this.editingVehicle.id, request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.saved.emit();
          this.close();
        },
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
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
        this.close();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Create failed.');
      },
    });
  }

  onPanelKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private onGlobalKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  };

  private trapFocus(event: KeyboardEvent) {
    if (!this.panel) {
      return;
    }
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement;

    if (event.shiftKey && (active === first || !this.panel.nativeElement.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !this.panel.nativeElement.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.panel) {
      return [];
    }
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.panel.nativeElement.querySelectorAll<HTMLElement>(selector));
  }

  private resetForm(vehicle: Vehicle | null) {
    if (vehicle) {
      this.form.patchValue({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        plateNumber: vehicle.plateNumber,
        currentMileage: vehicle.currentMileage,
        serviceIntervalMonths: vehicle.serviceIntervalMonths,
        serviceIntervalMileage: vehicle.serviceIntervalMileage,
      });
      this.form.controls.plateNumber.disable();
      this.form.controls.currentMileage.disable();
    } else {
      this.form.reset();
      this.form.controls.plateNumber.enable();
      this.form.controls.currentMileage.enable();
      this.form.patchValue({ year: new Date().getFullYear(), currentMileage: 0 });
    }
  }
}
