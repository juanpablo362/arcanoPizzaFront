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
import { CarritoService } from '../../clientes/carrito-compra-component/carrito-compra.service';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';
import { DireccionesService } from '../../../core/services/direcciones.service';
import type { Direccion } from '../../../shared/models/pedido.model';
import { PedidosService } from '../pedidos.service';

@Component({
  selector: 'app-pedido-nuevo',
  standalone: true,
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
  protected readonly carritoVacioBloqueo = signal(false);
  protected readonly aviso = signal<string | null>(null);
  protected readonly checkoutConTarjeta = signal(false);
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
          this.direcciones.set([]);
          this.cargandoDatos.set(false);
        },
      });
    });
  }

  private direccionIdParaApi(): number | null {
    const { tipoEntrega, direccionId } = this.pedidoForm.getRawValue();
    if (tipoEntrega === 'Recoger') {
      const id = Number(direccionId);
      return id >= 1 ? id : null;
    }
    return Number(direccionId);
  }

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
      error: () => this.aviso.set('No pudimos guardar la dirección.'),
    });
  }

  // ==========================================
  // 🔥 MÉTODO CORREGIDO PARA STRIPE
  // ==========================================
  protected iniciarPagoStripe(): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }
    
    const itemsRaw = this.carrito.obtenerCarrito();
    if (itemsRaw.length === 0) {
      this.aviso.set('Tu carrito está vacío.');
      return;
    }

    // Mapeamos los productos para incluir precio y tamaño real
    const itemsStripe = itemsRaw.map(item => ({
      productoId: Number(item.id),
      cantidad: item.cantidad,
      tamanoPizzaId: item.tamanoPizzaId,
      precio: item.precio // <-- Crucial para que Stripe no use el precio base
    }));

    const { tipoEntrega, promocionId } = this.pedidoForm.getRawValue();
    const promoNum = promocionId.trim() === '' ? null : Number(promocionId);

    this.enviando.set(true);
    this.aviso.set(null);

    this.carrito
      .crearSesionStripe$({
        items: itemsStripe, // <-- Ahora sí enviamos los productos
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
          console.error('[PedidoNuevo] Error Stripe', err);
          this.aviso.set('No pudimos iniciar el pago con tarjeta.');
        },
      });
  }

  protected confirmarPedido(): void {
    const { metodoPago } = this.pedidoForm.getRawValue();
    this.enviarPedidoSinStripe(metodoPago.trim() || 'Efectivo');
  }

  protected confirmarPagoEfectivo(): void {
    this.enviarPedidoSinStripe('Efectivo');
  }

  private enviarPedidoSinStripe(metodoPago: string | null): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }
    const items = this.carrito.obtenerCarrito();
    if (items.length === 0) return;

    const { tipoEntrega, promocionId } = this.pedidoForm.getRawValue();
    const promoNum = promocionId.trim() === '' ? null : Number(promocionId);

    const lineas = items.map((item) => ({
      productoId: Number(item.id),
      cantidad: item.cantidad,
      tamanoPizzaId: item.tamanoPizzaId,
    }));

    this.enviando.set(true);
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
          this.carrito.vaciarCarrito();
          void this.router.navigate(['/pedidos', pedido.idPedido]);
        },
        error: () => this.aviso.set('Error al crear el pedido.'),
      });
  }
}