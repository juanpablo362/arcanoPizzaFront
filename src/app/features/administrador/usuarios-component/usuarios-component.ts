import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { UsuarioService } from '../../../core/services/usuario';
import { AuthService } from '../../../core/services/auth';
import { ConfirmService } from '../../../shared/confirm/confirm.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ThemeService } from '../../../core/services/theme';

interface UsuarioResponseDto {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  activo: boolean;
  fechaMiembro: string;
}

@Component({
  selector: 'app-usuarios-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios-component.html',
  styleUrls: ['./usuarios-component.css'],
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: UsuarioResponseDto[] = [];
  filtroActual: 'Todos' | 'Empleado' | 'Repartidor' | 'Administrador' | 'Activos' = 'Todos';
  terminoBusqueda: string = '';

  nuevoUsuario = { nombre: '', email: '', telefono: '', tipo: 'Empleado', contrasena: '' };
  usuarioEdit: any = {};

  // Variable para el mensaje de error del modal
  mensajeError: string = '';

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.usuarios = [];
      }
    });
  }

  get totalUsuarios() {
    return this.usuarios
      ? this.usuarios.filter(u => u.tipo === 'Empleado' || u.tipo === 'Repartidor' || u.tipo === 'Administrador').length
      : 0;
  }
  get totalEmpleados() { return this.usuarios ? this.usuarios.filter(u => u.tipo === 'Empleado').length : 0; }
  get totalRepartidores() { return this.usuarios ? this.usuarios.filter(u => u.tipo === 'Repartidor').length : 0; }
  get totalAdministradores() { return this.usuarios ? this.usuarios.filter(u => u.tipo === 'Administrador').length : 0; }
  get totalActivos() {
    return this.usuarios
      ? this.usuarios.filter(u => u.activo && (u.tipo === 'Empleado' || u.tipo === 'Repartidor' || u.tipo === 'Administrador')).length
      : 0;
  }

  setFiltro(nuevoFiltro: 'Todos' | 'Empleado' | 'Repartidor' | 'Administrador' | 'Activos') {
    this.filtroActual = nuevoFiltro;
  }

  usuariosFiltrados() {
    if (!this.usuarios) return [];
    let resultado = this.usuarios;

    if (this.filtroActual === 'Todos') {
      resultado = resultado.filter(u => u.tipo === 'Empleado' || u.tipo === 'Repartidor' || u.tipo === 'Administrador');
    } else if (this.filtroActual === 'Activos') {
      resultado = resultado.filter(u => u.activo && (u.tipo === 'Empleado' || u.tipo === 'Repartidor' || u.tipo === 'Administrador'));
    } else {
      resultado = resultado.filter(u => u.tipo === this.filtroActual);
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      resultado = this.usuarios.filter(u => 
        (u.nombre && u.nombre.toLowerCase().includes(termino)) || 
        (u.email && u.email.toLowerCase().includes(termino)) || 
        (u.telefono && u.telefono.includes(termino))
      );
    }
    return resultado;
  }

  // ==========================================
  // 🔥 LÓGICA DE VALIDACIÓN (Nuevo y Editar)
  // ==========================================
  validarDatos(usuario: any, isEdit: boolean): string | null {
    // 1. Validar Teléfono (Solo números)
    const regexNumeros = /^[0-9]+$/;
    if (!usuario.telefono || !regexNumeros.test(usuario.telefono)) {
      return "Por favor, ingresa solo números, sin espacios ni guiones.";
    }

    // 2. Validar Teléfono (Longitud mínima)
    if (usuario.telefono.length < 10) {
      return "El número debe tener al menos 10 dígitos.";
    }

    // 3. Validar Teléfono (Longitud máxima)
    if (usuario.telefono.length > 10) {
      return "El número no puede tener más de 10 dígitos.";
    }

    // 🔥 4. Validar Teléfono (Que no se repita con otro usuario)
    const telefonoExiste = this.usuarios.some(u => 
      u.telefono === usuario.telefono && 
      (isEdit ? u.id !== usuario.id : true) // Si editamos, ignoramos el teléfono del propio usuario
    );
    if (telefonoExiste) {
      return "Este número de teléfono ya está en uso por otro usuario.";
    }

    // 5. Validar Correo (Formato básico)
    if (!usuario.email || !usuario.email.includes('@') || !usuario.email.includes('.')) {
      return "Por favor, ingresa una dirección de correo electrónico válida.";
    }

    // 6. Validar Correo (Dominio)
    const partesEmail = usuario.email.split('@');
    if (partesEmail.length === 2) {
      const dominio = partesEmail[1];
      const regexDominio = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regexDominio.test(dominio)) {
        return `¿Es correcto tu correo? No pudimos verificar el dominio '${dominio}'.`;
      }
    }

    // 7. Validar Correo (Que no se repita)
    const emailExiste = this.usuarios.some(u => 
      u.email.toLowerCase() === usuario.email.toLowerCase() && 
      (isEdit ? u.id !== usuario.id : true)
    );

    if (emailExiste) {
      return "Este correo ya está en uso.";
    }

    return null; // Todo correcto
  }

  // Métodos del Modal de Error
  mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    const modalElement = document.getElementById('modalErrorValidacion');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  cerrarError() {
    const modalElement = document.getElementById('modalErrorValidacion');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  // ==========================================
  // MODALES PRINCIPALES Y CRUD
  // ==========================================
  abrirModalUsuario() { 
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }
  
  cerrarModalUsuario() { 
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
  
  abrirEditar(usuario: UsuarioResponseDto) {
    this.usuarioEdit = { ...usuario };
    const modalElement = document.getElementById('modalEditarUsuario');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }
  
  cerrarEditar() { 
    const modalElement = document.getElementById('modalEditarUsuario');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  crearUsuario() {
    const error = this.validarDatos(this.nuevoUsuario, false);
    if (error) {
      this.mostrarError(error);
      return; 
    }

    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.cerrarModalUsuario();
        this.nuevoUsuario = { nombre: '', email: '', telefono: '', tipo: 'Empleado', contrasena: '' };
      },
      error: (err) => console.error('Error al crear usuario:', err)
    });
  }

  guardarCambios() {
    const error = this.validarDatos(this.usuarioEdit, true);
    if (error) {
      this.mostrarError(error);
      return; 
    }

    const updateDto = {
      nombre: this.usuarioEdit.nombre,
      email: this.usuarioEdit.email,
      telefono: this.usuarioEdit.telefono,
      tipo: this.usuarioEdit.tipo,
      activo: this.usuarioEdit.activo
    };

    this.usuarioService.actualizarUsuario(this.usuarioEdit.id, updateDto).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.cerrarEditar();
      },
      error: (err) => console.error('Error al actualizar usuario:', err)
    });
  }

  async eliminarUsuario(usuario: UsuarioResponseDto) {
    const ok = await this.confirm.confirm({
      title: 'Eliminar usuario',
      message: `¿Eliminar a "${usuario.nombre}"?\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;
    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.toast.show('Eliminado correctamente.', 'success');
        this.cargarUsuarios();
      },
      error: (err) => console.error('Error eliminando usuario:', err),
    });
  }

  desactivarUsuario(usuario: UsuarioResponseDto) {
    this.usuarioService.toggleUsuario(usuario.id).subscribe({
      next: () => this.cargarUsuarios()
    });
  }

  salir(): void {
    this.auth.logout();
  }
}