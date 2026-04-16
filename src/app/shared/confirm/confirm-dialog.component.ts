import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  viewChild,
} from '@angular/core';
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
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly state = this.confirm.state;

  private storedFocus: HTMLElement | null = null;
  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = this.state().isOpen;
      if (open && !this.wasOpen) {
        if (typeof document !== 'undefined') {
          this.storedFocus = document.activeElement as HTMLElement | null;
        }
        setTimeout(() => this.focusPanelPrimary(), 0);
      }
      if (!open && this.wasOpen) {
        setTimeout(() => {
          if (this.storedFocus && typeof this.storedFocus.focus === 'function') {
            this.storedFocus.focus();
          }
          this.storedFocus = null;
        }, 0);
      }
      this.wasOpen = open;
    });
  }

  private focusPanelPrimary(): void {
    const el = this.panelRef()?.nativeElement;
    const btn = el?.querySelector<HTMLButtonElement>('.btn-secondary');
    btn?.focus();
  }

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

