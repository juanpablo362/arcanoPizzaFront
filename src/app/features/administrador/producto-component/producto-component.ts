import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto';

// Interface que coincide con el ProductoResponseDto de .NET
interface ProductoResponseDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  activo: boolean;
  idCategoria: number;
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
  private cdr = inject(ChangeDetectorRef);

  productos: ProductoResponseDto[] = [];
  filtroActual: 'Todos' | 'Disponibles' | 'Inactivos' = 'Todos';

  nuevoProducto = { nombre: '', descripcion: '', precio: 0 };
  productoEdit: any = {};

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  setFiltro(nuevoFiltro: 'Todos' | 'Disponibles' | 'Inactivos') {
    this.filtroActual = nuevoFiltro;
  }

  get productosFiltrados() {
    if (this.filtroActual === 'Todos') return this.productos;
    if (this.filtroActual === 'Disponibles') return this.productos.filter(p => p.activo);
    return this.productos.filter(p => !p.activo);
  }

  abrirProducto() { new (window as any).bootstrap.Modal(document.getElementById('modalProducto')).show(); }
  cerrarProducto() { (window as any).bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide(); }

  abrirEditar(producto: ProductoResponseDto) {
    this.productoEdit = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precioBase,
      activo: producto.activo,
      fkIdCategoria: producto.idCategoria || 1
    };
    new (window as any).bootstrap.Modal(document.getElementById('modalEditarProducto')).show();
  }
  cerrarEditar() { (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarProducto')).hide(); }

  crearProducto() {
    this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarProducto();
        this.nuevoProducto = { nombre: '', descripcion: '', precio: 0 };
      }
    });
  }

  guardarCambios() {
    const updateDto = {
      nombre: this.productoEdit.nombre,
      descripcion: this.productoEdit.descripcion,
      precio: this.productoEdit.precio,
      activo: this.productoEdit.activo,
      fkIdCategoria: this.productoEdit.fkIdCategoria || 1
    };

    this.productoService.actualizarProducto(this.productoEdit.id, updateDto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarEditar();
      }
    });
  }

  eliminar(producto: ProductoResponseDto) {
    if (!confirm(`¿Eliminar el producto ${producto.nombre}? Esta acción no se puede deshacer.`)) return;
    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => this.cargarProductos()
    });
  }

  desactivarProducto(producto: ProductoResponseDto) {
    this.productoService.toggleProducto(producto.id).subscribe({
      next: () => this.cargarProductos()
    });
  }
}