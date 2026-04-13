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

// Interface que coincide con el ProductoResponseDto de .NET
interface ProductoResponseDto {
  id: number;
  nombre: string;
  descripcion: string;
  imagenURL?: string | null;
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
  private cloudinary = inject(CloudinaryService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  productos: ProductoResponseDto[] = [];
  filtroActual: 'Todos' | 'Disponibles' | 'Inactivos' = 'Todos';
  
  // 🔥 NUEVA VARIABLE: Guarda lo que el usuario escribe en el buscador
  terminoBusqueda: string = '';

  nuevoProducto = { nombre: '', descripcion: '', precio: 0, imagenURL: '' };
  productoEdit: any = {};

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
        this.productos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  setFiltro(nuevoFiltro: 'Todos' | 'Disponibles' | 'Inactivos') {
    this.filtroActual = nuevoFiltro;
  }

  // 🔥 LÓGICA DE BÚSQUEDA ACTUALIZADA
  get productosFiltrados() {
    let resultado = this.productos;

    // 1. Filtrar por la tarjeta seleccionada
    if (this.filtroActual === 'Disponibles') {
      resultado = resultado.filter(p => p.activo);
    } else if (this.filtroActual === 'Inactivos') {
      resultado = resultado.filter(p => !p.activo);
    }

    // 2. Filtrar por el texto del buscador
    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        (p.descripcion && p.descripcion.toLowerCase().includes(termino))
      );
    }

    return resultado;
  }

  // ... (El resto de tus métodos de modales y CRUD se quedan igual)
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
      fkIdCategoria: producto.idCategoria || 1
    };
    this.getModal('modalEditarProducto')?.show();
  }
  cerrarEditar() { (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarProducto'))?.hide(); }

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
        switchMap(() => this.productoService.crearProducto(this.nuevoProducto)),
        finalize(() => {
          this.isUploadingNuevo = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarProducto();
          this.nuevoProducto = { nombre: '', descripcion: '', precio: 0, imagenURL: '' };
          this.fileNuevo = null;
          if (this.nuevoPreviewUrl) URL.revokeObjectURL(this.nuevoPreviewUrl);
          this.nuevoPreviewUrl = null;
        },
        error: (err) => console.error('Error al crear producto:', err),
      });
  }

  guardarCambios() {
    const updateDto = {
      nombre: this.productoEdit.nombre,
      descripcion: this.productoEdit.descripcion,
      imagenURL: this.productoEdit.imagenURL || null,
      precio: this.productoEdit.precio,
      activo: this.productoEdit.activo,
      fkIdCategoria: this.productoEdit.fkIdCategoria || 1
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
      next: () => this.cargarProductos()
    });
  }

  salir(): void {
    this.auth.logout();
  }
}