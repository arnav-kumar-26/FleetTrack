import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';
import { MaintenanceLog } from '../../../core/models/maintenance-log.model';
import { MaintenanceLogService } from '../../../core/services/maintenance-log.service';

@Component({
  selector: 'app-maintenance-log-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 bg-black/40" animate.enter="fade-in-up" (click)="close()"></div>
      <div
        #panel
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="isEdit() ? 'Edit maintenance log' : 'Add maintenance log'"
        class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        animate.enter="drawer-slide-in"
        animate.leave="drawer-slide-out"
        (keydown)="onPanelKeydown($event)"
        tabindex="-1"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 class="text-lg font-bold text-gray-900">
            {{ isEdit() ? 'Edit Maintenance Log' : 'Add Maintenance Log' }}
          </h2>
          <button
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
            <label for="serviceDate" class="block text-sm font-medium text-gray-700">Service date</label>
            <input
              id="serviceDate"
              type="date"
              formControlName="serviceDate"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows="3"
              formControlName="description"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p class="mt-1 text-xs text-gray-500">
              The vehicle's current mileage is updated automatically when this is higher than the current value.
            </p>
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
            {{ isEdit() ? 'Save changes' : 'Save log' }}
          </button>
        </div>
      </div>
    }
  `,
})
export class MaintenanceLogDrawerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly maintenanceLogService = inject(MaintenanceLogService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('panel') private readonly panel?: ElementRef<HTMLElement>;

  @Output() readonly saved = new EventEmitter<void>();

  readonly isOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  private vehicleId: number | null = null;
  private editingLog: MaintenanceLog | null = null;
  private returnFocusEl: HTMLElement | null = null;

  readonly form = this.fb.nonNullable.group({
    serviceDate: ['', Validators.required],
    description: ['', Validators.required],
    cost: [0, [Validators.required, Validators.min(0)]],
    mileageAtService: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    document.addEventListener('keydown', this.onGlobalKeydown);
  }

  isEdit() {
    return this.editingLog !== null;
  }

  open(vehicleId: number, log?: MaintenanceLog) {
    this.vehicleId = vehicleId;
    this.editingLog = log ?? null;
    this.returnFocusEl = (document.activeElement as HTMLElement) ?? null;
    this.errorMessage.set(null);
    this.submitting.set(false);
    this.resetForm(log);
    this.isOpen.set(true);
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      this.panel?.nativeElement?.focus();
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
    if (this.form.invalid || !this.vehicleId) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const values = this.form.getRawValue();

    if (this.editingLog) {
      this.maintenanceLogService
        .update(this.editingLog.id, {
          serviceDate: values.serviceDate,
          description: values.description,
          cost: values.cost,
          mileageAtService: values.mileageAtService,
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.saved.emit();
            this.close();
          },
          error: () => {
            this.submitting.set(false);
            this.errorMessage.set('Failed to update maintenance log.');
          },
        });
      return;
    }

    this.maintenanceLogService
      .create({
        vehicleId: this.vehicleId,
        serviceDate: values.serviceDate,
        description: values.description,
        cost: values.cost,
        mileageAtService: values.mileageAtService,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.saved.emit();
          this.close();
        },
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set('Failed to save maintenance log.');
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

  private resetForm(log?: MaintenanceLog) {
    if (log) {
      this.form.setValue({
        serviceDate: log.serviceDate,
        description: log.description,
        cost: log.cost,
        mileageAtService: log.mileageAtService,
      });
    } else {
      this.form.reset();
      this.form.patchValue({ serviceDate: this.today() });
    }
  }

  private today(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }
}
