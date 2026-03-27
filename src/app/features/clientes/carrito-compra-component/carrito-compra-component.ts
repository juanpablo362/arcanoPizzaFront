import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarritoService, ItemCarrito } from './carrito-compra.service';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';

@Component({
  selector: 'app-carrito-compra-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ClienteTopNavComponent],
  templateUrl: './carrito-compra-component.html',
  styleUrl: './carrito-compra-component.css',
})
export class CarritoCompraComponent implements OnInit {
  private readonly carritoService = inject(CarritoService);
  private readonly router = inject(Router);

  carritoItems: ItemCarrito[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  ngOnInit() {
    this.carritoItems = this.carritoService.obtenerCarrito();
    this.calcularTotales();
  }

  aumentarCantidad(item: ItemCarrito) {
    item.cantidad++;
    this.calcularTotales();
  }

  disminuirCantidad(item: ItemCarrito) {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.calcularTotales();
    }
  }

  eliminarProducto(lineKey: string) {
    this.carritoService.eliminarItem(lineKey);
    this.carritoItems = this.carritoService.obtenerCarrito();
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.carritoItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }

  irAlPago() {
    void this.router.navigate(['/pedidos/nuevo'], {
      queryParams: { pago: 'stripe' },
    });
  }
}