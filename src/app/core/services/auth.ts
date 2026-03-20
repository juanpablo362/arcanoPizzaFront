import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, share, tap, throwError } from 'rxjs';
import { ApiService } from './api';
import {
  LoginApiRequest,
  RegisterApiRequest,
  parseAuthTokenResponse,
  type AuthUser,
  type ParsedAuthSession,
} from '../models/auth.model';

const STORAGE_KEY = 'arcano-auth';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
  /** epoch ms; renovación proactiva opcional */
  expiresAt?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly rawHttp = new HttpClient(inject(HttpBackend));

  private refreshInFlight$: Observable<void> | null = null;
  /**
   * Aumenta cada vez que invalidamos la sesión.
   * Evita que una respuesta "vieja" de refresh re-aplique tokens después de logout/invalidación.
   */
  private sessionGeneration = 0;

  /** JWT de acceso ([Authorize] en la API) */
  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly isAuthenticated = signal(false);
  readonly user = signal<AuthUser | null>(null);
  /** Momento estimado de caducidad del access (Date.now() al guardar) */
  readonly expiresAt = signal<number | undefined>(undefined);

  readonly isLoggedIn = computed(() => this.isAuthenticated());
  /** Alias usado por plantillas / código legado */
  readonly token = this.accessToken.asReadonly();

  constructor() {
    super();
    this.restoreSession();
  }

  private restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed?.accessToken && parsed?.refreshToken) {
        this.accessToken.set(parsed.accessToken);
        this.refreshToken.set(parsed.refreshToken);
        this.user.set(parsed.user ?? null);
        this.expiresAt.set(parsed.expiresAt);
        this.isAuthenticated.set(true);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private persistSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const access = this.accessToken();
    const refresh = this.refreshToken();
    const u = this.user();
    if (access && refresh) {
      const payload: StoredSession = {
        accessToken: access,
        refreshToken: refresh,
        user: u,
        expiresAt: this.expiresAt(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private applySession(session: ParsedAuthSession): void {
    this.accessToken.set(session.accessToken);
    this.refreshToken.set(session.refreshToken);
    this.user.set(session.user);
    this.expiresAt.set(session.expiresAt);
    this.isAuthenticated.set(true);
    this.persistSession();
  }

  /**
   * Limpia sesión local y navega a /auth (sin llamar al back).
   * Usar cuando falle el refresh o no haya tokens.
   */
  invalidateSession(): void {
    this.sessionGeneration++;
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    this.expiresAt.set(undefined);
    this.isAuthenticated.set(false);
    this.persistSession();
    void this.router.navigate(['/auth']);
  }

  login(body: LoginApiRequest): Observable<void> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/login`, body).pipe(
      tap((response) => {
        const session = parseAuthTokenResponse(response);
        if (!session) {
          throw new Error(
            'La respuesta del servidor no incluye tokens válidos.'
          );
        }
        this.applySession(session);
      }),
      map(() => undefined)
    );
  }

  /**
   * Registro: si el back devuelve el mismo JSON que login/refresh, inicia sesión.
   * Si no hay tokens en la respuesta, el caller muestra éxito y pide login.
   */
  register(
    body: RegisterApiRequest
  ): Observable<'authenticated' | 'registered'> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/register`, body).pipe(
      map((response) => {
        const session = parseAuthTokenResponse(response);
        if (session) {
          this.applySession(session);
          return 'authenticated' as const;
        }
        return 'registered' as const;
      })
    );
  }

  /**
   * POST /api/auth/refresh sin pasar por interceptores HTTP (evita ciclos).
   * Varias peticiones 401 concurrentes comparten una sola llamada (`share`).
   */
  refreshTokens(): Observable<void> {
    const rt = this.refreshToken();
    if (!rt) {
      return throwError(() => new Error('Sin refresh token'));
    }
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }
    const currentGeneration = this.sessionGeneration;
    this.refreshInFlight$ = this.rawHttp
      .post<unknown>(`${this.baseUrl}/auth/refresh`, { refreshToken: rt })
      .pipe(
        tap((body) => {
          // Si la sesión ya fue invalidada (logout / refresh fallido / etc),
          // no re-aplicar tokens aunque la llamada a refresh haya concluido.
          if (this.sessionGeneration !== currentGeneration) {
            return;
          }
          const session = parseAuthTokenResponse(body);
          if (!session) {
            throw new Error('Respuesta de refresh inválida');
          }
          this.applySession(session);
        }),
        map(() => undefined),
        share(),
        finalize(() => {
          this.refreshInFlight$ = null;
        })
      );
    return this.refreshInFlight$;
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.invalidateSession();
      return;
    }
    const rt = this.refreshToken();
    if (!rt) {
      this.invalidateSession();
      return;
    }
    this.rawHttp
      .post<unknown>(`${this.baseUrl}/auth/logout`, { refreshToken: rt })
      .pipe(
        catchError(() => of(undefined)),
        finalize(() => this.invalidateSession())
      )
      .subscribe();
  }
}
