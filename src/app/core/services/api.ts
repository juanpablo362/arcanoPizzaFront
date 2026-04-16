import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Base de la API para HttpClient.
 *
 * - Desarrollo: `proxy.conf.json` reenvía `/api` al backend local.
 * - Producción: `environment.prod.ts` (sustitución en build) o `window.__API_BASE_URL__` en index.html.
 */
export const API_BASE_URL =
  (globalThis as { __API_BASE_URL__?: string } | undefined)?.['__API_BASE_URL__'] ??
  // Permite builds/entornos donde exista `process.env` (sin requerir tipos de Node en el front).
  (globalThis as any)?.process?.env?.API_BASE_URL ??
  environment.apiBaseUrl;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly http = inject(HttpClient);

  /** Permite a servicios hijos apuntar a sub-rutas (p.ej. /api/admin). */
  protected baseUrl = API_BASE_URL;
}
