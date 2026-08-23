import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../core/models/vehicle.model';
import { staggerDelay } from '../../../core/utils/stagger.util';
import { VehicleDrawerComponent } from '../vehicle-drawer/vehicle-drawer.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideDynamicIcon, VehicleDrawerComponent, ButtonComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-page-title font-light text-title">Vehicles</h1>
        <app-button (click)="openNew()">
          <svg lucideIcon="plus" [size]="18" />
          New Vehicle
        </app-button>
      </div>

      <p *ngIf="loading()" class="mt-3 text-sm text-muted">Loading…</p>
      <p *ngIf="errorMessage()" class="mt-3 text-sm text-red-600">{{ errorMessage() }}</p>

      <ng-container *ngIf="vehicles() as vehicles">
        <div
          *ngIf="vehicles.length > 0"
          class="mt-3 overflow-x-auto rounded-card border border-hairline bg-card"
        >
          <table class="min-w-full divide-y divide-hairline text-sm">
            <thead class="bg-input text-left text-xs font-normal uppercase text-muted">
              <tr>
                <th class="px-4 py-3">Vehicle</th>
                <th class="px-4 py-3">Year</th>
                <th class="px-4 py-3">Plate</th>
                <th class="px-4 py-3">Mileage</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
<tbody class="divide-y divide-hairline">
              <tr
                *ngFor="let vehicle of vehicles; let i = index"
                class="transition-colors hover:bg-input"
                animate.enter="fade-in-up"
                [style.animation-delay.ms]="staggerDelay(i)"
              >
                <td class="px-4 py-3">
                  <a
                    [routerLink]="['/vehicles', vehicle.id]"
                    class="font-semibold text-title hover:underline"
                  >
                    {{ vehicle.make }} {{ vehicle.model }}
                  </a>
                </td>
                <td class="px-4 py-3 font-medium text-body">{{ vehicle.year }}</td>
                <td class="px-4 py-3 font-medium text-body">{{ vehicle.plateNumber }}</td>
                <td class="px-4 py-3 font-medium text-body">{{ vehicle.currentMileage | number }}</td>
                <td class="px-4 py-3">
                  <span
                    *ngIf="vehicle.isServiceDue"
                    class="inline-flex items-center gap-1 rounded-full bg-pill-progress-bg px-2.5 py-0.5 text-xs font-normal text-pill-progress-text"
                  >
                    <svg lucideIcon="triangle-alert" [size]="12" />
                    Service Due
                  </span>
                  <span
                    *ngIf="!vehicle.isServiceDue && !vehicle.isActive"
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
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      [routerLink]="['/vehicles', vehicle.id]"
                      [attr.aria-label]="'View ' + vehicle.make + ' ' + vehicle.model"
                      class="rounded-md p-2 text-muted transition-transform duration-150 ease-out hover:scale-105 hover:bg-input hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid active:scale-95"
                    >
                      <svg lucideIcon="eye" [size]="18" />
                    </a>
                    <button
                      type="button"
                      [attr.aria-label]="'Edit ' + vehicle.make + ' ' + vehicle.model"
                      (click)="openEdit(vehicle, $event)"
                      class="rounded-md p-2 text-muted transition-transform duration-150 ease-out hover:scale-105 hover:bg-input hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid active:scale-95"
                    >
                      <svg lucideIcon="pencil" [size]="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          *ngIf="vehicles.length === 0"
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
            <path d="M5 17h-1a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h.4l1.1-2.8A3 3 0 0 1 9.3 7h5.4a3 3 0 0 1 2.8 2.2l1.1 2.8H19a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-1" />
            <path d="M5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
            <path d="M19 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
            <path d="M9 3h6" />
            <path d="M12 3v4" />
          </svg>
          <h2 class="mt-4 text-lg font-medium text-title">No vehicles yet</h2>
          <p class="mt-1 text-sm text-muted">Add your first vehicle to start tracking maintenance.</p>
          <app-button class="mt-5" (click)="openNew()">
            <svg lucideIcon="plus" [size]="18" />
            Add Vehicle
          </app-button>
        </div>
      </ng-container>
    </div>

    <app-vehicle-drawer (saved)="reload()" />
  `,
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);

  @ViewChild(VehicleDrawerComponent) private readonly drawer?: VehicleDrawerComponent;

  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly staggerDelay = staggerDelay;

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.vehicleService.getAll().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load vehicles.');
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.drawer?.open(null);
  }

  openEdit(vehicle: Vehicle, event: Event) {
    this.drawer?.open(vehicle);
  }
}
