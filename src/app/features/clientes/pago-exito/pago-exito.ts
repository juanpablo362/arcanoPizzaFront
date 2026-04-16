import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CarritoService } from '../carrito-compra-component/carrito-compra.service';
import { PagosService } from '../../../core/services/pagos.service';

@Component({
  selector: 'app-pago-exito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-exito.html',
  styleUrl: './pago-exito.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoExito implements OnDestroy {
  private readonly carritoService = inject(CarritoService);
  private readonly pagosService = inject(PagosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  protected readonly confirmando = signal(false);
  protected readonly pedidoRegistradoId = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      const sessionId =
        this.route.snapshot.queryParamMap.get('session_id') ??
        this.route.snapshot.queryParamMap.get('sessionId');

      const finalizarYRedirigir = (opts?: { delayMs?: number }) => {
        this.carritoService.vaciarCarrito();
        const delay = opts?.delayMs ?? 4000;
        this.timeoutId = setTimeout(() => {
          void this.router.navigate(['/menu']);
        }, delay);
      };

      if (!sessionId) {
        console.warn(
          '[PagoExito] Falta session_id en la URL. El API debe definir success_url con ?session_id={CHECKOUT_SESSION_ID}',
        );
        finalizarYRedirigir();
        return;
      }

      this.confirmando.set(true);
      this.pagosService.confirmarSesionCheckout(sessionId).subscribe({
        next: (pedido) => {
          console.log('[PagoExito] Pedido guardado', pedido.idPedido);
          this.pedidoRegistradoId.set(pedido.idPedido);
          this.confirmando.set(false);
          finalizarYRedirigir({ delayMs: 12000 });
        },
        error: (err) => {
          console.error('[PagoExito] Error al confirmar sesión / crear pedido en el servidor', err);
          this.confirmando.set(false);
          finalizarYRedirigir();
        },
      });
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
  }

  /** Cancela la redirección automática al ir a otra ruta desde los enlaces. */
  protected cancelarRedireccionAuto(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
