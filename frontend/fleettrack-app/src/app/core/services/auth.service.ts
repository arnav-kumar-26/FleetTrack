import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth.model';

const AUTH_KEY = 'fleettrack_auth';

interface StoredAuth {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/auth`;
  private readonly authenticated = signal<boolean>(this.readStored() !== null);
  private readonly user = signal<AuthUser | null>(this.readStored()?.user ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => this.storeAuth(response)),
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => this.storeAuth(response)),
    );
  }

  isAuthenticated() {
    return this.authenticated.asReadonly();
  }

  currentUser() {
    return this.user.asReadonly();
  }

  getToken(): string | null {
    return this.readStored()?.token ?? null;
  }

  getCurrentUser(): AuthUser | null {
    return this.readStored()?.user ?? null;
  }

  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    this.authenticated.set(false);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private storeAuth(response: AuthResponse) {
    const stored: StoredAuth = {
      token: response.token,
      expiresAt: response.expiresAt,
      user: response.user,
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(stored));
    this.authenticated.set(true);
    this.user.set(response.user);
  }

  private readStored(): StoredAuth | null {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) {
      return null;
    }
    try {
      const stored = JSON.parse(raw) as StoredAuth;
      if (!stored.token || !stored.expiresAt || new Date(stored.expiresAt).getTime() <= Date.now()) {
        sessionStorage.removeItem(AUTH_KEY);
        return null;
      }
      return stored;
    } catch {
      return null;
    }
  }
}
