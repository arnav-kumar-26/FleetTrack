import type { MaintenanceLog } from './maintenance-log.model';

export interface DashboardSummary {
  totalActiveVehicles: number;
  totalLifetimeCost: number;
  costThisMonth: number;
  costThisYear: number;
  averageCostPerVehicle: number;
  vehiclesDueForService: number;
  recentLogs: MaintenanceLog[];
}

export interface CostTrendPoint {
  month: string;
  totalCost: number;
}
