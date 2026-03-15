import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrito-compra-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito-compra-component.html',
  styleUrl: './carrito-compra-component.css',
})

export class CarritoCompraComponent implements OnInit {
  
  // ¡Ahora con imágenes reales para probar!
  carritoItems = [
    { id: 1, nombre: 'El Oráculo Blanco', precio: 70.00, cantidad: 1, imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' },
    { id: 2, nombre: 'Ritual Familiar', precio: 120.00, cantidad: 1, imagen: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=200&q=80' },
    { id: 3, nombre: 'Poción de Queso', precio: 55.00, cantidad: 1, imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80' },
    { id: 4, nombre: 'Hechizo de Pepperoni', precio: 85.00, cantidad: 1, imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=200&q=80' }
  ];

  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  ngOnInit() {
    this.calcularTotales();
  }

  aumentarCantidad(item: any) {
    item.cantidad++;
    this.calcularTotales();
  }

  disminuirCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.calcularTotales();
    }
  }

  eliminarProducto(id: number) {
    this.carritoItems = this.carritoItems.filter(item => item.id !== id);
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.carritoItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }
}