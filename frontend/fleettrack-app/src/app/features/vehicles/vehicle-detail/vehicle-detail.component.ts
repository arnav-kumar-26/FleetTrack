import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { VehicleService } from '../../../core/services/vehicle.service';
import { MaintenanceLogService } from '../../../core/services/maintenance-log.service';
import { Vehicle } from '../../../core/models/vehicle.model';
import { MaintenanceLog } from '../../../core/models/maintenance-log.model';
import { staggerDelay } from '../../../core/utils/stagger.util';
import { VehicleDrawerComponent } from '../vehicle-drawer/vehicle-drawer.component';
import { MaintenanceLogDrawerComponent } from '../../maintenance-logs/maintenance-log-drawer/maintenance-log-drawer.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideDynamicIcon,
    VehicleDrawerComponent,
    MaintenanceLogDrawerComponent,
  ],
  template: `
    <div class="p-6">
      <a routerLink="/vehicles" class="text-sm text-blue-600 hover:underline">← Back to vehicles</a>

      <p *ngIf="loading()" class="mt-4 text-sm text-gray-500">Loading…</p>
      <p *ngIf="errorMessage()" class="mt-4 text-sm text-red-600">{{ errorMessage() }}</p>

      <ng-container *ngIf="vehicle() as vehicle">
        <div class="mt-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
          </h1>
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="openEdit(vehicle)"
              class="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-transform duration-150 ease-out hover:bg-gray-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <svg lucideIcon="pencil" [size]="16" />
              Edit
            </button>
            <button
              type="button"
              (click)="openAddLog()"
              class="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <svg lucideIcon="plus" [size]="16" />
              Add Log
            </button>
            <button
              type="button"
              (click)="archive()"
              class="flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-transform duration-150 ease-out hover:bg-red-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <svg lucideIcon="trash-2" [size]="16" />
              Archive
            </button>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-2">
          <span
            *ngIf="vehicle.isServiceDue"
            class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
          >
            <svg lucideIcon="triangle-alert" [size]="12" class="text-amber-600" />
            Due for service
          </span>
          <span
            *ngIf="!vehicle.isActive"
            class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
          >
            Archived
          </span>
          <span
            *ngIf="!vehicle.isServiceDue && vehicle.isActive"
            class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
          >
            Active
          </span>
        </div>

        <dl class="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-6 text-sm md:grid-cols-3">
          <div>
            <dt class="text-xs font-medium uppercase text-gray-500">Plate number</dt>
            <dd class="mt-1 font-semibold text-gray-900">{{ vehicle.plateNumber }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-gray-500">Current mileage</dt>
            <dd class="mt-1 font-semibold text-gray-900">{{ vehicle.currentMileage | number }} km</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-gray-500">Service interval</dt>
            <dd class="mt-1 text-gray-900">
              {{ vehicle.serviceIntervalMonths ? vehicle.serviceIntervalMonths + ' months' : '—' }}
              /
              {{ vehicle.serviceIntervalMileage ? vehicle.serviceIntervalMileage + ' km' : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-gray-500">Next service due date</dt>
            <dd class="mt-1 font-semibold text-gray-900">
              {{ vehicle.nextServiceDueDate ? (vehicle.nextServiceDueDate | date) : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-gray-500">Next service due mileage</dt>
            <dd class="mt-1 font-semibold text-gray-900">
              {{ vehicle.nextServiceDueMileage ? (vehicle.nextServiceDueMileage | number) + ' km' : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-gray-500">Added</dt>
            <dd class="mt-1 text-gray-900">{{ vehicle.id }}</dd>
          </div>
        </dl>

        <h2 class="mt-8 text-lg font-bold text-gray-900">Maintenance history</h2>

        <div
          *ngIf="logs().length > 0"
          class="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white"
        >
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Description</th>
                <th class="px-4 py-3">Cost</th>
                <th class="px-4 py-3">Mileage</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                *ngFor="let log of logs(); let i = index"
                class="transition-colors hover:bg-slate-50"
                animate.enter="fade-in-up"
                [style.animation-delay.ms]="staggerDelay(i)"
              >
                <td class="px-4 py-3 text-gray-600">{{ log.serviceDate | date }}</td>
                <td class="px-4 py-3 text-gray-900">{{ log.description }}</td>
                <td class="px-4 py-3 text-gray-600">{{ log.cost | currency }}</td>
                <td class="px-4 py-3 text-gray-600">{{ log.mileageAtService | number }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      [attr.aria-label]="'Edit log: ' + log.description"
                      (click)="openEditLog(log)"
                      class="rounded-md p-2 text-slate-500 transition-transform duration-150 ease-out hover:scale-105 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
                    >
                      <svg lucideIcon="pencil" [size]="18" />
                    </button>
                    <button
                      type="button"
                      [attr.aria-label]="'Delete log: ' + log.description"
                      (click)="deleteLog(log)"
                      class="rounded-md p-2 text-slate-500 transition-transform duration-150 ease-out hover:scale-105 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:scale-95"
                    >
                      <svg lucideIcon="trash-2" [size]="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          *ngIf="logs().length === 0"
          class="mt-3 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
          animate.enter="fade-in-up"
        >
          <svg
            class="h-24 w-24 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
          </svg>
          <h3 class="mt-4 text-lg font-semibold text-gray-900">No maintenance logs yet</h3>
          <p class="mt-1 text-sm text-gray-500">Add the first maintenance log to track this vehicle's service history.</p>
          <button
            type="button"
            (click)="openAddLog()"
            class="mt-5 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg lucideIcon="plus" [size]="18" />
            Add Maintenance Log
          </button>
        </div>
      </ng-container>
    </div>

    <app-vehicle-drawer (saved)="reloadVehicle()" />
    <app-maintenance-log-drawer (saved)="reloadAll()" />
  `,
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceLogService = inject(MaintenanceLogService);

  @ViewChild(VehicleDrawerComponent) private readonly drawer?: VehicleDrawerComponent;
  @ViewChild(MaintenanceLogDrawerComponent) private readonly logDrawer?: MaintenanceLogDrawerComponent;

  readonly vehicle = signal<Vehicle | null>(null);
  readonly logs = signal<MaintenanceLog[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly staggerDelay = staggerDelay;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage.set('Invalid vehicle id.');
      this.loading.set(false);
      return;
    }

    this.vehicleService.getById(id).subscribe({
      next: (vehicle) => {
        this.vehicle.set(vehicle);
        this.loading.set(false);
        this.loadLogs(id);
      },
      error: () => {
        this.errorMessage.set('Vehicle not found.');
        this.loading.set(false);
      },
    });
  }

  reloadVehicle() {
    const id = this.vehicle()?.id;
    if (!id) {
      return;
    }
    this.vehicleService.getById(id).subscribe({
      next: (vehicle) => this.vehicle.set(vehicle),
      error: () => {
        /* keep existing data */
      },
    });
  }

  reloadAll() {
    this.reloadVehicle();
    this.reloadLogs();
  }

  openAddLog() {
    const id = this.vehicle()?.id;
    if (id) {
      this.logDrawer?.open(id);
    }
  }

  openEditLog(log: MaintenanceLog) {
    const id = this.vehicle()?.id;
    if (id) {
      this.logDrawer?.open(id, log);
    }
  }

  deleteLog(log: MaintenanceLog) {
    const ok = confirm(`Delete maintenance log: ${log.description}?`);
    if (!ok) {
      return;
    }
    this.maintenanceLogService.delete(log.id).subscribe({
      next: () => this.reloadAll(),
      error: () => {
        this.errorMessage.set('Failed to delete maintenance log.');
      },
    });
  }

  openEdit(vehicle: Vehicle) {
    this.drawer?.open(vehicle);
  }

  archive() {
    const vehicle = this.vehicle();
    if (!vehicle) {
      return;
    }

    this.vehicleService.archive(vehicle.id).subscribe({
      next: () => this.router.navigate(['/vehicles']),
      error: () => {
        this.errorMessage.set('Failed to archive vehicle.');
      },
    });
  }

  reloadLogs() {
    const id = this.vehicle()?.id;
    if (id) {
      this.loadLogs(id);
    }
  }

  private loadLogs(id: number) {
    this.vehicleService.getMaintenanceLogsForVehicle(id).subscribe({
      next: (logs) => {
        this.logs.set(logs);
      },
      error: () => {
        /* log history is non-critical */
      },
    });
  }
}
