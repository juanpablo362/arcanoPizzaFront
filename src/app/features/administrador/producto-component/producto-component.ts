import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Producto {
  nombre: string;
  categoria: string;
  descripcion: string;
  ingredientes: string;
  precio: number;
  disponible: boolean;
  imagen: string;
}

@Component({
  selector: 'app-producto-component',
 standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './producto-component.html',
  styleUrls: ['./producto-component.css'],
})
export class ProductoComponent {
  usuario = 'Juan Mendoza';

  totalProductos = 5;
  productosDisponibles = 4;
  productosNoDisponibles = 1;

  categorias = ['Todo', 'Clásicas', 'Especiales', 'Bebidas', 'Extras'];
  categoriaSeleccionada = 'Todo';

  productos: Producto[] = [
    {
      nombre: 'Pepperoni Clásica',
      categoria: 'Clásicas',
      descripcion: 'Salsa de tomate, mozzarella y generosas rodajas de pepperoni',
      ingredientes: 'Salsa de tomate, Mozzarella, Pepperoni',
      precio: 12.99,
      disponible: true,
      imagen: 'https://via.placeholder.com/80',
    },
    {
      nombre: 'Pepperoni Clásica',
      categoria: 'Clásicas',
      descripcion: 'Salsa de tomate, mozzarella y generosas rodajas de pepperoni',
      ingredientes: 'Salsa de tomate, Mozzarella, Pepperoni',
      precio: 12.99,
      disponible: true,
      imagen: 'https://via.placeholder.com/80',
    },
  ];

  get productosFiltrados() {
    if (this.categoriaSeleccionada === 'Todo') return this.productos;
    return this.productos.filter(p => p.categoria === this.categoriaSeleccionada);
  }

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
  }

  editar(producto: Producto) { console.log('Editar', producto); }
  eliminar(producto: Producto) { console.log('Eliminar', producto); }
  ocultar(producto: Producto) { console.log('Ocultar', producto); }
}