import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 1. Importamos el detector de cambios
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Quitamos el hack del Router viejo
import { UsuarioService } from '../../../core/services/usuario';

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
  private cdr = inject(ChangeDetectorRef);

  usuarios: UsuarioResponseDto[] = [];
  filtroActual: 'Todos' | 'Empleado' | 'Administrador' | 'Activos' = 'Todos';
  
  // 🔥 NUEVA VARIABLE: Guarda lo que el usuario escribe en el buscador
  terminoBusqueda: string = '';

  nuevoUsuario = { nombre: '', email: '', telefono: '', tipo: 'Empleado' };
  usuarioEdit: any = {};

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  get totalUsuarios() { return this.usuarios.length; }
  get totalEmpleados() { return this.usuarios.filter(u => u.tipo === 'Empleado').length; }
  get totalAdministradores() { return this.usuarios.filter(u => u.tipo === 'Administrador').length; }
  get totalActivos() { return this.usuarios.filter(u => u.activo).length; }

  setFiltro(nuevoFiltro: 'Todos' | 'Empleado' | 'Administrador' | 'Activos') {
    this.filtroActual = nuevoFiltro;
  }

  // 🔥 LÓGICA DE BÚSQUEDA ACTUALIZADA
  usuariosFiltrados() {
    let resultado = this.usuarios;

    // 1. Primero filtramos por la tarjeta seleccionada
    if (this.filtroActual === 'Activos') {
      resultado = resultado.filter(u => u.activo);
    } else if (this.filtroActual !== 'Todos') {
      resultado = resultado.filter(u => u.tipo === this.filtroActual);
    }

    // 2. Luego filtramos por el texto del buscador (si hay algo escrito)
    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(u => 
        u.nombre.toLowerCase().includes(termino) || 
        u.email.toLowerCase().includes(termino) || 
        (u.telefono && u.telefono.includes(termino))
      );
    }

    return resultado;
  }

  // ... (Tus métodos de Modales y CRUD se mantienen idénticos)
  abrirModalUsuario() { new (window as any).bootstrap.Modal(document.getElementById('modalUsuario')).show(); }
  cerrarModalUsuario() { (window as any).bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide(); }
  
  abrirEditar(usuario: UsuarioResponseDto) {
    this.usuarioEdit = { ...usuario };
    new (window as any).bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
  }
  cerrarEditar() { (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide(); }

  crearUsuario() {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.cerrarModalUsuario();
        this.nuevoUsuario = { nombre: '', email: '', telefono: '', tipo: 'Empleado' };
      }
    });
  }

  guardarCambios() {
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
      }
    });
  }

  eliminarUsuario(usuario: UsuarioResponseDto) {
    if (!confirm(`¿Estás seguro de eliminar a ${usuario.nombre}?`)) return;
    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => this.cargarUsuarios()
    });
  }

  desactivarUsuario(usuario: UsuarioResponseDto) {
    this.usuarioService.toggleUsuario(usuario.id).subscribe({
      next: () => this.cargarUsuarios()
    });
  }
}