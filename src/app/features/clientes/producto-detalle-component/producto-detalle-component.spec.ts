import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { ProductoDetalleComponent } from './producto-detalle-component';
import { CarritoService } from '../carrito-compra-component/carrito-compra.service';

const PRODUCTO = {
  id: 7,
  nombre: 'Hawaiana',
  descripcion: 'Piña y jamón',
  ingredientes: 'piña, jamón',
  imagenURL: '/img/hawaiana.jpg',
  precio: 200,
  categoriaNombre: 'Pizzas especiales',
  tamanos: [
    { tamanoPizzaId: 1, name: 'Chica', cm: '6 reb.', price: 150 },
    { tamanoPizzaId: 3, name: 'Grande', cm: '8 reb.', price: 220 },
  ],
};

describe('CP-002 Detalle de producto', () => {
  let fixture: ComponentFixture<ProductoDetalleComponent>;
  let component: ProductoDetalleComponent;
  let autenticado: WritableSignal<boolean>;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    history.replaceState({ producto: structuredClone(PRODUCTO) }, '', '/producto');
    autenticado = signal(false);

    await TestBed.configureTestingModule({
      imports: [ProductoDetalleComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: autenticado,
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

    fixture = TestBed.createComponent(ProductoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    history.replaceState({}, '', '/');
  });

  it('muestra ficha, tamaño inicial, cantidad y total', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(component.producto.nombre).toBe('Hawaiana');
    expect(component.producto.ingredientes).toEqual(['piña', 'jamón']);
    expect(component.quantity).toBe(1);
    expect(component.selectedSize?.name).toBe('Chica');
    expect(component.total).toBe(150);
    expect(texto).toContain('Hawaiana');
    expect(texto).toContain('Piña y jamón');
    expect(texto).toContain('piña');
    expect(texto).toContain('150.00');
    expect(texto).toContain('MXN');
    expect(texto).toContain('Chica');
    expect(texto).toContain('Grande');
  });

  it('recalcula precio y total al cambiar de tamaño', () => {
    const grande = component.producto.tamanos[1];
    component.selectSize(grande);
    fixture.changeDetectorRef.detectChanges();

    expect(component.selectedSize).toBe(grande);
    expect(component.total).toBe(220);
    expect(fixture.nativeElement.textContent).toContain('220.00');
  });

  it('multiplica el total por la cantidad y no baja de 1', () => {
    component.selectSize(component.producto.tamanos[1]);
    component.increaseQuantity();

    expect(component.quantity).toBe(2);
    expect(component.total).toBe(440);

    component.decreaseQuantity();
    component.decreaseQuantity();

    expect(component.quantity).toBe(1);
    expect(component.total).toBe(220);
  });

  it('sin sesión pide login y no agrega la línea al carrito', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const carrito = TestBed.inject(CarritoService);

    component.agregarAlCarrito();

    expect(navigate).toHaveBeenCalledWith(['/auth'], { queryParams: { returnUrl: '/producto' } });
    expect(sessionStorage.getItem('arcano_post_login_nav')).toContain('/producto');
    expect(carrito.obtenerCarrito()).toHaveLength(0);
    expect(component.mostrarToast).toBe(false);
  });

  it('con un Cliente autenticado guarda la línea y avisa el alta', async () => {
    vi.useFakeTimers();
    autenticado.set(true);

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const carrito = TestBed.inject(CarritoService);
    const grande = component.producto.tamanos[1];

    component.selectSize(grande);
    component.increaseQuantity();
    component.agregarAlCarrito();
    fixture.changeDetectorRef.detectChanges();

    const [linea] = carrito.obtenerCarrito();
    expect(linea.nombre).toBe('Hawaiana (Grande)');
    expect(linea.precio).toBe(220);
    expect(linea.cantidad).toBe(2);
    expect(linea.tamanoPizzaId).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('¡Pizza agregada al carrito!');

    await vi.advanceTimersByTimeAsync(1500);
    expect(navigate).toHaveBeenCalledWith(['/menu']);
  });
});

describe('CP-002 Detalle sin producto en historial', () => {
  it('redirige al menú si no hay producto en history.state', async () => {
    history.replaceState({}, '', '/producto');

    await TestBed.configureTestingModule({
      imports: [ProductoDetalleComponent],
      providers: [
        provideRouter([
          { path: 'menu', component: ProductoDetalleComponent },
          { path: 'producto', component: ProductoDetalleComponent },
        ]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(false),
            user: signal(null),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ProductoDetalleComponent);
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(['/menu']);
  });
});
