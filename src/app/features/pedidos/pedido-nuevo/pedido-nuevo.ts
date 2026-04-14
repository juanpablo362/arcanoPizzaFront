import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  CarritoService,
  type ItemCarrito,
} from '../../clientes/carrito-compra-component/carrito-compra.service';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';
import { DireccionesService } from '../../../core/services/direcciones.service';
import type { Direccion } from '../../../shared/models/pedido.model';
import { PedidosService } from '../pedidos.service';

@Component({
  selector: 'app-pedido-nuevo',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ClienteTopNavComponent],
  templateUrl: './pedido-nuevo.html',
  styleUrl: './pedido-nuevo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoNuevo {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly carrito = inject(CarritoService);
  private readonly direccionesService = inject(DireccionesService);
  private readonly pedidosService = inject(PedidosService);

  protected readonly direcciones = signal<Direccion[]>([]);
  protected readonly cargandoDatos = signal(true);
  protected readonly enviando = signal(false);
  /** Solo cuando entrás sin productos en el carrito: pantalla única con enlace al menú. */
  protected readonly carritoVacioBloqueo = signal(false);
  /** Avisos sobre el formulario (fallo al guardar dirección, al confirmar pedido, etc.). */
  protected readonly aviso = signal<string | null>(null);

  /** Para Reintentar tras error: última acción que falló. */
  protected readonly ultimoErrorAccion = signal<'stripe' | 'pedido' | 'efectivo' | null>(null);

  /** Flujo desde carrito: mismo formulario y luego Stripe. */
  protected readonly checkoutConTarjeta = signal(false);

  /** Para mostrar u ocultar campos de dirección (Recoger en local no exige domicilio). */
  protected readonly tipoEntregaActual = signal<string>('Reparto');

  protected readonly nuevaDir = this.fb.nonNullable.group({
    calle: ['', Validators.required],
    colonia: ['', Validators.required],
    codigoPostal: ['', [Validators.required, Validators.maxLength(10)]],
  });

  protected readonly pedidoForm = this.fb.nonNullable.group({
    direccionId: [0, [Validators.required, Validators.min(1)]],
    tipoEntrega: ['Reparto', Validators.required],
    promocionId: [''],
    /** Efectivo = al entregar/retirar; vacío = coordinar con la tienda */
    metodoPago: ['Efectivo'],
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const pago = params.get('pago')?.toLowerCase() ?? '';
        this.checkoutConTarjeta.set(pago === 'stripe' || pago === 'tarjeta');
      });

    this.pedidoForm.get('promocionId')?.valueChanges.subscribe(() => {
      const c = this.pedidoForm.get('promocionId');
      if (c?.errors && c.errors['invalid']) {
        c.setErrors(null, { emitEvent: false });
      }
    });

    const tipoCtrl = this.pedidoForm.get('tipoEntrega');
    const dirCtrl = this.pedidoForm.get('direccionId');
    tipoCtrl?.valueChanges.pipe(takeUntilDestroyed()).subscribe((tipo) => {
      this.tipoEntregaActual.set(tipo);
      if (!dirCtrl) return;
      if (tipo === 'Recoger') {
        dirCtrl.clearValidators();
      } else {
        dirCtrl.setValidators([Validators.required, Validators.min(1)]);
        const cur = Number(dirCtrl.value);
        if (cur < 1 && this.direcciones().length > 0) {
          dirCtrl.patchValue(this.direcciones()[0].idDireccion, { emitEvent: false });
        }
      }
      dirCtrl.updateValueAndValidity({ emitEvent: false });
    });
    this.tipoEntregaActual.set(tipoCtrl?.value ?? 'Reparto');

    afterNextRender(() => {
      if (this.carrito.obtenerCarrito().length === 0) {
        this.carritoVacioBloqueo.set(true);
        this.cargandoDatos.set(false);
        return;
      }
      this.direccionesService.misDirecciones().subscribe({
        next: (list) => {
          this.direcciones.set(list);
          const first = list[0];
          if (first && this.pedidoForm.get('tipoEntrega')?.value !== 'Recoger') {
            this.pedidoForm.patchValue({ direccionId: first.idDireccion });
          }
          this.cargandoDatos.set(false);
        },
        error: (err) => {
          console.error('[PedidoNuevo] Error al cargar direcciones', err);
          this.direcciones.set([]);
          this.cargandoDatos.set(false);
        },
      });
    });
  }

  /** ID de dirección para API: null en recogida sin domicilio. */
  private direccionIdParaApi(): number | null {
    const { tipoEntrega, direccionId } = this.pedidoForm.getRawValue();
    if (tipoEntrega === 'Recoger') {
      const id = Number(direccionId);
      return id >= 1 ? id : null;
    }
    return Number(direccionId);
  }

  /** Deshabilitar envío si falta dirección en reparto. */
  protected faltaDireccionReparto(): boolean {
    return (
      this.tipoEntregaActual() === 'Reparto' &&
      (this.direcciones().length === 0 || Number(this.pedidoForm.get('direccionId')?.value) < 1)
    );
  }

  protected agregarDireccion(): void {
    if (this.nuevaDir.invalid) {
      this.nuevaDir.markAllAsTouched();
      return;
    }
    const v = this.nuevaDir.getRawValue();
    this.direccionesService.crear(v).subscribe({
      next: (d) => {
        this.aviso.set(null);
        this.direcciones.update((list) => [...list, d]);
        this.pedidoForm.patchValue({ direccionId: d.idDireccion });
        this.nuevaDir.reset();
      },
      error: (err) => {
        console.error('[PedidoNuevo] Error al guardar dirección', err);
        this.aviso.set('No pudimos guardar la dirección. Revisá los datos e intentá de nuevo.');
      },
    });
  }

  protected iniciarPagoStripe(): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }
    const items = this.carrito.obtenerCarrito();
    if (items.length === 0) {
      this.aviso.set('Tu carrito está vacío.');
      return;
    }

    const { tipoEntrega, promocionId } = this.pedidoForm.getRawValue();
    const promoNum = promocionId.trim() === '' ? null : Number(promocionId);
    if (promocionId.trim() !== '' && !Number.isFinite(promoNum)) {
      this.pedidoForm.get('promocionId')?.setErrors({ invalid: true });
      return;
    }

    this.enviando.set(true);
    this.aviso.set(null);
    this.ultimoErrorAccion.set(null);

    this.carrito
      .crearSesionStripe$({
        direccionId: this.direccionIdParaApi(),
        tipoEntrega,
        promocionId: promoNum,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (respuesta) => {
          if (respuesta?.url) {
            globalThis.location.href = respuesta.url;
          }
        },
        error: (err) => {
          console.error('[PedidoNuevo] Error al crear sesión Stripe', err);
          this.ultimoErrorAccion.set('stripe');
          this.aviso.set(
            'No pudimos iniciar el pago con tarjeta. Revisá tu sesión e intentá de nuevo.',
          );
        },
      });
  }

  protected reintentarUltimaAccion(): void {
    const u = this.ultimoErrorAccion();
    if (u === 'stripe') {
      this.iniciarPagoStripe();
      return;
    }
    if (u === 'efectivo') {
      this.confirmarPagoEfectivo();
      return;
    }
    this.confirmarPedido();
  }

  protected itemsResumen(): ItemCarrito[] {
    return this.carrito.obtenerCarrito();
  }

  protected subtotalResumen(): number {
    return this.itemsResumen().reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  }

  protected ivaResumen(): number {
    return this.subtotalResumen() * 0.16;
  }

  protected totalResumen(): number {
    return this.subtotalResumen() + this.ivaResumen();
  }

  protected confirmarPedido(): void {
    const { metodoPago } = this.pedidoForm.getRawValue();
    const m = metodoPago.trim() === '' ? null : metodoPago.trim();
    this.enviarPedidoSinStripe(m);
  }

  /** Desde el flujo Stripe: mismo pedido pero cobro en efectivo al entregar o al retirar. */
  protected confirmarPagoEfectivo(): void {
    this.enviarPedidoSinStripe('Efectivo');
  }

  private enviarPedidoSinStripe(metodoPago: string | null): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }
    const items = this.carrito.obtenerCarrito();
    if (items.length === 0) {
      this.aviso.set('Tu carrito está vacío.');
      return;
    }
    const { tipoEntrega, promocionId } = this.pedidoForm.getRawValue();
    const promoNum = promocionId.trim() === '' ? null : Number(promocionId);
    if (promocionId.trim() !== '' && !Number.isFinite(promoNum)) {
      console.warn('[PedidoNuevo] Código de promoción no válido:', promocionId);
      this.pedidoForm.get('promocionId')?.setErrors({ invalid: true });
      return;
    }

    const lineas = items.map((item) => {
      const id = Number(item.id);
      return {
        productoId: id,
        cantidad: item.cantidad,
        tamanoPizzaId: item.tamanoPizzaId,
      };
    });

    this.enviando.set(true);
    this.aviso.set(null);

    const accionPedido: 'pedido' | 'efectivo' = metodoPago === 'Efectivo' ? 'efectivo' : 'pedido';

    this.pedidosService
      .crear({
        lineas,
        direccionId: this.direccionIdParaApi(),
        tipoEntrega,
        promocionId: promoNum,
        metodoPago,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (pedido) => {
          this.ultimoErrorAccion.set(null);
          this.carrito.vaciarCarrito();
          void this.router.navigate(['/pedidos', pedido.idPedido]);
        },
        error: (err) => {
          console.error('[PedidoNuevo] Error al crear pedido', err);
          this.ultimoErrorAccion.set(accionPedido);
          this.aviso.set('No pudimos completar tu pedido. Intentá de nuevo en un momento.');
        },
      });
  }
}
