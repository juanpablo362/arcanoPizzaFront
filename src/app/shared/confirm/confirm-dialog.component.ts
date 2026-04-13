import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  private readonly confirm = inject(ConfirmService);
  protected readonly state = this.confirm.state;

  protected aceptar(): void {
    this.confirm.accept();
  }

  protected cancelar(): void {
    this.confirm.cancel();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.state().isOpen) this.confirm.cancel();
  }
}

