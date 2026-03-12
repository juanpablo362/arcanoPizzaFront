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
  { path: '**', redirectTo: 'extras' },
];
