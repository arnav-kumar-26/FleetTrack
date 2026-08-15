export interface MaintenanceLog {
  id: number;
  vehicleId: number;
  serviceDate: string;
  description: string;
  cost: number;
  mileageAtService: number;
}

export interface MaintenanceLogCreateRequest {
  vehicleId: number;
  serviceDate: string;
  description: string;
  cost: number;
  mileageAtService: number;
}

export interface MaintenanceLogUpdateRequest {
  serviceDate: string;
  description: string;
  cost: number;
  mileageAtService: number;
}
