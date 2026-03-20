import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { getHttpErrorMessage } from '../../core/utils/http-error';

function passwordsMatch(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (password === undefined || confirm === undefined) {
    return null;
  }
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private navigateAfterAuth(): void {
    const user = this.authService.user();
    const rol = user?.rol;

    // Regla de negocio: si eres cliente, vas al menú de clientes.
    if (rol === 'Cliente') {
      this.router.navigate(['/menu-clientes-component']);
      return;
    }

    // Por defecto se mantiene el comportamiento anterior.
    this.router.navigate(['/pedidos']);
  }

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly registerSuccess = signal<string | null>(null);

  protected loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected registerForm = this.fb.nonNullable.group(
    {
      nombreUsuario: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatch] }
  );

  protected setTab(
    tab: 'login' | 'register',
    preserveRegisterSuccess = false
  ): void {
    this.activeTab.set(tab);
    this.apiError.set(null);
    if (!preserveRegisterSuccess) {
      this.registerSuccess.set(null);
    }
  }

  protected onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.apiError.set(null);
    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.getRawValue();
    this.authService
      .login({ correo: email, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.navigateAfterAuth(),
        error: (err: unknown) => {
          this.apiError.set(
            err instanceof HttpErrorResponse
              ? getHttpErrorMessage(err)
              : 'No se pudo iniciar sesión.'
          );
        },
      });
  }

  protected onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.apiError.set(null);
    this.registerSuccess.set(null);
    this.isSubmitting.set(true);
    const { nombreUsuario, correo, telefono, password } =
      this.registerForm.getRawValue();
    const telefonoApi = telefono.trim() === '' ? null : telefono.trim();
    this.authService
      .register({
        nombreUsuario,
        correo,
        password,
        telefono: telefonoApi,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          if (result === 'authenticated') {
            this.navigateAfterAuth();
            return;
          }
          this.registerSuccess.set(
            'Cuenta creada. Si tu cuenta requiere confirmación, revisa tu correo; en caso contrario, inicia sesión.'
          );
          this.setTab('login', true);
          this.loginForm.patchValue({ email: correo, password: '' });
        },
        error: (err: unknown) => {
          this.apiError.set(
            err instanceof HttpErrorResponse
              ? getHttpErrorMessage(err)
              : 'No se pudo completar el registro.'
          );
        },
      });
  }
}
