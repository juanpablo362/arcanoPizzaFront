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
  ingredientes?: string;
  imagenURL?: string;
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
    fkIdCategoria: 2, 
    ingredientes: '', 
    urlImagen: '' 
  };
  
  productoEdit: any = {};

  // 🔥 NUEVO: Variable para el mensaje de error del modal
  mensajeError: string = '';

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

  // ==========================================
  // 🔥 LÓGICA DE VALIDACIÓN (Productos)
  // ==========================================
  validarDatos(producto: any, isEdit: boolean): string | null {
    // 1. Validar Nombre (Vacío o muy corto)
    if (!producto.nombre || producto.nombre.trim().length < 3) {
      return "El nombre del producto debe tener al menos 3 caracteres.";
    }

    // 2. Validar Nombre (Duplicados en la base de datos)
    const nombreExiste = this.productos.some(p => 
      p.nombre && producto.nombre && 
      p.nombre.toLowerCase().trim() === producto.nombre.toLowerCase().trim() && 
      (isEdit ? p.id !== producto.id : true)
    );
    if (nombreExiste) {
      return "Ya existe un producto registrado con este nombre exacto.";
    }

    // 3. Validar Precio (Debe ser mayor a 0 y menor a 5000)
    if (producto.precio === null || producto.precio === undefined || producto.precio <= 0) {
      return "El precio debe ser un número mayor a $0.00.";
    }
    if (producto.precio > 5000) {
      return "El precio excede el límite permitido ($5,000). Revisa si hay un error de teclado.";
    }

    // 4. Validar URL de Imagen (Si existe, que tenga formato correcto)
    if (producto.urlImagen && producto.urlImagen.trim() !== '') {
      if (!producto.urlImagen.startsWith('http://') && !producto.urlImagen.startsWith('https://')) {
        return "La URL de la imagen debe comenzar con 'http://' o 'https://'.";
      }
    }

    // 5. Validar Descripción (No exageradamente larga)
    if (producto.descripcion && producto.descripcion.length > 250) {
      return "La descripción es demasiado larga. Máximo 250 caracteres.";
    }

    return null; // Todo correcto
  }

  // Métodos del Modal de Error
  mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    const modalElement = document.getElementById('modalErrorProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  cerrarError() {
    const modalElement = document.getElementById('modalErrorProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  // ==========================================
  // MODALES PRINCIPALES Y CRUD
  // ==========================================
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
      fkIdCategoria: producto.idCategoria || 2,
      ingredientes: producto.ingredientes || '', 
      urlImagen: producto.imagenURL || ''     
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
    // 🔥 Validamos antes de enviar al servidor
    const error = this.validarDatos(this.nuevoProducto, false);
    if (error) {
      this.mostrarError(error);
      return; 
    }

    const createDto = {
      nombre: this.nuevoProducto.nombre.trim(),
      descripcion: this.nuevoProducto.descripcion,
      precio: this.nuevoProducto.precio,
      fkIdCategoria: this.nuevoProducto.fkIdCategoria,
      ingredientes: this.nuevoProducto.ingredientes,
      imagenURL: this.nuevoProducto.urlImagen
    };

    this.productoService.crearProducto(createDto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarProducto();
        this.nuevoProducto = { nombre: '', descripcion: '', precio: null as any, fkIdCategoria: 2, ingredientes: '', urlImagen: '' };
      },
      error: (err) => {
        console.error('Error al crear:', err);
        alert('Hubo un error interno al crear el producto.');
      }
    });
  }

  guardarCambios() {
    // 🔥 Validamos antes de enviar al servidor
    const error = this.validarDatos(this.productoEdit, true);
    if (error) {
      this.mostrarError(error);
      return; 
    }

    const updateDto = {
      nombre: this.productoEdit.nombre.trim(),
      descripcion: this.productoEdit.descripcion,
      precio: this.productoEdit.precio,
      activo: this.productoEdit.activo,
      fkIdCategoria: this.productoEdit.fkIdCategoria,
      ingredientes: this.productoEdit.ingredientes,
      imagenURL: this.productoEdit.urlImagen
    };

    this.productoService.actualizarProducto(this.productoEdit.id, updateDto).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarEditar();
      },
      error: (err) => {
        console.error('Error al actualizar el producto:', err);
        alert('Hubo un error interno al guardar los cambios.');
      }
    });
  }

  eliminar(producto: ProductoResponseDto) {
    // 👇 Esta es la línea que hace que aparezca esa ventana negra
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