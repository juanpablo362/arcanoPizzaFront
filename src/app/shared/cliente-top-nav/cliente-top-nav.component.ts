import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-cliente-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './cliente-top-nav.component.html',
  styleUrl: './cliente-top-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteTopNavComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
