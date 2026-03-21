export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  ingredientes: string | null;
  imagenURL: string | null;
  precio: number;
  // Esta propiedad es CLAVE para la agrupación automática
  categoriaNombre: string; 
}