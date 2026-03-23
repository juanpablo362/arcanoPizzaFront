import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';
import { MenuClientesComponent } from './features/clientes/menu-clientes-component/menu-clientes-component';
import { ProductoDetalleComponent } from './features/clientes/producto-detalle-component/producto-detalle-component';
import { PromocionesComponent } from './features/clientes/promociones-component/promociones-component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu-clientes-component',
    pathMatch: 'full'
  },
  {
    path: 'menu-clientes-component',
    loadChildren: () => import('./features/clientes/menu-clientes-component/menu-clientes-component.routes').then(m => m.MENU_CLIENTES_ROUTES)
  },
  {
    path: 'producto-detalle',
    loadComponent: () => import('./features/clientes/producto-detalle-component/producto-detalle-component').then(m => m.ProductoDetalleComponent)
  },
  {
    path: 'promociones',
    loadComponent: () => import('./features/clientes/promociones-component/promociones-component').then(m => m.PromocionesComponent)
  },
  {
    path: 'carrito-compra',
    loadComponent: () => import('./features/clientes/carrito-compra-component/carrito-compra-component').then(m => m.CarritoCompraComponent)
  },
  {
    path: 'pago-exito',
    loadChildren: () => import('./features/clientes/pago-exito/pago-exito.routes').then(m => m.PAGO_EXITO_ROUTES)
  },
  {
    path: 'pago-cancelado',
    loadChildren: () => import('./features/clientes/pago-cancelado/pago-cancelado.routes').then(m => m.PAGO_CANCELADO_ROUTES)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/clientes/contacto-component/contacto-component').then(m => m.ContactoComponent)
  },
  {
    path: 'pago',
    loadComponent: () => import('./features/clientes/payment-component/payment-component').then(m => m.PaymentComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin', 
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'extras', pathMatch: 'full' },
      { path: 'extras', loadChildren: () => import('./features/extras/extras.routes').then((m) => m.EXTRAS_ROUTES) },
      { path: 'pedidos', loadChildren: () => import('./features/pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES), canActivate: [authGuard] },
    ],
  },
  { 
    path: '**', 
    redirectTo: '/menu-clientes-component' 
  }
];