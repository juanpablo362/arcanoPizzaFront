/**
 * Etiquetas amigables para el cliente y clases CSS para badges (valores alineados con la API / panel empleado).
 */
export function etiquetaEstadoPedidoCliente(estado: string | null | undefined): string {
  const e = (estado ?? '').trim();
  switch (e) {
    case 'Pendiente':
      return 'Pedido recibido';
    case 'En Preparacion':
      return 'En preparación';
    case 'Listo':
      return 'Listo para entrega o retiro';
    case 'En Ruta':
      return 'En camino';
    case 'Entregado':
      return 'Entregado';
    case 'Cancelado':
      return 'Cancelado';
    default:
      return e || 'En proceso';
  }
}

/** Sufijo de clase: `estado-badge estado-badge--<suffix>` */
export function sufijoClaseEstadoPedido(estado: string | null | undefined): string {
  const e = (estado ?? '').trim();
  switch (e) {
    case 'Pendiente':
      return 'pendiente';
    case 'En Preparacion':
      return 'preparacion';
    case 'Listo':
      return 'listo';
    case 'En Ruta':
      return 'ruta';
    case 'Entregado':
      return 'entregado';
    case 'Cancelado':
      return 'cancelado';
    default:
      return 'default';
  }
}
