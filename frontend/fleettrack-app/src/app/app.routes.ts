import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { VehicleListComponent } from './features/vehicles/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './features/vehicles/vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './features/vehicles/vehicle-form/vehicle-form.component';
import { MaintenanceLogFormComponent } from './features/maintenance-logs/maintenance-log-form/maintenance-log-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent },
  { path: 'vehicles', canActivate: [authGuard], component: VehicleListComponent },
  { path: 'vehicles/new', canActivate: [authGuard], component: VehicleFormComponent },
  { path: 'vehicles/:id', canActivate: [authGuard], component: VehicleDetailComponent },
  { path: 'vehicles/:id/edit', canActivate: [authGuard], component: VehicleFormComponent },
  { path: 'vehicles/:id/logs/new', canActivate: [authGuard], component: MaintenanceLogFormComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
