import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto';
import { CloudinaryService } from '../../../core/services/cloudinary';
import { finalize, switchMap, of } from 'rxjs';
import { ConfirmService } from '../../../shared/confirm/confirm.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';

interface ProductoResponseDto {
  id: number;
  nombre: string;
  descripcion: string;
  imagenURL?: string | null;
  precioBase: number;
  activo: boolean;
  idCategoria: number;
  ingredientes?: string;
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
  private cloudinary = inject(CloudinaryService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
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

  nuevoProducto: {
    nombre: string;
    descripcion: string;
    precio: number | null;
    fkIdCategoria: number;
    ingredientes: string;
    imagenURL: string;
  } = {
    nombre: '',
    descripcion: '',
    precio: null,
    fkIdCategoria: 2,
    ingredientes: '',
    imagenURL: '',
  };
  productoEdit: any = {};
  
  // 🔥 NUEVO: Variable para recordar qué producto vamos a eliminar
  productoAEliminar: ProductoResponseDto | null = null;
  mensajeError: string = '';

  isUploadingNuevo = false;
  isUploadingEdit = false;
  private fileNuevo: File | null = null;
  private fileEdit: File | null = null;
  nuevoPreviewUrl: string | null = null;
  editPreviewUrl: string | null = null;

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

  private getModal(id: string): any {
    const el = document.getElementById(id);
    if (!el) return null;
    return new (window as any).bootstrap.Modal(el);
  }

  abrirProducto() {
    this.getModal('modalProducto')?.show();
  }
  cerrarProducto() {
    (window as any).bootstrap.Modal.getInstance(document.getElementById('modalProducto'))?.hide();
  }

  abrirEditar(producto: ProductoResponseDto) {
    this.productoEdit = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagenURL: producto.imagenURL || '',
      precio: producto.precioBase,
      activo: producto.activo,
      fkIdCategoria: producto.idCategoria || 1,
      ingredientes: producto.ingredientes || '',
    };
    this.getModal('modalEditarProducto')?.show();
  }
  cerrarEditar() { (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarProducto'))?.hide(); }

  validarDatos(producto: any, isEdit: boolean): string | null {
    if (!producto.nombre || producto.nombre.trim().length < 3) return "El nombre del producto debe tener al menos 3 caracteres.";

    const nombreExiste = this.productos.some(p =>
      p.nombre && producto.nombre &&
      p.nombre.toLowerCase().trim() === producto.nombre.toLowerCase().trim() &&
      (isEdit ? p.id !== producto.id : true)
    );
    if (nombreExiste) return "Ya existe un producto registrado con este nombre exacto.";

    if (producto.precio === null || producto.precio === undefined || Number(producto.precio) <= 0) return "El precio debe ser un número mayor a $0.00.";
    if (Number(producto.precio) > 5000) return "El precio excede el límite permitido ($5,000). Revisa si hay un error de teclado.";

    if (producto.descripcion && producto.descripcion.length > 250) return "La descripción es demasiado larga. Máximo 250 caracteres.";
    return null;
  }

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

  onFileNuevo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileNuevo = file;
    try {
      this.nuevoPreviewUrl && URL.revokeObjectURL(this.nuevoPreviewUrl);
      this.nuevoPreviewUrl = URL.createObjectURL(file);
    } catch {
      this.nuevoPreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  onFileEdit(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileEdit = file;
    try {
      this.editPreviewUrl && URL.revokeObjectURL(this.editPreviewUrl);
      this.editPreviewUrl = URL.createObjectURL(file);
    } catch {
      this.editPreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  crearProducto() {
    const error = this.validarDatos(this.nuevoProducto, false);
    if (error) { this.mostrarError(error); return; }

    const upload$ = this.fileNuevo
      ? this.cloudinary.uploadImage(this.fileNuevo, { folder: 'arcanoPizza/productos' }).pipe(
          switchMap((res) => {
            this.nuevoProducto.imagenURL = res.secure_url;
            this.toast.show('Imagen subida correctamente.', 'success');
            return of(null);
          }),
        )
      : of(null);

    this.isUploadingNuevo = true;
    upload$
      .pipe(
        switchMap(() => this.productoService.crearProducto({
          nombre: this.nuevoProducto.nombre.trim(),
          descripcion: this.nuevoProducto.descripcion,
          precio: Number(this.nuevoProducto.precio),
          fkIdCategoria: this.nuevoProducto.fkIdCategoria,
          ingredientes: this.nuevoProducto.ingredientes,
          imagenURL: this.nuevoProducto.imagenURL || null,
        })),
        finalize(() => {
          this.isUploadingNuevo = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarProducto();
          this.nuevoProducto = { nombre: '', descripcion: '', precio: null, fkIdCategoria: 2, ingredientes: '', imagenURL: '' };
          this.fileNuevo = null;
          if (this.nuevoPreviewUrl) URL.revokeObjectURL(this.nuevoPreviewUrl);
          this.nuevoPreviewUrl = null;
        },
        error: (err) => console.error('Error al crear producto:', err),
      });
  }

  guardarCambios() {
    const error = this.validarDatos(this.productoEdit, true);
    if (error) { this.mostrarError(error); return; }

    const updateDto = {
      nombre: this.productoEdit.nombre.trim(),
      descripcion: this.productoEdit.descripcion,
      precio: this.productoEdit.precio,
      activo: this.productoEdit.activo,
      fkIdCategoria: this.productoEdit.fkIdCategoria,
      ingredientes: this.productoEdit.ingredientes,
      imagenURL: this.productoEdit.imagenURL || null,
    };

    const upload$ = this.fileEdit
      ? this.cloudinary.uploadImage(this.fileEdit, { folder: 'arcanoPizza/productos' }).pipe(
          switchMap((res) => {
            this.productoEdit.imagenURL = res.secure_url;
            updateDto.imagenURL = res.secure_url;
            this.toast.show('Imagen subida correctamente.', 'success');
            return of(null);
          }),
        )
      : of(null);

    this.isUploadingEdit = true;
    upload$
      .pipe(
        switchMap(() => this.productoService.actualizarProducto(this.productoEdit.id, updateDto)),
        finalize(() => {
          this.isUploadingEdit = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarEditar();
          this.fileEdit = null;
          if (this.editPreviewUrl) URL.revokeObjectURL(this.editPreviewUrl);
          this.editPreviewUrl = null;
        },
        error: (err) => console.error('Error al guardar cambios:', err),
      });
  }

  async eliminar(producto: ProductoResponseDto) {
    const ok = await this.confirm.confirm({
      title: 'Eliminar producto',
      message: `¿Eliminar el producto "${producto.nombre}"?\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;
    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.toast.show('Eliminado correctamente.', 'success');
        this.cargarProductos();
      },
      error: (err) => console.error('Error eliminando producto:', err),
    });
  }

  desactivarProducto(producto: ProductoResponseDto) {
    this.productoService.toggleProducto(producto.id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al desactivar:', err)
    });
  }

  // ==========================================
  // 🔥 LÓGICA DEL NUEVO MODAL DE ELIMINAR
  // ==========================================
  abrirModalEliminar(producto: ProductoResponseDto) {
    this.productoAEliminar = producto;
    const modalElement = document.getElementById('modalConfirmarEliminar');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  cerrarModalEliminar() {
    this.productoAEliminar = null;
    const modalElement = document.getElementById('modalConfirmarEliminar');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  confirmarEliminacion() {
    if (!this.productoAEliminar) return;
    
    this.productoService.eliminarProducto(this.productoAEliminar.id).subscribe({
      next: () => {
        this.cargarProductos();
        this.cerrarModalEliminar();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.cerrarModalEliminar();
        alert('Hubo un error al intentar eliminar el producto.');
      }
    });
  }

  salir(): void {
    this.auth.logout();
  }
}