import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MaintenanceLog,
  MaintenanceLogCreateRequest,
  MaintenanceLogUpdateRequest,
} from '../models/maintenance-log.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceLogService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/maintenance-logs`;

  constructor(private readonly http: HttpClient) {}

  getAll(vehicleId?: number): Observable<MaintenanceLog[]> {
    let params = new HttpParams();
    if (vehicleId !== undefined) {
      params = params.set('vehicleId', vehicleId);
    }
    return this.http.get<MaintenanceLog[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<MaintenanceLog> {
    return this.http.get<MaintenanceLog>(`${this.baseUrl}/${id}`);
  }

  create(request: MaintenanceLogCreateRequest): Observable<MaintenanceLog> {
    return this.http.post<MaintenanceLog>(this.baseUrl, request);
  }

  update(id: number, request: MaintenanceLogUpdateRequest): Observable<MaintenanceLog> {
    return this.http.put<MaintenanceLog>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}