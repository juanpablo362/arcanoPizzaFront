import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoPedido {
  cantidad: number;
  nombre: string;
  nota?: string | null;
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
  procesando?: boolean; // Bandera para la animación de carga y bloqueo
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  
  // URL de tu API en .NET (Ajustado al puerto HTTP)
  private apiUrl = 'http://localhost:5010/api/Pedidos'; 
  
  private http = inject(HttpClient);

  // Obtener todos los pedidos para el dashboard
  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/dashboard`);
  }

  // Actualizar el estado de un pedido específico
  actualizarEstado(idString: string, nuevoEstado: string): Observable<any> {
    // Convertimos "ORD-000007" a 7 para que .NET lo entienda
    const idNumerico = parseInt(idString.replace('ORD-', ''), 10);
    
    return this.http.patch(`${this.apiUrl}/${idNumerico}/estado`, JSON.stringify(nuevoEstado), {
      headers: { 'Content-Type': 'application/json' },
      
    });
  }
}