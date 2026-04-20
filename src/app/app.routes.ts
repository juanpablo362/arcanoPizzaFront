import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  // 👇 Entrada: menú público (sin cuenta). Login al intentar carrito / pedido / pago, etc.
  {
    path: '',
    redirectTo: '/menu',
    pathMatch: 'full',
  },

  // --- 1. RUTAS ESPECÍFICAS PRIMERO ---
  // URLs limpias (preferidas)
  {
    path: 'menu',
    loadChildren: () =>
      import('./features/clientes/menu-clientes-component/menu-clientes-component.routes').then(
        (m) => m.MENU_CLIENTES_ROUTES,
      ),
  },
  {
    path: 'producto',
    loadComponent: () =>
      import('./features/clientes/producto-detalle-component/producto-detalle-component').then(
        (m) => m.ProductoDetalleComponent,
      ),
  },
  {
    path: 'carrito',
    canActivate: [authGuard, roleGuard(['Cliente'])],
    loadComponent: () =>
      import('./features/clientes/carrito-compra-component/carrito-compra-component').then(
        (m) => m.CarritoCompraComponent,
      ),
  },
  {
    path: 'pago/exito',
    loadChildren: () =>
      import('./features/clientes/pago-exito/pago-exito.routes').then((m) => m.PAGO_EXITO_ROUTES),
  },
  {
    path: 'pago/cancelado',
    loadChildren: () =>
      import('./features/clientes/pago-cancelado/pago-cancelado.routes').then(
        (m) => m.PAGO_CANCELADO_ROUTES,
      ),
  },
  {
    path: 'legal/terminos',
    loadComponent: () =>
      import('./features/clientes/legal/terminos-component').then((m) => m.TerminosComponent),
  },
  {
    path: 'legal/privacidad',
    loadComponent: () =>
      import('./features/clientes/legal/privacidad-component').then((m) => m.PrivacidadComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard(['Administrador', 'Tecnico'])],
    loadComponent: () =>
      import('./features/administrador/dashboard-component/dashboard-component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'admin/productos',
    canActivate: [authGuard, roleGuard(['Administrador', 'Tecnico'])],
    loadComponent: () =>
      import('./features/administrador/producto-component/producto-component').then(
        (m) => m.ProductoComponent,
      ),
  },
  {
    path: 'admin/usuarios',
    canActivate: [authGuard, roleGuard(['Administrador', 'Tecnico'])],
    loadComponent: () =>
      import('./features/administrador/usuarios-component/usuarios-component').then(
        (m) => m.UsuariosComponent,
      ),
  },
  {
    path: 'admin/promociones',
    canActivate: [authGuard, roleGuard(['Administrador', 'Tecnico'])],
    loadComponent: () =>
      import('./features/administrador/promociones-admin-component/promociones-admin-component').then(
        (m) => m.PromocionesAdminComponent,
      ),
  },
  {
    path: 'empleado/pedidos',
    canActivate: [authGuard, roleGuard(['Empleado', 'Administrador'])],
    loadComponent: () =>
      import('./features/empleado/pedidos-component/pedidos-component').then((m) => m.PedidosComponent),
  },
  {
    path: 'repartidor/pedidos',
    canActivate: [authGuard, roleGuard(['Repartidor'])],
    loadComponent: () =>
      import('./features/repartidor/pedidos-asignados-component/pedidos-asignados-component').then(
        (m) => m.PedidosAsignadosComponent,
      ),
  },
  {
    path: 'tecnico/logs',
    canActivate: [authGuard, roleGuard(['Tecnico'])],
    loadComponent: () =>
      import('./features/tecnico/audit-logs-component/audit-logs-component').then(
        (m) => m.AuditLogsComponent,
      ),
  },

  // Redirects desde rutas antiguas (compatibilidad)
  {
    path: 'menu-clientes-component',
    redirectTo: '/menu',
  },
  {
    path: 'producto-detalle',
    redirectTo: '/producto',
  },
  {
    path: 'promociones',
    loadComponent: () =>
      import('./features/clientes/promociones-component/promociones-component').then(
        (m) => m.PromocionesComponent,
      ),
  },
  { path: 'dashboard', redirectTo: '/admin/dashboard' },
  { path: 'productos', redirectTo: '/admin/productos' },
  { path: 'admin', redirectTo: '/admin/usuarios' },
  { path: 'promociones-admin', redirectTo: '/admin/promociones' },

  {
    path: 'carrito-compra',
    redirectTo: '/carrito',
  },
  /**
   * Compatibilidad con URLs antiguas.
   * Importante: NO usar redirectTo aquí porque puede perder query params como `?session_id=...` al volver desde Stripe.
   */
  {
    path: 'pago-exito',
    loadChildren: () =>
      import('./features/clientes/pago-exito/pago-exito.routes').then((m) => m.PAGO_EXITO_ROUTES),
  },
  {
    path: 'pago-cancelado',
    loadChildren: () =>
      import('./features/clientes/pago-cancelado/pago-cancelado.routes').then(
        (m) => m.PAGO_CANCELADO_ROUTES,
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./features/clientes/contacto-component/contacto-component').then(
        (m) => m.ContactoComponent,
      ),
  },
  {
    path: 'terminos',
    redirectTo: '/legal/terminos',
  },
  {
    path: 'privacidad',
    redirectTo: '/legal/privacidad',
  },

  {
    path: 'pedidos',
    canActivate: [authGuard, roleGuard(['Cliente'])],
    loadChildren: () => import('./features/pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES),
  },
  {
    path: 'extras',
    canActivate: [authGuard, roleGuard(['Cliente'])],
    loadChildren: () => import('./features/extras/extras.routes').then((m) => m.EXTRAS_ROUTES),
  },

  // --- 2. RUTAS DE AUTENTICACIÓN ---
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
   { 
    path: 'pedidos-empleado', 
    redirectTo: '/empleado/pedidos',
  },
  {
    path: 'pedidos-repartidor',
    redirectTo: '/repartidor/pedidos',
  },

  // --- 3. RUTAS CON LAYOUT --
  {
    path: '**',
    redirectTo: '/menu',
  },
];
