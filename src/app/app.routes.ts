import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';
import { MenuClientesComponent } from './features/clientes/menu-clientes-component/menu-clientes-component';
import { ProductoDetalleComponent } from './features/clientes/producto-detalle-component/producto-detalle-component';
import { PromocionesComponent } from './features/clientes/promociones-component/promociones-component';

export const routes: Routes = [

  // 👇 --- 0. LA PUERTA DE ENTRADA (Esto hace que los productos carguen solos al dar ng serve) --- 👇
  {
    path: '',
    redirectTo: 'menu-clientes-component',
    pathMatch: 'full'
  },

  // --- 1. TODAS TUS RUTAS DE CLIENTES (Aquí están todas, completas y en orden) ---
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
    path: 'contacto',
    loadComponent: () => import('./features/clientes/contacto-component/contacto-component').then(m => m.ContactoComponent)
  },
  {
    path: 'pago',
    loadComponent: () => import('./features/clientes/payment-component/payment-component').then(m => m.PaymentComponent)
  },

  // --- 2. RUTAS DE AUTENTICACIÓN ---
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // --- 3. RUTAS CON LAYOUT (El cambio clave está aquí) ---
  // Le pusimos el nombre 'admin' para que no choque con la entrada principal ('')
  {
    path: 'admin', 
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'extras', pathMatch: 'full' },
      {
        path: 'extras',
        loadChildren: () => import('./features/extras/extras.routes').then((m) => m.EXTRAS_ROUTES),
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./features/pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES),
        canActivate: [authGuard],
      },
    ],
  },

  // --- 4. RUTA COMODÍN (Protección por si escriben mal la URL) ---
  { path: '**', redirectTo: 'menu-clientes-component' },
];