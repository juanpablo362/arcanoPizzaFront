import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';

export interface Promocion {
  idPromocion: number;
  titulo: string;
  descripcion?: string;
  contenido?: string;
  imagenURL?: string;
  precioOriginal: number;
  precioPromocional: number;
  ahorroMonto: number;
  tipoVigencia: number;
  fechaValidaHasta?: Date;
  diaSemanaRecurrente?: number;
  activo: boolean;
}

export interface PromocionCreatePayload {
  titulo: string;
  descripcion?: string | null;
  contenido?: string | null;
  imagenURL?: string | null;
  precioOriginal: number;
  precioPromocional: number;
  tipoVigencia: number;
  fechaValidaHasta?: string | null; // ISO
  diaSemanaRecurrente?: number | null;
  activo?: boolean;
}

export interface PromocionUpdatePayload {
  titulo?: string | null;
  descripcion?: string | null;
  contenido?: string | null;
  imagenURL?: string | null;
  precioOriginal?: number | null;
  precioPromocional?: number | null;
  tipoVigencia?: number | null;
  fechaValidaHasta?: string | null; // ISO
  diaSemanaRecurrente?: number | null;
  activo?: boolean | null;
}

@Injectable({
  providedIn: 'root'
})
export class PromocionesService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/Promociones`;

  obtenerPromocionesActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiUrl);
  }

  obtenerPromocionesAdmin(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/admin`);
  }

  crearPromocion(payload: PromocionCreatePayload): Observable<Promocion> {
    return this.http.post<Promocion>(this.apiUrl, payload);
  }

  actualizarPromocion(id: number, payload: PromocionUpdatePayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  eliminarPromocion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}