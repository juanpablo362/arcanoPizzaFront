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

@Injectable({
  providedIn: 'root'
})
export class PromocionesService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/Promociones`;

  obtenerPromocionesActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiUrl);
  }
}