import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = 'http://localhost:5010/api/Pedidos'; 
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
}