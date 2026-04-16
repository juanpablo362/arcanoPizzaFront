import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  // 👇 Entrada: menú público (sin cuenta). Login al intentar carrito / pedido / pago, etc.
  {
    path: '',
    redirectTo: '/menu-clientes-component',
    pathMatch: 'full',
  },

  // --- 1. RUTAS ESPECÍFICAS PRIMERO ---
  {
    path: 'menu-clientes-component',
    loadChildren: () =>
      import('./features/clientes/menu-clientes-component/menu-clientes-component.routes').then(
        (m) => m.MENU_CLIENTES_ROUTES,
      ),
  },
  {
    path: 'producto-detalle',
    loadComponent: () =>
      import('./features/clientes/producto-detalle-component/producto-detalle-component').then(
        (m) => m.ProductoDetalleComponent,
      ),
  },
  {
    path: 'promociones',
    loadComponent: () =>
      import('./features/clientes/promociones-component/promociones-component').then(
        (m) => m.PromocionesComponent,
      ),
  },
  {
    path: 'dashboard', 
    canActivate: [authGuard, roleGuard(['Administrador'])],
    loadComponent: () => import('./features/administrador/dashboard-component/dashboard-component').then(m => m.DashboardComponent)
  },
  {
    path: 'productos',
    canActivate: [authGuard, roleGuard(['Administrador'])],
    loadComponent: () => import('./features/administrador/producto-component/producto-component').then(m => m.ProductoComponent)
  },
  
  // 🔥 AQUÍ ESTÁ EL CAMBIO: Ahora carga UsuariosComponent correctamente
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Administrador'])],
    loadComponent: () => import('./features/administrador/usuarios-component/usuarios-component').then(m => m.UsuariosComponent)
  },
  {
    path: 'promociones-admin',
    canActivate: [authGuard, roleGuard(['Administrador'])],
    loadComponent: () =>
      import('./features/administrador/promociones-admin-component/promociones-admin-component').then(
        (m) => m.PromocionesAdminComponent,
      ),
  },

  {
    path: 'carrito-compra',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/carrito-compra-component/carrito-compra-component').then(
        (m) => m.CarritoCompraComponent,
      ),
  },
  /** Sin authGuard: el retorno desde Stripe es navegación externa; en SSR no hay sesión y se redirigía a /auth antes de vaciar el carrito. */
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
    loadComponent: () =>
      import('./features/clientes/legal/terminos-component').then((m) => m.TerminosComponent),
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./features/clientes/legal/privacidad-component').then((m) => m.PrivacidadComponent),
  },

  {
    path: 'pedidos',
    canActivate: [authGuard],
    loadChildren: () => import('./features/pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES),
  },
  {
    path: 'extras',
    canActivate: [authGuard],
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
    canActivate: [authGuard, roleGuard(['Empleado', 'Administrador'])],
    loadComponent: () => import('./features/empleado/pedidos-component/pedidos-component').then(m => m.PedidosComponent)
  },

  // --- 3. RUTAS CON LAYOUT --
  {
    path: '**',
    redirectTo: '/menu-clientes-component',
  },
];
