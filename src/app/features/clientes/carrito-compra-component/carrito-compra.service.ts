import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/services/api';

/** Opciones elegidas en checkout (misma pantalla que pedido nuevo). */
export interface OpcionesCheckoutStripe {
  items?: any[]; // 🔥 Añadido para que el componente pueda pasar los items mapeados
  direccionId: number | null;
  tipoEntrega: string;
  promocionId: number | null;
}

export interface ItemCarrito {
  /** Clave única por línea: mismo producto + distinto tamaño = dos líneas. */
  lineKey: string;
  id: string | number;
  /** Id del tamaño en tu API (`TamanoPizza`); null si el producto no usa tamaño. */
  tamanoPizzaId: number | null;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: ItemCarrito[] = [];
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'arcano_carrito';

  constructor() {
    this.cargarDesdeMemoria();
  }

  /**
   * Verifica si la ejecución ocurre en el cliente (Navegador) para evitar errores SSR.
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private cargarDesdeMemoria(): void {
    if (this.isBrowser()) {
      const memoria = localStorage.getItem(this.STORAGE_KEY);
      if (memoria) {
        try {
          const parsed: unknown[] = JSON.parse(memoria);
          this.items = parsed.map((raw: any) => this.migrarItemCarrito(raw));
        } catch (e) {
          console.error('Error al parsear carrito', e);
          this.items = [];
        }
      }
    }
  }

  private migrarItemCarrito(raw: any): ItemCarrito {
    const id = raw.id ?? raw.idProducto ?? raw.IdProducto;
    const tamanoPizzaId =
      raw.tamanoPizzaId !== undefined && raw.tamanoPizzaId !== '' && raw.tamanoPizzaId !== null
        ? Number(raw.tamanoPizzaId)
        : null;
    const tid = Number.isFinite(tamanoPizzaId as number) ? (tamanoPizzaId as number) : null;
    const lineKey =
      raw.lineKey ??
      `${id}__${tid === null ? 'sintamano' : tid}`;

    return {
      lineKey,
      id,
      tamanoPizzaId: tid,
      nombre: raw.nombre ?? '',
      precio: Number(raw.precio) || 0,
      cantidad: Number(raw.cantidad) || 1,
      imagen: raw.imagen ?? '',
    };
  }

  private guardarEnMemoria(): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    }
  }

  obtenerCarrito(): ItemCarrito[] {
    return this.items;
  }

  agregarAlCarrito(nuevoItem: ItemCarrito): void {
    const itemExistente = this.items.find((item) => item.lineKey === nuevoItem.lineKey);
    if (itemExistente) {
      itemExistente.cantidad += nuevoItem.cantidad;
    } else {
      this.items.push(nuevoItem);
    }
    this.guardarEnMemoria();
  }

  eliminarItem(lineKey: string): void {
    this.items = this.items.filter((item) => item.lineKey !== lineKey);
    this.guardarEnMemoria();
  }

  vaciarCarrito(): void {
    this.items = [];
    if (this.isBrowser()) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * POST /api/pagos/crear-sesion con ítems del carrito y datos de entrega elegidos en UI.
   */
  crearSesionStripe$(opciones: OpcionesCheckoutStripe): Observable<{ url: string }> {
    // 🔥 Si el componente ya nos envía los items mapeados, los usamos. 
    // Si no (por seguridad), los mapeamos aquí incluyendo el PRECIO.
    const datosParaLaApi = opciones.items ? opciones.items : this.items.map((item) => {
      const idReal = item.id || (item as any).idProducto || (item as any).IdProducto;
      return {
        productoId: Number(idReal),
        cantidad: item.cantidad,
        tamanoPizzaId: item.tamanoPizzaId,
        precio: item.precio // 👈 ESTO ES LO QUE LE FALTABA A STRIPE
      };
    });

    console.log('Enviando a Stripe:', {
      items: datosParaLaApi,
      direccionId: opciones.direccionId,
      tipoEntrega: opciones.tipoEntrega,
      promocionId: opciones.promocionId,
    });

    return this.http.post<{ url: string }>(`${API_BASE_URL}/pagos/crear-sesion`, {
      items: datosParaLaApi,
      direccionId: opciones.direccionId,
      tipoEntrega: opciones.tipoEntrega,
      promocionId: opciones.promocionId,
    });
  }
}