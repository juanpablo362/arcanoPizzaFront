import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../shared/toast/toast.service';
import { getUserHomeUrl } from '../../core/auth/role';
import { consumePostLoginPayload, sanitizeReturnUrl } from '../../core/auth/post-login-redirect';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const confirm = group.get('confirmPassword');
  if (!confirm?.value?.length) return null;
  const pass = group.get('password')?.value ?? '';
  return pass === confirm.value ? null : { passwordsMismatch: true };
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
  private readonly toast = inject(ToastService);

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly isSubmitting = signal(false);

  protected loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected registerForm = this.fb.nonNullable.group(
    {
      nombreUsuario: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator] },
  );

  protected setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
  }

  /** Prioridad: estado guardado (p. ej. detalle de producto) → ?returnUrl= → home por rol. */
  private navigateAfterSuccessfulAuth(): void {
    const pending = consumePostLoginPayload();
    if (pending) {
      void this.router.navigate([pending.path], { state: pending.state ?? undefined });
      return;
    }
    const raw = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
    const ret = sanitizeReturnUrl(raw);
    if (ret) {
      void this.router.navigateByUrl(ret);
      return;
    }
    void this.router.navigate([getUserHomeUrl(this.authService.user())]);
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.getRawValue();
    this.authService
      .login({ email, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.navigateAfterSuccessfulAuth(),
        error: () =>
          this.toast.show(
            'Credenciales incorrectas o no pudimos contactar al servidor. Revisá los datos e intentá de nuevo.',
            'error',
          ),
      });
  }

  protected onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const { nombreUsuario, email, password } = this.registerForm.getRawValue();
    this.authService
      .register({ nombreUsuario, correo: email, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res?.accessToken) {
            this.navigateAfterSuccessfulAuth();
            return;
          }
          this.toast.show('Cuenta creada. Ya podés iniciar sesión.', 'success');
          this.setTab('login');
          this.loginForm.patchValue({ email });
        },
        error: () =>
          this.toast.show(
            'No pudimos registrar la cuenta. Si el correo ya está en uso, probá iniciar sesión.',
            'error',
          ),
      });
  }
}
