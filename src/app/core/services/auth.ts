import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api';

const AUTH_STORAGE_KEY = 'arcano_auth';

export interface AuthUser {
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  rol: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  usuario: AuthUser;
}

/** Cuerpo para `POST /api/Auth/register` (mismo estilo que login: correo + password). */
export interface RegisterPayload {
  nombreUsuario: string;
  correo: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly accessToken = signal<string | null>(null);
  readonly user = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { accessToken: string; usuario: AuthUser };
      if (data?.accessToken && data?.usuario) {
        this.accessToken.set(data.accessToken);
        this.user.set(data.usuario);
      }
    } catch {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${API_BASE_URL}/Auth/login`, {
        correo: credentials.email.trim(),
        password: credentials.password,
      })
      .pipe(
        tap((res) => {
          this.accessToken.set(res.accessToken);
          this.user.set(res.usuario);
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({ accessToken: res.accessToken, usuario: res.usuario }),
            );
          }
        }),
      );
  }

  /**
   * Registro de cliente. Si la API devuelve el mismo DTO que login, se persiste la sesión.
   * Si responde sin token, el usuario puede iniciar sesión a mano.
   */
  register(payload: RegisterPayload): Observable<AuthResponseDto | null> {
    return this.http
      .post<AuthResponseDto | null>(`${API_BASE_URL}/Auth/register`, {
        nombreUsuario: payload.nombreUsuario.trim(),
        correo: payload.correo.trim(),
        password: payload.password,
      })
      .pipe(
        tap((res) => {
          if (!res?.accessToken || !res?.usuario) return;
          this.accessToken.set(res.accessToken);
          this.user.set(res.usuario);
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({ accessToken: res.accessToken, usuario: res.usuario }),
            );
          }
        }),
      );
  }

  logout(): void {
    this.accessToken.set(null);
    this.user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
    void this.router.navigate(['/auth']);
  }
}
