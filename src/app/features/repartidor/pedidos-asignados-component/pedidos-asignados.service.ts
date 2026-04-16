import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/services/api';

export interface ProductoPedido {
  cantidad: number;
  nombre: string;
  nota?: string | null;
  ingredientes?: string;
}

export interface PedidoAsignado {
  id: string;
  estado: string;
  urgente: boolean;
  horaRecibido: string;
  horaEntrega: string;
  cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
  };
  productos: ProductoPedido[];
  total: number;
  procesando?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PedidosAsignadosService {
  private readonly apiUrl = `${API_BASE_URL}/Pedidos`;
  private readonly http = inject(HttpClient);

  obtenerMisAsignados(): Observable<PedidoAsignado[]> {
    return this.http.get<PedidoAsignado[]>(`${this.apiUrl}/mis-asignados`);
  }

  actualizarEstado(idString: string, nuevoEstado: string): Observable<any> {
    const idNumerico = parseInt(idString.replace('ORD-', ''), 10);
    return this.http.patch(`${this.apiUrl}/${idNumerico}/estado`, JSON.stringify(nuevoEstado), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

