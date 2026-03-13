import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


// Definimos la estructura de nuestros productos
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
}


@Component({
  selector: 'app-menu-clientes-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-clientes-component.html',
  styleUrl: './menu-clientes-component.css',
})

export class MenuClientesComponent {
  private router = inject(Router);

  // Las opciones del menú
  categorias: string[] = ['Pizza Clásica', 'Pizza Especiales', 'Bebidas', 'Extras'];
  
  // Categoría que aparece marcada por defecto
  categoriaActiva: string = 'Pizza Clásica';

  // AQUÍ ESTÁN TUS PIZZAS (Pasadas a base de datos)
  todosLosProductos: Producto[] = [
    // --- PIZZAS CLÁSICAS ---
    {
      id: 1,
      nombre: 'Conjuntos de cuatro lunas',
      descripcion: 'Mozzarella, gorgonzola, parmesano envejecido, provolone.',
      precio: 120.00,
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Pizza Clásica'
    },
    {
      id: 2,
      nombre: 'Ritual de fuego',
      descripcion: 'Pepperoni premium ahumado, mozzarella, salsa de tomate especiada.',
      precio: 120.00,
      imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Pizza Clásica'
    },
    {
      id: 3,
      nombre: 'Hawaiana Tradicional',
      descripcion: 'Doble porción de jamón horneado, piña dulce y extra queso.',
      precio: 115.00,
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Pizza Clásica'
    },

    // --- PIZZAS ESPECIALES ---
    {
      id: 4,
      nombre: 'Carnívora Extrema',
      descripcion: 'Salami, tocino crujiente, pepperoni, jamón y salchicha italiana.',
      precio: 165.00,
      imagen: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Pizza Especiales'
    },
    {
      id: 5,
      nombre: 'Vegetariana Suprema',
      descripcion: 'Champiñones, pimientos, cebolla morada, aceitunas negras y espinaca fresca.',
      precio: 145.00,
      imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Pizza Especiales'
    },

    // --- BEBIDAS ---
    {
      id: 6,
      nombre: 'Refresco Cola 600ml',
      descripcion: 'Refresco de cola regular bien frío en envase PET.',
      precio: 35.00,
      imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Bebidas'
    },
    {
      id: 7,
      nombre: 'Agua de Jamaica',
      descripcion: 'Agua fresca natural endulzada, vaso de 500ml.',
      precio: 25.00,
      imagen: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Bebidas'
    },
    {
      id: 8,
      nombre: 'Cerveza Artesanal',
      descripcion: 'Cerveza clara u oscura de barril 355ml.',
      precio: 55.00,
      imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Bebidas'
    },

    // --- EXTRAS ---
    {
      id: 9,
      nombre: 'Papas Gajo',
      descripcion: 'Porción de 250g de papas condimentadas con aderezo a elegir.',
      precio: 65.00,
      imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      categoria: 'Extras'
    },
    {
      id: 10,
      nombre: 'Alitas BBQ',
      descripcion: '6 piezas de alitas de pollo bañadas en salsa BBQ dulce y un toque picante.',
      precio: 110.00,
      imagen: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80',
      categoria: 'Extras'
    }
  ];

  // Función que cambia el color del botón
  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
  }

  // Función que decide qué pizzas mostrar en la pantalla
  get productosFiltrados(): Producto[] {
    return this.todosLosProductos.filter(producto => producto.categoria === this.categoriaActiva);
  }

  // Redirige a tu vista de detalles
  abrirDetalle() {
    this.router.navigate(['/producto-detalle']);
  }
}