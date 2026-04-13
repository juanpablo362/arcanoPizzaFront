import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'pedidos/nuevo',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'pedidos/:id',
    renderMode: RenderMode.Server,
  },
  /** Retorno desde Stripe: evitar prerender rígido; la lógica del carrito corre en el cliente. */
  {
    path: 'pago-exito',
    renderMode: RenderMode.Server,
  },
  {
    path: 'pago-cancelado',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
