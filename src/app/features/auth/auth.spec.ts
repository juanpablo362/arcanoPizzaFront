import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../shared/toast/toast.service';
import { savePostLoginPayload } from '../../core/auth/post-login-redirect';
import { Auth } from './auth';

describe('Auth login', () => {
  let fixture: ComponentFixture<Auth>;
  let component: Auth;
  let login: ReturnType<typeof vi.fn>;
  let toastShow: ReturnType<typeof vi.fn>;

  async function montar(url = '/auth') {
    sessionStorage.clear();
    login = vi.fn();
    toastShow = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        provideRouter([
          { path: 'auth', component: Auth },
          { path: 'menu', component: Auth },
          { path: 'producto', component: Auth },
          { path: 'carrito', component: Auth },
        ]),
        {
          provide: AuthService,
          useValue: {
            login,
            register: vi.fn(),
            user: () => ({
              idUsuario: 1,
              nombreUsuario: 'ana',
              correo: 'ana@arcano.test',
              rol: 'Cliente',
            }),
          },
        },
        {
          provide: ToastService,
          useValue: { show: toastShow },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('con credenciales incorrectas muestra error y no navega', async () => {
    await montar();
    login.mockReturnValue(throwError(() => ({ status: 401 })));

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate');
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl');

    (component as any).loginForm.setValue({
      email: 'ana@arcano.test',
      password: 'secreta',
    });
    (component as any).onSubmit();
    await fixture.whenStable();

    expect(login).toHaveBeenCalledWith({
      email: 'ana@arcano.test',
      password: 'secreta',
    });
    expect(toastShow).toHaveBeenCalledWith(
      expect.stringContaining('Credenciales incorrectas'),
      'error',
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('con login correcto navega al returnUrl interno', async () => {
    await montar('/auth?returnUrl=/carrito');
    login.mockReturnValue(
      of({
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
        usuario: {
          idUsuario: 1,
          nombreUsuario: 'ana',
          correo: 'ana@arcano.test',
          rol: 'Cliente',
        },
      }),
    );

    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    (component as any).loginForm.setValue({
      email: 'ana@arcano.test',
      password: 'secreta',
    });
    (component as any).onSubmit();
    await fixture.whenStable();

    expect(navigateByUrl).toHaveBeenCalledWith('/carrito');
  });

  it('prioriza el estado pendiente del detalle sobre returnUrl', async () => {
    await montar('/auth?returnUrl=/carrito');
    savePostLoginPayload({
      path: '/producto',
      state: { producto: { id: 7, nombre: 'Hawaiana' } },
    });
    login.mockReturnValue(
      of({
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
        usuario: {
          idUsuario: 1,
          nombreUsuario: 'ana',
          correo: 'ana@arcano.test',
          rol: 'Cliente',
        },
      }),
    );

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (component as any).loginForm.setValue({
      email: 'ana@arcano.test',
      password: 'secreta',
    });
    (component as any).onSubmit();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/producto'], {
      state: { producto: { id: 7, nombre: 'Hawaiana' } },
    });
  });
});
