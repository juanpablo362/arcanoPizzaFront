import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
  // ⚠️ Asegúrate de que el puerto (5000) sea el de tu API de .NET
  private apiUrl = 'https://localhost:7030/api/Promociones'; 

  obtenerPromocionesActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiUrl);
  }
}