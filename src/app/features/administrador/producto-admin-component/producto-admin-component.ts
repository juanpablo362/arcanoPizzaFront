import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UsuarioService } from '../../../core/services/usuario';


interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  tipo: 'Empleado' | 'Administrador';
  activo: boolean;
  fechaMiembro: string;
}

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './producto-admin-component.html',
  styleUrls: ['./producto-admin-component.css'],
})
export class ProductoAdminComponent implements OnInit {

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuarios: any[] = [];

  filtro: 'Todos' | 'Empleados' | 'Administradores' = 'Todos';

  nuevoUsuario = {
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'Empleado'
  };

  usuarioEdit: any = {};

  ngOnInit() {
    this.cargarUsuarios();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarUsuarios();
      });
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe(data => {
      this.usuarios = data;
    });
  }

  // 🔥 ESTADÍSTICAS (SOLUCIÓN)
  get totalUsuarios() {
    return this.usuarios.length;
  }

  get totalEmpleados() {
    return this.usuarios.filter(u => u.tipo === 'Empleado').length;
  }

  get totalAdministradores() {
    return this.usuarios.filter(u => u.tipo === 'Administrador').length;
  }

  get totalActivos() {
    return this.usuarios.filter(u => u.activo).length;
  }

  usuariosFiltrados() {
    if (this.filtro === 'Todos') return this.usuarios;
    return this.usuarios.filter(u => u.tipo === this.filtro.slice(0, -1));
  }

  // ===== MODALES =====

  abrirModalUsuario() {
    new (window as any).bootstrap.Modal(document.getElementById('modalUsuario')).show();
  }

  cerrarModalUsuario() {
    (window as any).bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
  }

  abrirEditar(usuario: any) {
    this.usuarioEdit = { ...usuario };
    new (window as any).bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
  }

  cerrarEditar() {
    (window as any).bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
  }

  // ===== CRUD =====

  crearUsuario() {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe(() => {
      this.cargarUsuarios();
      this.cerrarModalUsuario();
    });
  }

  guardarCambios() {
    this.usuarioService.actualizarUsuario(this.usuarioEdit.id, this.usuarioEdit)
      .subscribe(() => {
        this.cargarUsuarios();
        this.cerrarEditar();
      });
  }

  eliminarUsuario(usuario: any) {
    if (!confirm('¿Eliminar usuario?')) return;

    this.usuarioService.eliminarUsuario(usuario.id).subscribe(() => {
      this.cargarUsuarios();
    });
  }

  desactivarUsuario(usuario: any) {
    this.usuarioService.toggleUsuario(usuario.id).subscribe(() => {
      this.cargarUsuarios();
    });
  }
}