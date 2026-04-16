import type { AuthUser } from '../services/auth';

export type AppRole = 'Cliente' | 'Empleado' | 'Administrador' | 'Repartidor';

export function isAppRole(value: unknown): value is AppRole {
  return value === 'Cliente' || value === 'Empleado' || value === 'Administrador' || value === 'Repartidor';
}

export function getRoleHomeUrl(role: unknown): string {
  if (!isAppRole(role)) return '/menu-clientes-component';
  switch (role) {
    case 'Administrador':
      return '/dashboard';
    case 'Empleado':
      return '/pedidos-empleado';
    case 'Repartidor':
      return '/pedidos-repartidor';
    case 'Cliente':
    default:
      return '/menu-clientes-component';
  }
}

export function getUserHomeUrl(user: AuthUser | null): string {
  return getRoleHomeUrl(user?.rol);
}
