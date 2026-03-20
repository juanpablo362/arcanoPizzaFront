import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CarritoService } from '../carrito-compra-component/carrito-compra.service';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  ingredientes: string[];
  tamanos?: { name: string; cm: string; price: number }[];
}

@Component({
  selector: 'app-menu-clientes-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './menu-clientes-component.html',
  styleUrl: './menu-clientes-component.css',
})
export class MenuClientesComponent {
  private router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly carritoService = inject(CarritoService);

  readonly isLoggedIn = computed(() => this.auth.isAuthenticated());

  categorias: string[] = ['Pizza Clásica', 'Pizza Especiales', 'Bebidas', 'Extras'];
  categoriaActiva: string = 'Pizza Clásica';

  tamanosPizza = [
    { name: 'Individual', cm: '30 cm', price: 70 },
    { name: 'Mediana', cm: '35 cm', price: 90 },
    { name: 'Grande', cm: '40 cm', price: 120 }
  ];

  todosLosProductos: Producto[] = [
    { id: 1, nombre: 'Conjuntos de cuatro lunas', descripcion: 'Mozzarella, gorgonzola, parmesano envejecido, provolone.', precio: 120.00, imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Pizza Clásica', ingredientes: ['Mozzarella', 'Gorgonzola', 'Parmesano', 'Provolone', 'Masa clásica'], tamanos: this.tamanosPizza },
    { id: 2, nombre: 'Ritual de fuego', descripcion: 'Pepperoni premium ahumado, mozzarella, salsa de tomate especiada.', precio: 120.00, imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Pizza Clásica', ingredientes: ['Pepperoni ahumado', 'Mozzarella', 'Salsa especiada'], tamanos: this.tamanosPizza },
    { id: 3, nombre: 'Hawaiana Tradicional', descripcion: 'Doble porción de jamón horneado, piña dulce y extra queso.', precio: 115.00, imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Pizza Clásica', ingredientes: ['Jamón horneado', 'Piña dulce', 'Mozzarella', 'Masa clásica'], tamanos: this.tamanosPizza },
    { id: 4, nombre: 'Carnívora Extrema', descripcion: 'Salami, tocino crujiente, pepperoni, jamón y salchicha italiana.', precio: 165.00, imagen: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Pizza Especiales', ingredientes: ['Salami', 'Tocino', 'Pepperoni', 'Jamón', 'Salchicha italiana', 'Mozzarella'], tamanos: this.tamanosPizza },
    { id: 5, nombre: 'Vegetariana Suprema', descripcion: 'Champiñones, pimientos, cebolla morada, aceitunas negras y espinaca fresca.', precio: 145.00, imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Pizza Especiales', ingredientes: ['Champiñones', 'Pimientos', 'Cebolla morada', 'Aceitunas negras', 'Espinaca'], tamanos: this.tamanosPizza },
    { id: 6, nombre: 'Refresco Cola 600ml', descripcion: 'Refresco de cola regular bien frío en envase PET.', precio: 35.00, imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Bebidas', ingredientes: ['Refresco de cola oscuro'] },
    { id: 7, nombre: 'Agua de Jamaica', descripcion: 'Agua fresca natural endulzada, vaso de 500ml.', precio: 25.00, imagen: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Bebidas', ingredientes: ['Flor de Jamaica', 'Agua purificada', 'Azúcar'] },
    { id: 8, nombre: 'Cerveza Artesanal', descripcion: 'Cerveza clara u oscura de barril 355ml.', precio: 55.00, imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Bebidas', ingredientes: ['Cerveza de barril seleccionada'] },
    { id: 9, nombre: 'Papas Gajo', descripcion: 'Porción de 250g de papas condimentadas con aderezo a elegir.', precio: 65.00, imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', categoria: 'Extras', ingredientes: ['Papas de corte grueso', 'Pimentón', 'Sal con ajo', 'Aceite vegetal'] },
    { id: 10, nombre: 'Alitas BBQ', descripcion: '6 piezas de alitas de pollo bañadas en salsa BBQ dulce y un toque picante.', precio: 110.00, imagen: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80', categoria: 'Extras', ingredientes: ['Alitas de pollo', 'Salsa BBQ especial', 'Especias', 'Ajonjolí'] }
  ];

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
  }

  get productosFiltrados(): Producto[] {
    return this.todosLosProductos.filter(producto => producto.categoria === this.categoriaActiva);
  }

  abrirDetalle(productoSeleccionado: Producto) {
    this.router.navigate(['/producto-detalle'], { state: { producto: productoSeleccionado } });
  }

  logout(): void {
    this.auth.logout();
  }

  carritoCantidad(): number {
    return this.carritoService.obtenerCarrito().reduce(
      (acc, item) => acc + item.cantidad,
      0,
    );
  }
}