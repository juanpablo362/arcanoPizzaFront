export interface PedidoLista {
  idPedido: number;
  estado: string;
  total: number;
  creado: string;
  tipoEntrega: string;
  promocionTitulo: string | null;
  /** Efectivo, TarjetaOnline, etc. */
  metodoPago: string | null;
}

export interface PedidoLineaDetalle {
  idPedidoItem: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  tamanoNombre: string | null;
}

export interface Direccion {
  idDireccion: number;
  calle: string;
  colonia: string;
  codigoPostal: string;
}

export interface PedidoDetalle {
  idPedido: number;
  estado: string;
  subtotal: number;
  descuentoTotal: number;
  impuestos: number;
  total: number;
  tipoEntrega: string;
  timeStamp: string | null;
  promocionId: number | null;
  promocionTitulo: string | null;
  metodoPago: string | null;
  direccion: Direccion;
  lineas: PedidoLineaDetalle[];
}

export interface PedidoCrearPayload {
  lineas: { productoId: number; cantidad: number; tamanoPizzaId?: number | null }[];
  /** Obligatoria para reparto; omitir o null si es recogida en local. */
  direccionId?: number | null;
  promocionId?: number | null;
  tipoEntrega: string;
  /** Efectivo u omitir si coordina después con la tienda */
  metodoPago?: string | null;
}

/** Texto para UI a partir del valor que guarda la API */
export function etiquetaMetodoPago(codigo: string | null | undefined): string {
  if (codigo == null || String(codigo).trim() === '') return 'Por definir';
  switch (codigo) {
    case 'Efectivo':
      return 'Efectivo';
    case 'TarjetaOnline':
      return 'Tarjeta online';
    default:
      return codigo;
  }
}
