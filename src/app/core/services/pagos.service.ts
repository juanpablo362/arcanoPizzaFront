import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import type { PedidoDetalle } from '../../shared/models/pedido.model';

/**
 * Pagos con Stripe (Checkout Session).
 *
 * El backend debe:
 * 1. Al crear la sesión (`POST .../pagos/crear-sesion`), usar en `success_url` el placeholder de Stripe:
 *    `.../pago-exito?session_id={CHECKOUT_SESSION_ID}` (relativo o absoluto según tu app).
 * 2. Implementar `POST .../pagos/confirmar-sesion` con body `{ sessionId }`, verificar el pago con la API de Stripe,
 *    crear el pedido en BD (idempotente por `sessionId`) y devolver el mismo shape que `GET /Pedidos/:id`.
 */
@Injectable({
  providedIn: 'root',
})
export class PagosService {
  private readonly http = inject(HttpClient);

  confirmarSesionCheckout(sessionId: string): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${API_BASE_URL}/pagos/confirmar-sesion`, {
      sessionId,
    });
  }
}
