import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { ProductoService } from '../../../core/services/producto';

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
export class ProductoComponent implements OnInit {

 private productoService = inject(ProductoService);
  private router = inject(Router);

  usuario = 'Administrador'; // 🔥 FIX

  productos: any[] = [];

 nuevoProducto = {
  nombre: '',
  descripcion: '',
  precio: 0,
  ingredientes: '',
  imagen: ''
};

  ngOnInit() {
    this.cargarProductos();

    // 🔥 recarga automática
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarProductos();
      });
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe(data => {
      this.productos = data;
    });
  }

  abrirProducto() {
    new (window as any).bootstrap.Modal(document.getElementById('modalProducto')).show();
  }

  cerrarProducto() {
    (window as any).bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
  }

  crearProducto() {
    this.productoService.crearProducto(this.nuevoProducto).subscribe(() => {
      this.cargarProductos();
      this.cerrarProducto();
    });
  }

  eliminar(producto: any) {
    if (!confirm('¿Eliminar producto?')) return;

    this.productoService.eliminarProducto(producto.idProducto).subscribe(() => {
      this.cargarProductos();
    });
  }
}