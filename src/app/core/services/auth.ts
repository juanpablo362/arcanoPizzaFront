import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  readonly isAuthenticated = signal<boolean>(false);
  readonly user = signal<{ name: string } | null>(null);

  readonly isLoggedIn = computed(() => this.isAuthenticated());

  login(credentials: { email: string; password: string }): void {
    // TODO: llamar a API de login cuando esté disponible
    this.isAuthenticated.set(true);
    this.user.set({ name: credentials.email });
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.router.navigate(['/auth']);
  }
}
