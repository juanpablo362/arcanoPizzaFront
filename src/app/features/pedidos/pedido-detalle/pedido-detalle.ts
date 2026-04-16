import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  etiquetaMetodoPago,
  type PedidoDetalle as PedidoDetalleModel,
} from '../../../shared/models/pedido.model';
import {
  etiquetaEstadoPedidoCliente,
  sufijoClaseEstadoPedido,
} from '../../../shared/pedido-estado';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';
import { PedidosService } from '../pedidos.service';

@Component({
  selector: 'app-pedido-detalle',
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, ClienteTopNavComponent],
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly pedidosService = inject(PedidosService);

  protected readonly metodoPagoEtiqueta = etiquetaMetodoPago;
  protected readonly etiquetaEstado = etiquetaEstadoPedidoCliente;
  protected readonly claseEstado = sufijoClaseEstadoPedido;

  protected readonly pedido = signal<PedidoDetalleModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private idPedido = 0;

  constructor() {
    afterNextRender(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!Number.isFinite(id)) {
        console.warn('[PedidoDetalle] ID de ruta no numérico');
        this.error.set('Este enlace no es válido.');
        this.loading.set(false);
        return;
      }
      this.idPedido = id;
      this.cargarPedido();
    });
  }

  protected recargar(): void {
    if (this.idPedido < 1) return;
    this.cargarPedido();
  }

  private cargarPedido(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pedidosService.obtener(this.idPedido).subscribe({
      next: (p) => {
        this.pedido.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[PedidoDetalle] No se pudo cargar el pedido', err);
        this.error.set('No encontramos este pedido.');
        this.loading.set(false);
      },
    });
  }
}
