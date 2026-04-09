import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  // 🔥 Nombre usuario para header
  usuario = 'Juan Mendoza';

  private productoService = inject(ProductoService);

  productos: any[] = [];

  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: 0
  };

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos()
      .subscribe((data: any[]) => {
        this.productos = data;
      });
  }

  abrirProducto() {
    new (window as any).bootstrap.Modal(
      document.getElementById('modalProducto')
    ).show();
  }

  cerrarProducto() {
    (window as any).bootstrap.Modal
      .getInstance(document.getElementById('modalProducto'))
      .hide();
  }

  crearProducto() {
    this.productoService.crearProducto(this.nuevoProducto)
      .subscribe(() => {
        this.cargarProductos();
        this.cerrarProducto();
      });
  }

  eliminar(producto: any) {
    this.productoService.eliminarProducto(producto.idProducto)
      .subscribe(() => {
        this.cargarProductos();
      });
  }
}