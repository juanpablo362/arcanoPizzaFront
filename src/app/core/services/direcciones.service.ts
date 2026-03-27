import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import type { Direccion } from '../../shared/models/pedido.model';

export interface DireccionCrearPayload {
  calle: string;
  colonia: string;
  codigoPostal: string;
}

@Injectable({ providedIn: 'root' })
export class DireccionesService {
  private readonly http = inject(HttpClient);

  misDirecciones(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${API_BASE_URL}/Direcciones`);
  }

  crear(payload: DireccionCrearPayload): Observable<Direccion> {
    return this.http.post<Direccion>(`${API_BASE_URL}/Direcciones`, payload);
  }
}
