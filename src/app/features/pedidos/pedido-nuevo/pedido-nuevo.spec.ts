import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { AuthService } from '../../../core/services/auth';
import { DireccionesService } from '../../../core/services/direcciones.service';
import { CarritoService } from '../../clientes/carrito-compra-component/carrito-compra.service';
import { PedidosService } from '../pedidos.service';
import { PedidoNuevo } from './pedido-nuevo';

type PedidoNuevoApi = {
  carritoVacioBloqueo: () => boolean;
  checkoutConTarjeta: () => boolean;
  faltaDireccionReparto: () => boolean;
  iniciarPagoStripe: () => void;
  pedidoForm: PedidoNuevo['pedidoForm'];
  tipoEntregaActual: () => string;
};

const DIRECCION = {
  idDireccion: 11,
  calle: 'Calle Luna 1',
  colonia: 'Centro',
  codigoPostal: '44100',
};

describe('Checkout PedidoNuevo', () => {
  let fixture: ComponentFixture<PedidoNuevo>;
  let component: PedidoNuevoApi;
  let carrito: CarritoService;
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  async function montar(opts?: { carritoVacio?: boolean; pago?: string }) {
    localStorage.clear();
    queryParams$ = new BehaviorSubject(
      convertToParamMap(opts?.pago ? { pago: opts.pago } : {}),
    );

    await TestBed.configureTestingModule({
      imports: [PedidoNuevo],
      providers: [
        provideRouter([
          { path: 'menu', component: PedidoNuevo },
          { path: 'carrito', component: PedidoNuevo },
        ]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParams$.asObservable(),
            snapshot: { queryParamMap: queryParams$.value },
          },
        },
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
        {
          provide: DireccionesService,
          useValue: {
            misDirecciones: () => of([DIRECCION]),
            crear: () => of(DIRECCION),
          },
        },
        {
          provide: PedidosService,
          useValue: { crear: vi.fn(() => of({ idPedido: 99 })) },
        },
      ],
    }).compileComponents();

    carrito = TestBed.inject(CarritoService);
    carrito.vaciarCarrito();
    if (!opts?.carritoVacio) {
      carrito.agregarAlCarrito({
        lineKey: '7__3',
        id: 7,
        tamanoPizzaId: 3,
        nombre: 'Hawaiana (Grande)',
        precio: 220,
        cantidad: 1,
        imagen: '/img/hawaiana.jpg',
      });
    }

    fixture = TestBed.createComponent(PedidoNuevo);
    component = fixture.componentInstance as unknown as PedidoNuevoApi;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.changeDetectorRef.detectChanges();
  }

  it('bloquea el checkout cuando el carrito está vacío', async () => {
    await montar({ carritoVacio: true });

    expect(component.carritoVacioBloqueo()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Tu carrito está vacío');
  });

  it('activa el modo tarjeta cuando llega pago=stripe', async () => {
    await montar({ pago: 'stripe' });

    expect(component.checkoutConTarjeta()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Pago con tarjeta');
    expect(fixture.nativeElement.textContent).toContain('Continuar al pago con tarjeta');
  });

  it('no exige dirección al elegir Recoger', async () => {
    await montar({ pago: 'stripe' });

    component.pedidoForm.patchValue({ tipoEntrega: 'Recoger', direccionId: 0 });
    fixture.changeDetectorRef.detectChanges();

    expect(component.tipoEntregaActual()).toBe('Recoger');
    expect(component.pedidoForm.valid).toBe(true);
    expect(component.faltaDireccionReparto()).toBe(false);
  });

  it('exige dirección válida en Reparto', async () => {
    await montar();

    component.pedidoForm.patchValue({ tipoEntrega: 'Reparto', direccionId: 0 });
    component.pedidoForm.get('direccionId')?.updateValueAndValidity();
    fixture.changeDetectorRef.detectChanges();

    expect(component.pedidoForm.invalid).toBe(true);
    expect(component.faltaDireccionReparto()).toBe(true);
  });

  it('no crea sesión Stripe si el formulario es inválido', async () => {
    await montar({ pago: 'stripe' });

    const carritoSpy = vi.spyOn(carrito, 'crearSesionStripe$');
    component.pedidoForm.patchValue({ tipoEntrega: 'Reparto', direccionId: 0 });
    component.pedidoForm.get('direccionId')?.updateValueAndValidity();
    component.iniciarPagoStripe();

    expect(carritoSpy).not.toHaveBeenCalled();
    expect(component.pedidoForm.touched).toBe(true);
  });
});
