import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Usuario {
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
export class ProductoAdminComponent {
  // Botones de filtro
  filtro: 'Todos' | 'Empleados' | 'Administradores' = 'Todos';

  // Datos de ejemplo
  usuarios: Usuario[] = [
    { nombre: 'Juan Pérez', email: 'juan.perez@arcanopizza.com', telefono: '(555) 345-6789', tipo: 'Empleado', activo: true, fechaMiembro: '1/11/2025' },
    { nombre: 'Ana Martínez', email: 'ana.martinez@arcanopizza.com', telefono: '(555) 456-7890', tipo: 'Empleado', activo: true, fechaMiembro: '15/10/2025' },
    { nombre: 'Luis Torres', email: 'luis.torres@arcanopizza.com', telefono: '(555) 567-8901', tipo: 'Administrador', activo: true, fechaMiembro: '1/8/2025' }
  ];

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
    if (this.filtro === 'Empleados') return this.usuarios.filter(u => u.tipo === 'Empleado');
    if (this.filtro === 'Administradores') return this.usuarios.filter(u => u.tipo === 'Administrador');
    return this.usuarios;
  }

  desactivarUsuario(usuario: Usuario) {
    usuario.activo = !usuario.activo;
  }

  eliminarUsuario(usuario: Usuario) {
    this.usuarios = this.usuarios.filter(u => u !== usuario);
  }
}