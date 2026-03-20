import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../carrito-compra-component/carrito-compra.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto-detalle-component.html',
  styleUrls: ['./producto-detalle-component.css']
})
export class ProductoDetalleComponent implements OnInit {

  private router = inject(Router);
  private carritoService = inject(CarritoService);

  producto: any = null;
  selectedSize: any = null;
  quantity: number = 1;

  ngOnInit() {
    this.producto = history.state.producto;

    if (!this.producto) {
      this.router.navigate(['/menu-clientes-component']);
      return;
    }

    if (this.producto.tamanos && this.producto.tamanos.length > 0) {
      this.selectedSize = this.producto.tamanos[0];
    }
  }

  selectSize(size: any) { this.selectedSize = size; }
  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  get total(): number {
    const precioBase = this.selectedSize ? this.selectedSize.price : this.producto.precio;
    return precioBase * this.quantity;
  }
  
  agregarAlCarrito() {
    const precioFinal = this.selectedSize ? this.selectedSize.price : this.producto.precio;
    const nombreFinal = this.selectedSize ? `${this.producto.nombre} (${this.selectedSize.name})` : this.producto.nombre;

    const nuevoPedido: ItemCarrito = {
      id: `${this.producto.id}-${this.selectedSize ? this.selectedSize.name : 'unico'}`,
      nombre: nombreFinal,
      precio: precioFinal,
      cantidad: this.quantity,
      imagen: this.producto.imagen
    };

    // Solo lo enviamos a la memoria global y listo. Sin alertas, sin cambiar de pantalla.
    this.carritoService.agregarAlCarrito(nuevoPedido);
    // Después de agregar, regresamos al menú de clientes.
    this.router.navigate(['/menu-clientes-component']);
  }
}