import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClienteTopNavComponent } from '../../shared/cliente-top-nav/cliente-top-nav.component';

@Component({
  selector: 'app-extras',
  imports: [ClienteTopNavComponent],
  templateUrl: './extras.html',
  styleUrl: './extras.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Extras {}
