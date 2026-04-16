import type { AuthUser } from '../services/auth';

export type AppRole = 'Cliente' | 'Empleado' | 'Administrador' | 'Repartidor';

export function isAppRole(value: unknown): value is AppRole {
  return value === 'Cliente' || value === 'Empleado' || value === 'Administrador' || value === 'Repartidor';
}

export function getRoleHomeUrl(role: unknown): string {
  if (!isAppRole(role)) return '/menu';
  switch (role) {
    case 'Administrador':
      return '/admin/dashboard';
    case 'Empleado':
      return '/empleado/pedidos';
    case 'Repartidor':
      return '/repartidor/pedidos';
    case 'Cliente':
    default:
      return '/menu';
  }
}

export function getUserHomeUrl(user: AuthUser | null): string {
  return getRoleHomeUrl(user?.rol);
}
