import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto';

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
  terminoBusqueda: string = '';

  // 🔥 IDs corregidos según la base de datos
  categorias = [
    { id: 2, nombre: 'Clásicas' },
    { id: 3, nombre: 'Pizzas Especiales' },
    { id: 1, nombre: 'Bebidas' },
    { id: 4, nombre: 'Extras' }
  ];

  nuevoProducto = { 
    nombre: '', 
    descripcion: '', 
    precio: null as any, 
    fkIdCategoria: 2, // Por defecto "Clásicas"
    ingredientes: '', 
    urlImagen: '' 
  };
  
  productoEdit: any = {};

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.productos = [];
      }
    });
  }

  get totalProductos() { return this.productos ? this.productos.length : 0; }
  get totalDisponibles() { return this.productos ? this.productos.filter(p => p.activo).length : 0; }
  get totalInactivos() { return this.productos ? this.productos.filter(p => !p.activo).length : 0; }

  setFiltro(nuevoFiltro: 'Todos' | 'Disponibles' | 'Inactivos') {
    this.filtroActual = nuevoFiltro;
  }

  get productosFiltrados() {
    if (!this.productos) return [];

    let resultado = this.productos;

    if (this.filtroActual === 'Disponibles') {
      resultado = resultado.filter(p => p.activo);
    } else if (this.filtroActual === 'Inactivos') {
      resultado = resultado.filter(p => !p.activo);
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(p => {
        const nombreValido = p.nombre ? p.nombre.toLowerCase() : '';
        const descValida = p.descripcion ? p.descripcion.toLowerCase() : '';
        return nombreValido.includes(termino) || descValida.includes(termino);
      });
    }

    return resultado;
  }

  abrirProducto() { 
    const modalElement = document.getElementById('modalProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }
  
  cerrarProducto() { 
    const modalElement = document.getElementById('modalProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  abrirEditar(producto: ProductoResponseDto) {
    this.productoEdit = {
      id: producto.id,
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precioBase || 0,
      activo: producto.activo,
      // 🔥 Aseguramos que la categoría que trae se asigne, o le ponemos 2 (Clásicas) si viene null
      fkIdCategoria: producto.idCategoria || 2,
      ingredientes: '', 
      urlImagen: ''     
    };
    
    const modalElement = document.getElementById('modalEditarProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }
  
  cerrarEditar() { 
    const modalElement = document.getElementById('modalEditarProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  crearProducto() {
    // Al crear un producto, mandamos solo lo que la API espera estrictamente
    const createDto = {
      nombre: this.nuevoProducto.nombre,
      descripcion: this.nuevoProducto.descripcion,
      precio: this.nuevoProducto.precio,
      // Ignoramos fkIdCategoria, ingredientes y urlImagen por ahora
    };

    this.productoService.crearProducto(createDto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarProducto();
        this.nuevoProducto = { nombre: '', descripcion: '', precio: null as any, fkIdCategoria: 2, ingredientes: '', urlImagen: '' };
      },
      error: (err) => {
        console.error('Error al crear:', err);
        alert('Hubo un error al crear el producto. Revisa la consola para más detalles.');
      }
    });
  }

  guardarCambios() {
    // 🔥 CORRECCIÓN CLAVE: 
    // Construimos el DTO exactamente como lo espera tu backend en .NET
    const updateDto = {
      nombre: this.productoEdit.nombre,
      descripcion: this.productoEdit.descripcion,
      precio: this.productoEdit.precio,
      tipo: "Producto", // Agregamos esto si tu DTO original lo requería
      activo: this.productoEdit.activo
      // ⚠️ No enviamos fkIdCategoria ni ingredientes porque tu DTO de C# actual (UsuarioUpdateDto) 
      // parece no estar preparado para recibirlos en la ruta PUT /api/admin/productos/{id}
    };

    this.productoService.actualizarProducto(this.productoEdit.id, updateDto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarEditar();
      },
      error: (err) => {
        console.error('Error al actualizar el producto:', err);
        // Si sigue marcando 404, nos avisará en pantalla
        alert('Error 404: El servidor no pudo actualizar el producto. Verifica la ruta en el controlador de C#.');
      }
    });
  }

  eliminar(producto: ProductoResponseDto) {
    if (!confirm(`¿Eliminar el producto ${producto.nombre}? Esta acción no se puede deshacer.`)) return;
    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  desactivarProducto(producto: ProductoResponseDto) {
    this.productoService.toggleProducto(producto.id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al desactivar:', err)
    });
  }
}