import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { etiquetaMetodoPago, type PedidoLista } from '../../shared/models/pedido.model';
import { ClienteTopNavComponent } from '../../shared/cliente-top-nav/cliente-top-nav.component';
import { PedidosService } from './pedidos.service';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe, ClienteTopNavComponent],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pedidos {
  private readonly pedidosService = inject(PedidosService);

  protected readonly metodoPagoEtiqueta = etiquetaMetodoPago;

  protected readonly pedidos = signal<PedidoLista[]>([]);
  protected readonly loading = signal(true);
  protected readonly cargaFallida = signal(false);

  constructor() {
    afterNextRender(() => this.cargar());
  }

  protected cargar(): void {
    this.loading.set(true);
    this.cargaFallida.set(false);
    this.pedidosService
      .misPedidos()
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          console.error('[Pedidos] Error al cargar el historial', err);
          this.cargaFallida.set(true);
          return EMPTY;
        }),
      )
      .subscribe((data) => this.pedidos.set(data));
  }
}
