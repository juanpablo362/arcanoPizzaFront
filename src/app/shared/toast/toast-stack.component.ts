import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { ToastKind } from './toast.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-stack.component.html',
  styleUrl: './toast-stack.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastStackComponent {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected icono(kind: ToastKind): string {
    switch (kind) {
      case 'error':
        return '✦';
      case 'success':
        return '✓';
      default:
        return '◇';
    }
  }

  protected cerrar(id: number): void {
    this.toastService.dismiss(id);
  }
}
