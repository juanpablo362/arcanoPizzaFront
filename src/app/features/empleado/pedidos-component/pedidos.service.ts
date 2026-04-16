import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/services/api';

export interface ProductoPedido {
  cantidad: number;
  nombre: string;
  nota?: string | null;
  ingredientes?: string; // 👈 Campo de ingredientes agregado
}

export interface Pedido {
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

// Agrega esta interfaz arriba
export interface Empleado {
  idUsuario: number;
  nombreUsuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private readonly apiUrl = `${API_BASE_URL}/Pedidos`;
  private http = inject(HttpClient);

  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/dashboard`);
  }

  actualizarEstado(idString: string, nuevoEstado: string): Observable<any> {
    const idNumerico = parseInt(idString.replace('ORD-', ''), 10);
    return this.http.patch(`${this.apiUrl}/${idNumerico}/estado`, JSON.stringify(nuevoEstado), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Dentro de tu clase PedidosService añade:
  obtenerRepartidores(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.apiUrl}/repartidores`);
  }

  asignarRepartidor(idString: string, repartidorId: number): Observable<any> {
    const idNumerico = parseInt(idString.replace('ORD-', ''), 10);
    return this.http.patch(`${this.apiUrl}/${idNumerico}/asignar-repartidor`, { 
      repartidorId: repartidorId 
    });
  }
}