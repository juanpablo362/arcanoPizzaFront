import { Injectable } from '@angular/core';

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

  constructor() { }

  obtenerCarrito() {
    console.log('👀 La pantalla del carrito está leyendo los datos. Total de items:', this.items.length);
    return this.items;
  }

  agregarAlCarrito(nuevoItem: ItemCarrito) {
    const itemExistente = this.items.find(item => item.id === nuevoItem.id);
    
    if (itemExistente) {
      itemExistente.cantidad += nuevoItem.cantidad;
    } else {
      this.items.push(nuevoItem);
    }
    console.log('✅ Se agregó una pizza. La memoria ahora tiene:', this.items);
  }

  eliminarItem(id: string | number) {
    this.items = this.items.filter(item => item.id !== id);
  }
}