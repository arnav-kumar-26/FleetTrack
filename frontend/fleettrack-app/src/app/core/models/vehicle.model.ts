export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  currentMileage: number;
  serviceIntervalMonths: number | null;
  serviceIntervalMileage: number | null;
  isActive: boolean;
  nextServiceDueDate: string | null;
  nextServiceDueMileage: number | null;
  isServiceDue: boolean;
}

export interface VehicleCreateRequest {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  currentMileage: number;
  serviceIntervalMonths?: number | null;
  serviceIntervalMileage?: number | null;
}

export interface VehicleUpdateRequest {
  make: string;
  model: string;
  year: number;
  serviceIntervalMonths?: number | null;
  serviceIntervalMileage?: number | null;
}
