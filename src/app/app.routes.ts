import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'extras', pathMatch: 'full' },

      {
        path: 'extras',
        loadChildren: () =>
          import('./features/extras/extras.routes').then((m) => m.EXTRAS_ROUTES),
      },
      {
        path: 'pedidos',
        loadChildren: () =>
          import('./features/pedidos/pedidos.routes').then(
            (m) => m.PEDIDOS_ROUTES
          ),
        canActivate: [authGuard],
      },     
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  
//   {
//   path: '',
//   children: [
//     {
//       path: 'menu-clientes-component',
//       loadChildren: () => import('./features/clientes/menu-clientes-component/menu-clientes-component.routes')
//       .then(m => m.MENU_CLIENTES_ROUTES)
//     },
//   ]
// },
    
//   //{ path: '**', redirectTo: 'extras' },
  
// ];

{
    path: '',
    children: [
      {
        path: 'menu-clientes-component',
        loadChildren: () => import('./features/clientes/menu-clientes-component/menu-clientes-component.routes')
        .then(m => m.MENU_CLIENTES_ROUTES)
      },
      // 👇 ¡AGREGA ESTE NUEVO BLOQUE AQUÍ! 👇
      {
        path: 'producto-detalle',
        loadComponent: () => import('./features/clientes/producto-detalle-component/producto-detalle-component').then(m => m.ProductoDetalleComponent)
      }
    ]
  },
    
  // { path: '**', redirectTo: 'extras' },
  { path: '**', redirectTo: 'menu-clientes-component' },
];