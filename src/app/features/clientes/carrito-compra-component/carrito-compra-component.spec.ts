import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { CarritoCompraComponent } from './carrito-compra-component';
import { CarritoService, ItemCarrito } from './carrito-compra.service';

function linea(parcial: Partial<ItemCarrito> & Pick<ItemCarrito, 'lineKey' | 'precio'>): ItemCarrito {
  return {
    id: parcial.id ?? 1,
    tamanoPizzaId: parcial.tamanoPizzaId ?? 3,
    nombre: parcial.nombre ?? 'Hawaiana (Grande)',
    cantidad: parcial.cantidad ?? 1,
    imagen: parcial.imagen ?? '/img/hawaiana.jpg',
    lineKey: parcial.lineKey,
    precio: parcial.precio,
  };
}

describe('CP-003 Carrito de compras', () => {
  let fixture: ComponentFixture<CarritoCompraComponent>;
  let component: CarritoCompraComponent;
  let carrito: CarritoService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CarritoCompraComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(true),
            user: signal({
              idUsuario: 1,
              nombreUsuario: 'ana',
              correo: 'ana@arcano.test',
              rol: 'Cliente',
            }),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    carrito = TestBed.inject(CarritoService);
    carrito.vaciarCarrito();
    carrito.agregarAlCarrito(linea({ lineKey: '7__3', precio: 220, cantidad: 1 }));
    carrito.agregarAlCarrito(
      linea({
        lineKey: '3__sintamano',
        id: 3,
        tamanoPizzaId: null,
        nombre: 'Cola',
        precio: 30,
        cantidad: 2,
        imagen: '/img/cola.jpg',
      }),
    );

    fixture = TestBed.createComponent(CarritoCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('lista las líneas y calcula subtotal, IVA del 16% y total', () => {
    const texto = fixture.nativeElement.textContent as string;

    expect(texto).toContain('Carrito de compras');
    expect(texto).toContain('Hawaiana (Grande)');
    expect(texto).toContain('Cola');
    expect(texto).toContain('220.00');
    expect(texto).toContain('30.00');
    expect(texto).toContain('MXN');
    expect(texto).toContain('16% IVA');
    expect(component.subtotal).toBe(280);
    expect(component.iva).toBeCloseTo(44.8);
    expect(component.total).toBeCloseTo(324.8);
  });

  it('sube la cantidad y recalcula subtotal, IVA y total', () => {
    const pizza = component.carritoItems[0];
    component.aumentarCantidad(pizza);

    expect(pizza.cantidad).toBe(2);
    expect(component.subtotal).toBe(500);
    expect(component.iva).toBeCloseTo(80);
    expect(component.total).toBeCloseTo(580);
  });

  it('no deja la cantidad por debajo de 1', () => {
    const pizza = component.carritoItems[0];
    component.disminuirCantidad(pizza);
    component.disminuirCantidad(pizza);

    expect(pizza.cantidad).toBe(1);
    expect(component.subtotal).toBe(280);
    expect(component.total).toBeCloseTo(324.8);
    expect(component.carritoItems).toHaveLength(2);
  });

  it('quita la línea y actualiza los importes con lo que queda', () => {
    component.eliminarProducto('7__3');
    fixture.changeDetectorRef.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(component.carritoItems.map((item) => item.nombre)).toEqual(['Cola']);
    expect(texto).not.toContain('Hawaiana (Grande)');
    expect(component.subtotal).toBe(60);
    expect(component.iva).toBeCloseTo(9.6);
    expect(component.total).toBeCloseTo(69.6);
  });

  it('abre el pedido nuevo con pago Stripe', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.irAlPago();

    expect(navigate).toHaveBeenCalledWith(['/pedidos/nuevo'], {
      queryParams: { pago: 'stripe' },
    });
  });
});
