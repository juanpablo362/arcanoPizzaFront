import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface ItemCarrito {
  id: string | number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root' // 👈 ¡ESTO ES VITAL! Hace que la memoria sea global
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
        this.items = JSON.parse(memoria);
      }
    }
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
    const itemExistente = this.items.find(item => item.id === nuevoItem.id);
    if (itemExistente) {
      itemExistente.cantidad += nuevoItem.cantidad;
    } else {
      this.items.push(nuevoItem);
    }
    this.guardarEnMemoria();
  }

  eliminarItem(id: string | number): void {
    this.items = this.items.filter(item => item.id !== id);
    this.guardarEnMemoria();
  }

  vaciarCarrito(): void {
    this.items = [];
    if (this.isBrowser()) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // 🚀 ESTA ES LA CONEXIÓN ESTRELLA CON .NET
  procesarPagoEnStripe() {
    if (this.items.length === 0) {
      alert('Tu carrito está vacío. ¡Agrega unas pizzas primero!');
      return;
    }

    // 1. Armamos el sobre buscando el ID de forma segura
    const datosParaLaApi = this.items.map(item => {
      // Magia: Si no encuentra 'id', buscará 'idProducto' o 'IdProducto'
      const idReal = item.id || (item as any).idProducto || (item as any).IdProducto;

      return {
        productoId: Number(idReal),
        cantidad: item.cantidad
      };
    });

    console.log('Enviando datos CORREGIDOS a la API:', datosParaLaApi);

    // 2. Hacemos la llamada a tu API
    this.http.post<{ url: string }>('https://localhost:7030/api/pagos/crear-sesion', datosParaLaApi)
      .subscribe({
        next: (respuesta) => {
          window.location.href = respuesta.url;
        },
        error: (err) => {
          console.error('Error de conexión:', err);
          alert('Error al conectar con el servidor de pagos. Revisa la consola.');
        }
      });
  }
}