import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-tecnico-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tecnico-admin-nav.component.html',
  styleUrl: './tecnico-admin-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TecnicoAdminNavComponent {
  private readonly auth = inject(AuthService);

  readonly visible = computed(() => this.auth.user()?.rol === 'Tecnico');
}

