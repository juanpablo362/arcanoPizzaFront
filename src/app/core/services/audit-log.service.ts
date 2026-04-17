import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService, API_BASE_URL } from './api';

export interface AuditLogItem {
  id: number;
  ocurrioEn: string;
  nivel: string;
  categoria: string;
  mensaje: string;
  idUsuario: number | null;
  correoUsuario: string | null;
  ip: string | null;
  userAgent: string | null;
  metodoHttp: string | null;
  ruta: string | null;
  codigoEstado: number | null;
  duracionMs: number | null;
  traceId: string | null;
  detalle: string | null;
}

export interface PagedAuditLogsResponse {
  total: number;
  page: number;
  pageSize: number;
  items: AuditLogItem[];
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogService extends ApiService {
  constructor() {
    super();
    this.baseUrl = `${API_BASE_URL}/audit-logs`;
  }

  listar(
    page: number,
    pageSize: number,
    opciones?: {
      desde?: string;
      hasta?: string;
      categoria?: string;
      nivel?: string;
      statusCode?: number;
      metodoHttp?: string;
      ip?: string;
      usuario?: string;
      q?: string;
    },
  ): Observable<PagedAuditLogsResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    if (opciones?.desde) params = params.set('desde', opciones.desde);
    if (opciones?.hasta) params = params.set('hasta', opciones.hasta);
    if (opciones?.categoria) params = params.set('categoria', opciones.categoria);
    if (opciones?.nivel) params = params.set('nivel', opciones.nivel);
    if (opciones?.statusCode != null) params = params.set('statusCode', String(opciones.statusCode));
    if (opciones?.metodoHttp) params = params.set('metodoHttp', opciones.metodoHttp);
    if (opciones?.ip) params = params.set('ip', opciones.ip);
    if (opciones?.usuario) params = params.set('usuario', opciones.usuario);
    if (opciones?.q) params = params.set('q', opciones.q);

    return this.http.get<PagedAuditLogsResponse>(this.baseUrl, { params });
  }
}
