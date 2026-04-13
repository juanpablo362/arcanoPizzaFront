import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/services/api';
import type {
  PedidoCrearPayload,
  PedidoDetalle,
  PedidoLista,
} from '../../shared/models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private readonly http = inject(HttpClient);

  misPedidos(): Observable<PedidoLista[]> {
    return this.http.get<PedidoLista[]>(`${API_BASE_URL}/Pedidos`);
  }

  obtener(id: number): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${API_BASE_URL}/Pedidos/${id}`);
  }

  crear(payload: PedidoCrearPayload): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${API_BASE_URL}/Pedidos`, payload);
  }
}
