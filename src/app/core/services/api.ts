import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Base de la API para HttpClient (ruta relativa al origen de la app).
 *
 * Con `ng serve`, `proxy.conf.json` reenvía `/api` al backend (p. ej. `https://localhost:7030`),
 * evitando CORS y usando el mismo esquema que el front.
 *
 * Si desplegás el front en otro dominio que el API, definí la URL completa en el build
 * (p. ej. sustitución en `angular.json` o variable de entorno del pipeline).
 */
export const API_BASE_URL = '/api';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly http = inject(HttpClient);

  /** Permite a servicios hijos apuntar a sub-rutas (p.ej. /api/admin). */
  protected baseUrl = API_BASE_URL;
}
