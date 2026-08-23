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
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideDynamicIcon,
    VehicleDrawerComponent,
    MaintenanceLogDrawerComponent,
    ButtonComponent,
  ],
  template: `
    <div class="p-4">
      <a routerLink="/vehicles" class="text-sm text-brand-mid hover:underline">← Back to vehicles</a>

      <p *ngIf="loading()" class="mt-3 text-sm text-muted">Loading…</p>
      <p *ngIf="errorMessage()" class="mt-3 text-sm text-red-600">{{ errorMessage() }}</p>

      <ng-container *ngIf="vehicle() as vehicle">
        <div class="mt-3 flex items-center justify-between">
          <h1 class="text-page-title font-light text-title">
            {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
          </h1>
          <div class="flex items-center gap-2">
            <app-button variant="outlined" (click)="openEdit(vehicle)">
              <svg lucideIcon="pencil" [size]="16" />
              Edit
            </app-button>
            <app-button (click)="openAddLog()">
              <svg lucideIcon="plus" [size]="16" />
              Add Log
            </app-button>
            @if (vehicle.isActive) {
              <button
                type="button"
                (click)="archive()"
                aria-label="Archive vehicle"
                class="flex items-center gap-2 rounded-full border-[1.5px] border-pill-progress-text px-4 py-2 text-sm font-normal text-pill-progress-text transition-transform duration-150 ease-out hover:bg-pill-progress-bg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pill-progress-text"
              >
                <svg lucideIcon="archive" [size]="16" />
                Archive
              </button>
            } @else {
              <button
                type="button"
                (click)="unarchive()"
                aria-label="Unarchive vehicle"
                class="flex items-center gap-2 rounded-full border-[1.5px] border-pill-progress-text px-4 py-2 text-sm font-normal text-pill-progress-text transition-transform duration-150 ease-out hover:bg-pill-progress-bg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pill-progress-text"
              >
                <svg lucideIcon="archive-restore" [size]="16" />
                Unarchive
              </button>
            }
            <button
              type="button"
              (click)="removeVehicle()"
              aria-label="Delete vehicle permanently"
              class="flex items-center gap-2 rounded-full bg-pill-pending-text px-4 py-2 text-sm font-normal text-white transition-transform duration-150 ease-out hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pill-pending-text"
            >
              <svg lucideIcon="trash-2" [size]="16" />
              Delete
            </button>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-2">
          <span
            *ngIf="vehicle.isServiceDue"
            class="inline-flex items-center gap-1 rounded-full bg-pill-progress-bg px-2.5 py-0.5 text-xs font-normal text-pill-progress-text"
          >
            <svg lucideIcon="triangle-alert" [size]="12" />
            Due for service
          </span>
          <span
            *ngIf="!vehicle.isActive"
            class="inline-flex items-center rounded-full bg-input px-2.5 py-0.5 text-xs font-normal text-muted"
          >
            Archived
          </span>
          <span
            *ngIf="!vehicle.isServiceDue && vehicle.isActive"
            class="inline-flex items-center rounded-full bg-pill-completed-bg px-2.5 py-0.5 text-xs font-normal text-pill-completed-text"
          >
            Active
          </span>
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-4 rounded-card border border-hairline bg-card p-card-padding text-sm md:grid-cols-3">
          <div>
            <dt class="text-meta font-normal uppercase text-muted">Plate number</dt>
            <dd class="mt-1 font-medium text-body">{{ vehicle.plateNumber }}</dd>
          </div>
          <div>
            <dt class="text-meta font-normal uppercase text-muted">Current mileage</dt>
            <dd class="mt-1 font-medium text-body">{{ vehicle.currentMileage | number }} km</dd>
          </div>
          <div>
            <dt class="text-meta font-normal uppercase text-muted">Service interval</dt>
            <dd class="mt-1 font-medium text-body">
              {{ vehicle.serviceIntervalMonths ? vehicle.serviceIntervalMonths + ' months' : '—' }}
              /
              {{ vehicle.serviceIntervalMileage ? vehicle.serviceIntervalMileage + ' km' : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-meta font-normal uppercase text-muted">Next service due date</dt>
            <dd class="mt-1 font-medium text-body">
              {{ vehicle.nextServiceDueDate ? (vehicle.nextServiceDueDate | date) : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-meta font-normal uppercase text-muted">Next service due mileage</dt>
            <dd class="mt-1 font-medium text-body">
              {{ vehicle.nextServiceDueMileage ? (vehicle.nextServiceDueMileage | number) + ' km' : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-meta font-normal uppercase text-muted">Added</dt>
            <dd class="mt-1 font-medium text-body">{{ vehicle.id }}</dd>
          </div>
        </dl>

        <h2 class="mt-4 text-card-header font-semibold text-title">Maintenance history</h2>

        <div
          *ngIf="logs().length > 0"
          class="mt-3 overflow-x-auto rounded-card border border-hairline bg-card"
        >
          <table class="min-w-full divide-y divide-hairline text-sm">
            <thead class="bg-input text-left text-meta font-normal uppercase text-muted">
              <tr>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Description</th>
                <th class="px-4 py-3">Cost</th>
                <th class="px-4 py-3">Mileage</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr
                *ngFor="let log of logs(); let i = index"
                class="transition-colors hover:bg-input"
                animate.enter="fade-in-up"
                [style.animation-delay.ms]="staggerDelay(i)"
              >
                <td class="px-4 py-3 font-medium text-body">{{ log.serviceDate | date }}</td>
                <td class="px-4 py-3 font-medium text-body">{{ log.description }}</td>
                <td class="px-4 py-3 font-medium text-body">{{ log.cost | currency:'INR':'symbol-narrow' }}</td>
                <td class="px-4 py-3 font-medium text-body">{{ log.mileageAtService | number }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      [attr.aria-label]="'Edit log: ' + log.description"
                      (click)="openEditLog(log)"
                      class="rounded-md p-2 text-muted transition-transform duration-150 ease-out hover:scale-105 hover:bg-input hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid active:scale-95"
                    >
                      <svg lucideIcon="pencil" [size]="18" />
                    </button>
                    <button
                      type="button"
                      [attr.aria-label]="'Delete log: ' + log.description"
                      (click)="deleteLog(log)"
                      class="rounded-md p-2 text-muted transition-transform duration-150 ease-out hover:scale-105 hover:bg-pill-pending-bg hover:text-pill-pending-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pill-pending-text active:scale-95"
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
          class="mt-3 flex flex-col items-center justify-center rounded-card border border-dashed border-hairline bg-card px-6 py-16 text-center"
          animate.enter="fade-in-up"
        >
          <svg
            class="h-24 w-24 text-muted"
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
          <h3 class="mt-4 text-lg font-medium text-title">No maintenance logs yet</h3>
          <p class="mt-1 text-sm text-muted">Add the first maintenance log to track this vehicle's service history.</p>
          <app-button class="mt-5" (click)="openAddLog()">
            <svg lucideIcon="plus" [size]="18" />
            Add Maintenance Log
          </app-button>
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

  unarchive() {
    const vehicle = this.vehicle();
    if (!vehicle) {
      return;
    }

    this.vehicleService.unarchive(vehicle.id).subscribe({
      next: () => this.reloadVehicle(),
      error: () => {
        this.errorMessage.set('Failed to unarchive vehicle.');
      },
    });
  }

  removeVehicle() {
    const vehicle = this.vehicle();
    if (!vehicle) {
      return;
    }

    const ok = confirm(
      `Permanently delete ${vehicle.year} ${vehicle.make} ${vehicle.model} and all of its maintenance logs? This cannot be undone.`
    );
    if (!ok) {
      return;
    }

    this.vehicleService.delete(vehicle.id).subscribe({
      next: () => this.router.navigate(['/vehicles']),
      error: () => {
        this.errorMessage.set('Failed to delete vehicle.');
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
