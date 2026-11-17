import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from './api';
import { AuthService } from './auth';
import { CarritoService } from '../../features/clientes/carrito-compra-component/carrito-compra.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let carrito: CarritoService;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    carrito = TestBed.inject(CarritoService);
  });

  afterEach(() => {
    http.verify();
  });

  it('persiste la sesión al iniciar correctamente', () => {
    auth.login({ email: 'ana@arcano.test', password: 'secreta' }).subscribe();

    const req = http.expectOne(`${API_BASE_URL}/Auth/login`);
    expect(req.request.body).toEqual({
      correo: 'ana@arcano.test',
      password: 'secreta',
    });
    req.flush({
      accessToken: 'tok-ana',
      refreshToken: 'ref',
      expiresIn: 3600,
      usuario: {
        idUsuario: 1,
        nombreUsuario: 'ana',
        correo: 'ana@arcano.test',
        rol: 'Cliente',
      },
    });

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()?.nombreUsuario).toBe('ana');
    expect(sessionStorage.getItem('arcano_auth')).toContain('tok-ana');
  });

  it('vacía el carrito al cambiar de usuario', () => {
    carrito.agregarAlCarrito({
      lineKey: '7__3',
      id: 7,
      tamanoPizzaId: 3,
      nombre: 'Hawaiana (Grande)',
      precio: 220,
      cantidad: 1,
      imagen: '/img/hawaiana.jpg',
    });

    auth.login({ email: 'ana@arcano.test', password: 'secreta' }).subscribe();
    http.expectOne(`${API_BASE_URL}/Auth/login`).flush({
      accessToken: 'tok-ana',
      refreshToken: 'ref',
      expiresIn: 3600,
      usuario: {
        idUsuario: 1,
        nombreUsuario: 'ana',
        correo: 'ana@arcano.test',
        rol: 'Cliente',
      },
    });

    expect(carrito.obtenerCarrito()).toHaveLength(1);

    auth.login({ email: 'luis@arcano.test', password: 'otra' }).subscribe();
    http.expectOne(`${API_BASE_URL}/Auth/login`).flush({
      accessToken: 'tok-luis',
      refreshToken: 'ref',
      expiresIn: 3600,
      usuario: {
        idUsuario: 2,
        nombreUsuario: 'luis',
        correo: 'luis@arcano.test',
        rol: 'Cliente',
      },
    });

    expect(carrito.obtenerCarrito()).toHaveLength(0);
  });
});
