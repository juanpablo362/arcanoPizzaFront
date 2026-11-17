import { Component, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService, AuthUser } from '../services/auth';
import { authGuard } from './auth-guard';
import { roleGuard } from './role-guard';

@Component({ standalone: true, template: '' })
class PaginaVacia {}

describe('CP-003 acceso a /carrito', () => {
  let autenticado: WritableSignal<boolean>;
  let usuario: WritableSignal<AuthUser | null>;

  beforeEach(() => {
    autenticado = signal(false);
    usuario = signal(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'carrito',
            canActivate: [authGuard, roleGuard(['Cliente'])],
            component: PaginaVacia,
          },
          { path: 'auth', component: PaginaVacia },
          { path: 'menu', component: PaginaVacia },
          { path: 'empleado/pedidos', component: PaginaVacia },
        ]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: autenticado,
            user: usuario,
          },
        },
      ],
    });
  });

  it('sin sesión no abre el carrito y redirige al inicio de sesión', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/carrito');

    expect(router.url.startsWith('/auth')).toBe(true);
    expect(router.url).toContain('returnUrl');
  });

  it('deja pasar a un Cliente autenticado', async () => {
    autenticado.set(true);
    usuario.set({
      idUsuario: 1,
      nombreUsuario: 'ana',
      correo: 'ana@arcano.test',
      rol: 'Cliente',
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/carrito');

    expect(router.url).toBe('/carrito');
  });

  it('no deja entrar a un rol distinto de Cliente', async () => {
    autenticado.set(true);
    usuario.set({
      idUsuario: 2,
      nombreUsuario: 'luis',
      correo: 'luis@arcano.test',
      rol: 'Empleado',
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/carrito');

    expect(router.url).toBe('/empleado/pedidos');
  });
});
