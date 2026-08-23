import type { MaintenanceLog } from './maintenance-log.model';

export interface DashboardSummary {
  totalActiveVehicles: number;
  totalLifetimeCost: number;
  costThisMonth: number;
  costThisYear: number;
  averageCostPerVehicle: number;
  vehiclesDueForService: number;
  recentLogs: MaintenanceLog[];
  activeVehiclesChangePercent: number | null;
  lifetimeCostChangePercent: number | null;
  costThisMonthChangePercent: number | null;
  dueForServiceChangePercent: number | null;
}

export interface CostTrendPoint {
  month: string;
  totalCost: number;
}
