import { Routes } from '@angular/router';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pedidos').then((m) => m.Pedidos),
  },
];
