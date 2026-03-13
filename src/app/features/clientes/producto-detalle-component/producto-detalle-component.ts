import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule], // Quité RouterLink porque usamos (click)="irAlMenu()"
  templateUrl: './producto-detalle-component.html', 
  styleUrls: ['./producto-detalle-component.css'] 
})
export class ProductoDetalleComponent implements OnInit {
  
  private router = inject(Router);

  producto: any = null; // Guardará el producto recibido
  selectedSize: any = null; 
  quantity: number = 1;

  ngOnInit() {
    // 1. Recibimos el producto desde la vista anterior
    this.producto = history.state.producto;

    // 2. Seguridad: Si el usuario recarga la página de golpe, lo regresamos al menú
    if (!this.producto) {
      this.router.navigate(['/menu-clientes-component']);
      return;
    }

    // 3. Si el producto tiene tamaños (es pizza), pre-seleccionamos el primero (Individual)
    if (this.producto.tamanos && this.producto.tamanos.length > 0) {
      this.selectedSize = this.producto.tamanos[0];
    }
  }

  selectSize(size: any) {
    this.selectedSize = size;
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get total(): number {
    // Si tiene un tamaño seleccionado, usa su precio. Si no (bebidas), usa el precio normal.
    const precioBase = this.selectedSize ? this.selectedSize.price : this.producto.precio;
    return precioBase * this.quantity;
  }

  irAlMenu() {
    this.router.navigate(['/menu-clientes-component']);
  }
}