import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { CarritoService, ItemCarrito } from './carrito-compra.service';

function item(parcial: Partial<ItemCarrito> & Pick<ItemCarrito, 'lineKey'>): ItemCarrito {
  return {
    id: parcial.id ?? 7,
    tamanoPizzaId: parcial.tamanoPizzaId ?? 3,
    nombre: parcial.nombre ?? 'Hawaiana (Grande)',
    precio: parcial.precio ?? 220,
    cantidad: parcial.cantidad ?? 1,
    imagen: parcial.imagen ?? '/img/hawaiana.jpg',
    lineKey: parcial.lineKey,
  };
}

describe('CarritoService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function crearServicio(): CarritoService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    return TestBed.inject(CarritoService);
  }

  it('suma cantidades cuando el mismo producto y tamaño ya están en el carrito', () => {
    const carrito = crearServicio();
    carrito.agregarAlCarrito(item({ lineKey: '7__3', cantidad: 1 }));
    carrito.agregarAlCarrito(item({ lineKey: '7__3', cantidad: 2 }));

    expect(carrito.obtenerCarrito()).toHaveLength(1);
    expect(carrito.obtenerCarrito()[0].cantidad).toBe(3);
  });

  it('crea dos líneas cuando el tamaño es distinto', () => {
    const carrito = crearServicio();
    carrito.agregarAlCarrito(item({ lineKey: '7__3', tamanoPizzaId: 3, nombre: 'Hawaiana (Grande)' }));
    carrito.agregarAlCarrito(
      item({
        lineKey: '7__1',
        tamanoPizzaId: 1,
        nombre: 'Hawaiana (Chica)',
        precio: 150,
      }),
    );

    expect(carrito.obtenerCarrito()).toHaveLength(2);
  });

  it('tolera JSON corrupto en localStorage y deja el carrito vacío', () => {
    localStorage.setItem('arcano_carrito', '{no-es-json');
    const carrito = crearServicio();
    expect(carrito.obtenerCarrito()).toHaveLength(0);
  });
});
