import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  
  // 👈 Inyectamos el cliente HTTP para poder hablar con .NET
  private http = inject(HttpClient); 

  constructor() { }

  obtenerCarrito() {
    return this.items;
  }

  agregarAlCarrito(nuevoItem: ItemCarrito) {
    const itemExistente = this.items.find(item => item.id === nuevoItem.id);
    if (itemExistente) {
      itemExistente.cantidad += nuevoItem.cantidad;
    } else {
      this.items.push(nuevoItem);
    }
  }

  eliminarItem(id: string | number) {
    this.items = this.items.filter(item => item.id !== id);
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
    this.http.post<{url: string}>('https://localhost:7030/api/pagos/crear-sesion', datosParaLaApi)
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