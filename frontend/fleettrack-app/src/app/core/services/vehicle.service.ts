import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaintenanceLog } from '../models/maintenance-log.model';
import { Vehicle, VehicleCreateRequest, VehicleUpdateRequest } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/vehicles`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.baseUrl);
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);
  }

  getDueForService(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/due-for-service`);
  }

  create(request: VehicleCreateRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.baseUrl, request);
  }

  update(id: number, request: VehicleUpdateRequest): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.baseUrl}/${id}`, request);
  }

  archive(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/archive`, {});
  }

  unarchive(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/unarchive`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMaintenanceLogsForVehicle(id: number): Observable<MaintenanceLog[]> {
    return this.http.get<MaintenanceLog[]>(`${this.baseUrl}/${id}/maintenance-logs`);
  }
}