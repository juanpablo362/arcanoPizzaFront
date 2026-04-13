import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

import { ProductoService } from '../../../core/services/producto.service';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';
import { Producto } from '../../../shared/models/producto.model';
import { ArcanoLoader } from '../../../shared/arcano-loader/arcano-loader';


@Component({
  selector: 'app-menu-clientes-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ClienteTopNavComponent, ArcanoLoader],
  templateUrl: './menu-clientes-component.html',
  styleUrl: './menu-clientes-component.css',
})


export class MenuClientesComponent implements OnInit {
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  categorias: string[] = [];
  categoriaActiva: string = '';
  todosLosProductos: Producto[] = [];

  // 👉 Bandera maestra para saber si estamos esperando datos
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarProductos();
  }

  get productosFiltrados(): Producto[] {
    if (!this.categoriaActiva || this.todosLosProductos.length === 0) {
      return [];
    }
    return this.todosLosProductos.filter(p =>
      p.categoriaNombre.trim().toLowerCase() === this.categoriaActiva.trim().toLowerCase()
    );
  }

  cargarProductos() {
    this.cargando = true;

    this.productoService.obtenerTodos().subscribe({
      next: (datosDeLaAPI) => {
        this.todosLosProductos = datosDeLaAPI;

        // 1. Extraemos las categorías únicas
        const categoriasUnicas = new Set(datosDeLaAPI.map(p => p.categoriaNombre.trim()));
        const listaCategorias = Array.from(categoriasUnicas);

        // 2. DEFINIMOS TU ORDEN PERSONALIZADO
        const ordenDeseado = ['Pizzas Clásica', 'Pizzas especiales', 'Bebidas', 'Extras'];

        // 3. ORDENAMOS la lista basándonos en el orden deseado
        this.categorias = listaCategorias.sort((a, b) => {
          return ordenDeseado.indexOf(a) - ordenDeseado.indexOf(b);
        });

        setTimeout(() => {
          if (this.categorias.length > 0) {
            // Esto hará que al cargar, lo primero seleccionado sea "Pizzas"
            this.categoriaActiva = this.categorias[0];
          }
          this.cargando = false;
          this.cdr.detectChanges();
        }, 100);
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
  }

  abrirDetalle(productoSeleccionado: Producto) {
    this.router.navigate(['/producto-detalle'], { state: { producto: productoSeleccionado } });
  }
}