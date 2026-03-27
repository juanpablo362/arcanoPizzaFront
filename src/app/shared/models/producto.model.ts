import type { TamanoPizzaOpcion } from './tamano-pizza';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  ingredientes: string | null;
  imagenURL: string | null;
  precio: number;
  // Esta propiedad es CLAVE para la agrupación automática
  categoriaNombre: string;
  /** Viene del API por producto; si falta, el menú puede completar tamaños para pizzas. */
  tamanos?: TamanoPizzaOpcion[];
}