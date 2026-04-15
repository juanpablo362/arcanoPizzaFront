import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full',
  },
  {
    path: 'menu-clientes-component',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/clientes/menu-clientes-component/menu-clientes-component.routes').then(
        (m) => m.MENU_CLIENTES_ROUTES,
      ),
  },
  {
    path: 'producto-detalle',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/producto-detalle-component/producto-detalle-component').then(
        (m) => m.ProductoDetalleComponent,
      ),
  },
  {
    path: 'promociones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/promociones-component/promociones-component').then(
        (m) => m.PromocionesComponent,
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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/contacto-component/contacto-component').then(
        (m) => m.ContactoComponent,
      ),
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
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/menu-clientes-component',
  },
];
