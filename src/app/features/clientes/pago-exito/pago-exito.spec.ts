import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PagosService } from '../../../core/services/pagos.service';
import { CarritoService } from '../carrito-compra-component/carrito-compra.service';
import { PagoExito } from './pago-exito';

const PEDIDO = {
  idPedido: 42,
  estado: 'Pagado',
  subtotal: 220,
  descuentoTotal: 0,
  impuestos: 35.2,
  total: 255.2,
  tipoEntrega: 'Reparto',
  timeStamp: null,
  promocionId: null,
  promocionTitulo: null,
  metodoPago: 'TarjetaOnline',
  direccion: {
    idDireccion: 1,
    calle: 'Calle Luna',
    colonia: 'Centro',
    codigoPostal: '44100',
  },
  lineas: [],
};

describe('PagoExito', () => {
  let fixture: ComponentFixture<PagoExito>;
  let carrito: CarritoService;
  let confirmar: ReturnType<typeof vi.fn>;

  async function montar(query: Record<string, string>, confirmarImpl?: ReturnType<typeof vi.fn>) {
    localStorage.clear();
    confirmar = confirmarImpl ?? vi.fn(() => of(PEDIDO));

    await TestBed.configureTestingModule({
      imports: [PagoExito],
      providers: [
        provideRouter([
          { path: 'pago/exito', component: PagoExito },
          { path: 'menu', component: PagoExito },
        ]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(query),
            },
          },
        },
        {
          provide: PagosService,
          useValue: { confirmarSesionCheckout: confirmar },
        },
      ],
    }).compileComponents();

    carrito = TestBed.inject(CarritoService);
    carrito.vaciarCarrito();
    carrito.agregarAlCarrito({
      lineKey: '7__3',
      id: 7,
      tamanoPizzaId: 3,
      nombre: 'Hawaiana (Grande)',
      precio: 220,
      cantidad: 1,
      imagen: '/img/hawaiana.jpg',
    });

    fixture = TestBed.createComponent(PagoExito);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.changeDetectorRef.detectChanges();
  }

  afterEach(() => {
    vi.useRealTimers();
    fixture?.destroy();
  });

  it('confirma la sesión, vacía el carrito y programa el regreso al menú', async () => {
    vi.useFakeTimers();
    await montar({ session_id: 'cs_test_123' });

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(confirmar).toHaveBeenCalledWith('cs_test_123');
    expect(carrito.obtenerCarrito()).toHaveLength(0);
    expect((fixture.componentInstance as any).pedidoRegistradoId()).toBe(42);

    await vi.advanceTimersByTimeAsync(12000);
    expect(navigate).toHaveBeenCalledWith(['/menu']);
  });

  it('sin session_id vacía el carrito y redirige al menú', async () => {
    vi.useFakeTimers();
    await montar({});

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(confirmar).not.toHaveBeenCalled();
    expect(carrito.obtenerCarrito()).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(4000);
    expect(navigate).toHaveBeenCalledWith(['/menu']);
  });

  it('si la API falla igual vacía el carrito y redirige', async () => {
    vi.useFakeTimers();
    await montar(
      { session_id: 'cs_falla' },
      vi.fn(() => throwError(() => new Error('stripe down'))),
    );

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(carrito.obtenerCarrito()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(4000);
    expect(navigate).toHaveBeenCalledWith(['/menu']);
  });
});
