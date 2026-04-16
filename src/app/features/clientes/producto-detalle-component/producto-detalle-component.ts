import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarritoService, ItemCarrito } from '../carrito-compra-component/carrito-compra.service';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../shared/toast/toast.service';
import { savePostLoginPayload } from '../../../core/auth/post-login-redirect';
import type { TamanoPizzaOpcion } from '../../../shared/models/tamano-pizza';
import { enriquecerProductoConTamanos } from '../../../shared/models/tamano-pizza';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ClienteTopNavComponent],
  templateUrl: './producto-detalle-component.html',
  styleUrls: ['./producto-detalle-component.css']
})
export class ProductoDetalleComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private carritoService = inject(CarritoService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  producto: any = null;
  selectedSize: TamanoPizzaOpcion | null = null;
  quantity: number = 1;
  mostrarToast: boolean = false;
  
  private toastTimeoutId: any;

  ngOnInit(): void {
    this.producto = history.state.producto;

    if (!this.producto) {
      this.router.navigate(['/menu']);
      return;
    }

    this.producto = enriquecerProductoConTamanos(this.producto);

    // Parseo seguro de ingredientes
    if (typeof this.producto.ingredientes === 'string') {
      this.producto.ingredientes = this.producto.ingredientes.split(',').map((i: string) => i.trim());
    }

    if (this.producto.tamanos?.length > 0) {
      this.selectedSize = this.producto.tamanos[0];
    }
  }

  ngOnDestroy(): void {
    // Limpieza del timeout para evitar memory leaks
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  selectSize(size: TamanoPizzaOpcion): void {
    this.selectedSize = size;
  }

  increaseQuantity(): void { 
    this.quantity++; 
  }

  decreaseQuantity(): void { 
    if (this.quantity > 1) this.quantity--; 
  }

  get total(): number {
    const precioBase = this.selectedSize ? this.selectedSize.price : (this.producto.precioBase || this.producto.precio);
    return precioBase * this.quantity;
  }
  
  agregarAlCarrito(): void {
    if (!this.auth.isAuthenticated()) {
      savePostLoginPayload({
        path: '/producto',
        state: { producto: this.producto },
      });
      this.toast.show('Iniciá sesión para agregar productos al carrito.', 'info');
      void this.router.navigate(['/auth'], { queryParams: { returnUrl: '/producto' } });
      return;
    }

    const precioFinal = this.selectedSize
      ? this.selectedSize.price
      : this.producto.precioBase || this.producto.precio;
    const nombreFinal = this.selectedSize
      ? `${this.producto.nombre} (${this.selectedSize.name})`
      : this.producto.nombre;
    const idLimpio = this.producto.idProducto || this.producto.id;
    const tamanoPizzaId = this.selectedSize?.tamanoPizzaId ?? null;
    const lineKey = `${idLimpio}__${tamanoPizzaId === null ? 'sintamano' : tamanoPizzaId}`;

    const nuevoPedido: ItemCarrito = {
      lineKey,
      id: idLimpio,
      tamanoPizzaId,
      nombre: nombreFinal,
      precio: precioFinal,
      cantidad: this.quantity,
      imagen: this.producto.imagenURL || this.producto.imagen,
    };

    this.carritoService.agregarAlCarrito(nuevoPedido);
    this.mostrarMensajeExito();
  }

  private mostrarMensajeExito(): void {
    this.mostrarToast = true;
    this.toastTimeoutId = setTimeout(() => {
      this.mostrarToast = false;
      this.router.navigate(['/menu']);
    }, 1500);
  }

  regresar(): void {
    this.location.back();
  }
}