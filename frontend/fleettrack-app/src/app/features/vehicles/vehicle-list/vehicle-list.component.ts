import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../core/models/vehicle.model';
import { staggerDelay } from '../../../core/utils/stagger.util';
import { VehicleDrawerComponent } from '../vehicle-drawer/vehicle-drawer.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideDynamicIcon, VehicleDrawerComponent],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Vehicles</h1>
        <button
          type="button"
          (click)="openNew()"
          class="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <svg lucideIcon="plus" [size]="18" />
          New Vehicle
        </button>
      </div>

      <p *ngIf="loading()" class="mt-4 text-sm text-gray-500">Loading…</p>
      <p *ngIf="errorMessage()" class="mt-4 text-sm text-red-600">{{ errorMessage() }}</p>

      <ng-container *ngIf="vehicles() as vehicles">
        <div
          *ngIf="vehicles.length > 0"
          class="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white"
        >
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">Vehicle</th>
                <th class="px-4 py-3">Year</th>
                <th class="px-4 py-3">Plate</th>
                <th class="px-4 py-3">Mileage</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                *ngFor="let vehicle of vehicles; let i = index"
                class="transition-colors hover:bg-slate-50"
                animate.enter="fade-in-up"
                [style.animation-delay.ms]="staggerDelay(i)"
              >
                <td class="px-4 py-3">
                  <a
                    [routerLink]="['/vehicles', vehicle.id]"
                    class="font-semibold text-blue-600 hover:underline"
                  >
                    {{ vehicle.make }} {{ vehicle.model }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ vehicle.year }}</td>
                <td class="px-4 py-3 text-gray-600">{{ vehicle.plateNumber }}</td>
                <td class="px-4 py-3 text-gray-600">{{ vehicle.currentMileage | number }}</td>
                <td class="px-4 py-3">
                  <span
                    *ngIf="vehicle.isServiceDue"
                    class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                  >
                    <svg lucideIcon="triangle-alert" [size]="12" class="text-amber-600" />
                    Service Due
                  </span>
                  <span
                    *ngIf="!vehicle.isServiceDue && !vehicle.isActive"
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
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      [routerLink]="['/vehicles', vehicle.id]"
                      [attr.aria-label]="'View ' + vehicle.make + ' ' + vehicle.model"
                      class="rounded-md p-2 text-slate-500 transition-transform duration-150 ease-out hover:scale-105 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
                    >
                      <svg lucideIcon="eye" [size]="18" />
                    </a>
                    <button
                      type="button"
                      [attr.aria-label]="'Edit ' + vehicle.make + ' ' + vehicle.model"
                      (click)="openEdit(vehicle, $event)"
                      class="rounded-md p-2 text-slate-500 transition-transform duration-150 ease-out hover:scale-105 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
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
          class="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
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
            <path d="M5 17h-1a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h.4l1.1-2.8A3 3 0 0 1 9.3 7h5.4a3 3 0 0 1 2.8 2.2l1.1 2.8H19a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-1" />
            <path d="M5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
            <path d="M19 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
            <path d="M9 3h6" />
            <path d="M12 3v4" />
          </svg>
          <h2 class="mt-4 text-lg font-semibold text-gray-900">No vehicles yet</h2>
          <p class="mt-1 text-sm text-gray-500">Add your first vehicle to start tracking maintenance.</p>
          <button
            type="button"
            (click)="openNew()"
            class="mt-5 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out hover:bg-indigo-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg lucideIcon="plus" [size]="18" />
            Add Vehicle
          </button>
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
