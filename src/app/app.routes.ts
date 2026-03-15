import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';
import { MenuClientesComponent } from './features/clientes/menu-clientes-component/menu-clientes-component';
import { ProductoDetalleComponent } from './features/clientes/producto-detalle-component/producto-detalle-component';
import { PromocionesComponent } from './features/clientes/promociones-component/promociones-component';

export const routes: Routes = [

  // 👇 --- 0. RUTA MAESTRA POR DEFECTO (Añadida aquí al inicio) --- 👇
  // {
  //   path: '',
  //   redirectTo: 'menu-clientes-component',
  //   pathMatch: 'full'
  // },
  
  // --- 1. RUTAS ESPECÍFICAS PRIMERO (Angular las encuentra rápido) ---
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

  // --- 2. RUTAS DE AUTENTICACIÓN ---
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // --- 3. RUTAS CON LAYOUT (Al poner este path: '' después, ya no bloquea a las de arriba) ---
  {
    path: '',
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

  // --- 4. RUTA COMODÍN ---
  { path: '**', redirectTo: 'menu-clientes-component' },
];