import { Component, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService, AuthUser } from '../services/auth';
import { getRoleHomeUrl } from '../auth/role';
import { authGuard } from './auth-guard';
import { roleGuard } from './role-guard';

@Component({ standalone: true, template: '' })
class PaginaVacia {}

describe('Matriz de acceso por rol', () => {
  let autenticado: WritableSignal<boolean>;
  let usuario: WritableSignal<AuthUser | null>;

  beforeEach(() => {
    autenticado = signal(true);
    usuario = signal(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'admin/dashboard',
            canActivate: [authGuard, roleGuard(['Administrador', 'Tecnico'])],
            component: PaginaVacia,
          },
          {
            path: 'tecnico/logs',
            canActivate: [authGuard, roleGuard(['Tecnico'])],
            component: PaginaVacia,
          },
          {
            path: 'empleado/pedidos',
            canActivate: [authGuard, roleGuard(['Empleado', 'Administrador'])],
            component: PaginaVacia,
          },
          {
            path: 'repartidor/pedidos',
            canActivate: [authGuard, roleGuard(['Repartidor'])],
            component: PaginaVacia,
          },
          {
            path: 'carrito',
            canActivate: [authGuard, roleGuard(['Cliente'])],
            component: PaginaVacia,
          },
          { path: 'menu', component: PaginaVacia },
          { path: 'auth', component: PaginaVacia },
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

  function setRol(rol: AuthUser['rol'], id = 1) {
    usuario.set({
      idUsuario: id,
      nombreUsuario: rol.toLowerCase(),
      correo: `${rol.toLowerCase()}@arcano.test`,
      rol,
    });
  }

  it('un Cliente no abre el dashboard de administración', async () => {
    setRol('Cliente');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/dashboard');
    expect(router.url).toBe('/menu');
  });

  it('un Técnico abre logs y no pedidos de empleado', async () => {
    setRol('Tecnico');
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/tecnico/logs');
    expect(router.url).toBe('/tecnico/logs');

    await router.navigateByUrl('/empleado/pedidos');
    expect(router.url).toBe('/tecnico/logs');
  });

  it('un Repartidor cae en su home de pedidos asignados', async () => {
    setRol('Repartidor');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/carrito');
    expect(router.url).toBe('/repartidor/pedidos');
  });

  it('cada rol tiene su ruta de inicio', () => {
    expect(getRoleHomeUrl('Cliente')).toBe('/menu');
    expect(getRoleHomeUrl('Empleado')).toBe('/empleado/pedidos');
    expect(getRoleHomeUrl('Administrador')).toBe('/admin/dashboard');
    expect(getRoleHomeUrl('Repartidor')).toBe('/repartidor/pedidos');
    expect(getRoleHomeUrl('Tecnico')).toBe('/tecnico/logs');
  });
});
