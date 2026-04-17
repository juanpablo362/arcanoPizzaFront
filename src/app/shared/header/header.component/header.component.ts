import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);

  readonly canVerAdmin = computed(() => {
    const rol = this.auth.user()?.rol;
    return rol === 'Administrador' || rol === 'Tecnico';
  });

  readonly esTecnico = computed(() => this.auth.user()?.rol === 'Tecnico');

  logout(): void {
    this.auth.logout();
  }
}
