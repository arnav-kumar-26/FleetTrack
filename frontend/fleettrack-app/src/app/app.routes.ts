import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'vehicles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/vehicles/vehicle-list/vehicle-list.component').then(
        (m) => m.VehicleListComponent,
      ),
  },
  {
    path: 'vehicles/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/vehicles/vehicle-form/vehicle-form.component').then(
        (m) => m.VehicleFormComponent,
      ),
  },
  {
    path: 'vehicles/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/vehicles/vehicle-detail/vehicle-detail.component').then(
        (m) => m.VehicleDetailComponent,
      ),
  },
  {
    path: 'vehicles/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/vehicles/vehicle-form/vehicle-form.component').then(
        (m) => m.VehicleFormComponent,
      ),
  },
  {
    path: 'vehicles/:id/logs/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/maintenance-logs/maintenance-log-form/maintenance-log-form.component').then(
        (m) => m.MaintenanceLogFormComponent,
      ),
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
