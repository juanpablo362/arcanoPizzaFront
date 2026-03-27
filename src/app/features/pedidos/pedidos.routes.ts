import { Routes } from '@angular/router';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pedidos').then((m) => m.Pedidos),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pedido-nuevo/pedido-nuevo').then((m) => m.PedidoNuevo),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pedido-detalle/pedido-detalle').then((m) => m.PedidoDetalle),
  },
];
