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
  private cdr = inject(ChangeDetectorRef); // 🔥 Previene el bug de renderizado

  productos: ProductoResponseDto[] = [];

  // Coincide exactamente con ProductoAdminDto (Para crear)
  nuevoProducto = { nombre: '', descripcion: '', precio: 0 };

  // Para editar un producto existente (ProductoUpdateDto)
  productoEdit: any = {};

  ngOnInit() {
    this.cargarProductos();
  }

  // ===== LECTURA =====
  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cdr.detectChanges(); // 🔥 Forzamos la actualización visual
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  // ===== MODALES =====
  abrirProducto() {
    new (window as any).bootstrap.Modal(document.getElementById('modalProducto')).show();
  }
  
  cerrarProducto() {
    (window as any).bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
  }

  abrirEditar(producto: ProductoResponseDto) {
    // Transformamos los datos de lectura al formato que pide el DTO de actualización
    this.productoEdit = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precioBase, // El backend lo espera como 'precio'
      activo: producto.activo,
      fkIdCategoria: producto.idCategoria || 1
    };
    new (window as any).bootstrap.Modal(document.getElementById('modalEditarProducto')).show();
  }

  cerrarEditar() {
    (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarProducto')).hide();
  }

  // ===== CRUD CONECTADO A LA API =====
  crearProducto() {
    this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarProducto();
        // Limpiamos el formulario
        this.nuevoProducto = { nombre: '', descripcion: '', precio: 0 };
      }
    });
  }

  guardarCambios() {
    // Armamos el objeto exacto para el ProductoUpdateDto
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