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

    // 👻 EXORCIZANDO A LA MOZZARELLA 👻
    // Si los ingredientes vienen como texto, los partimos por la coma para hacer una lista real
    if (typeof this.producto.ingredientes === 'string') {
      this.producto.ingredientes = this.producto.ingredientes.split(',');
    }

    if (this.producto.tamanos && this.producto.tamanos.length > 0) {
      this.selectedSize = this.producto.tamanos[0];
    }
  }

  selectSize(size: any) { this.selectedSize = size; }
  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  get total(): number {
    // Usamos precioBase si no hay precio de tamaño
    const precioBase = this.selectedSize ? this.selectedSize.price : (this.producto.precioBase || this.producto.precio);
    return precioBase * this.quantity;
  }
  
  agregarAlCarrito() {
    const precioFinal = this.selectedSize ? this.selectedSize.price : (this.producto.precioBase || this.producto.precio);
    const nombreFinal = this.selectedSize ? `${this.producto.nombre} (${this.selectedSize.name})` : this.producto.nombre;

    // 🕵️‍♂️ SOLUCIÓN DEL NaN 🕵️‍♂️
    // Rescatamos el número puro, sin textos extra.
    const idLimpio = this.producto.idProducto || this.producto.id;

    const nuevoPedido: ItemCarrito = {
      id: idLimpio, // 👈 Ahora viaja como un número puro (ej. 5)
      nombre: nombreFinal,
      precio: precioFinal,
      cantidad: this.quantity,
      imagen: this.producto.imagenURL || this.producto.imagen
    };

    // Solo lo enviamos a la memoria global
    this.carritoService.agregarAlCarrito(nuevoPedido);
    
    // (Opcional) Un mensajito para saber que sí funcionó
    alert('¡Pizza agregada al carrito con éxito!'); 
  }
}