import { Component, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService, AuthUser } from '../services/auth';
import { guestGuard } from './guest-guard';

@Component({ standalone: true, template: '' })
class PaginaVacia {}

describe('guestGuard', () => {
  let autenticado: WritableSignal<boolean>;
  let usuario: WritableSignal<AuthUser | null>;

  beforeEach(() => {
    autenticado = signal(false);
    usuario = signal(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'auth',
            canActivate: [guestGuard],
            component: PaginaVacia,
          },
          { path: 'menu', component: PaginaVacia },
          { path: 'carrito', component: PaginaVacia },
          { path: 'admin/dashboard', component: PaginaVacia },
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

  it('deja ver /auth a un visitante sin sesión', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/auth');
    expect(router.url).toBe('/auth');
  });

  it('saca de /auth a quien ya inició sesión hacia su home', async () => {
    autenticado.set(true);
    usuario.set({
      idUsuario: 1,
      nombreUsuario: 'ana',
      correo: 'ana@arcano.test',
      rol: 'Cliente',
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/auth');
    expect(router.url).toBe('/menu');
  });

  it('respeta returnUrl interno si ya hay sesión', async () => {
    autenticado.set(true);
    usuario.set({
      idUsuario: 1,
      nombreUsuario: 'ana',
      correo: 'ana@arcano.test',
      rol: 'Cliente',
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/auth?returnUrl=/carrito');
    expect(router.url).toBe('/carrito');
  });
});
