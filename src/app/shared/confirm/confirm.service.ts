import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

type Resolver = (value: boolean) => void;

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private resolver: Resolver | null = null;

  private readonly stateSig = signal<ConfirmDialogState>({
    isOpen: false,
    title: 'Confirmar',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
  });

  readonly state = this.stateSig.asReadonly();

  confirm(input: Partial<Omit<ConfirmDialogState, 'isOpen'>> & { message: string }): Promise<boolean> {
    if (this.resolver) {
      // Si ya había un modal abierto, lo cerramos como cancelado.
      this.resolver(false);
      this.resolver = null;
    }

    const next: ConfirmDialogState = {
      isOpen: true,
      title: input.title ?? 'Confirmar',
      message: input.message,
      confirmText: input.confirmText ?? 'Confirmar',
      cancelText: input.cancelText ?? 'Cancelar',
    };
    this.stateSig.set(next);

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  accept(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  private close(result: boolean): void {
    const r = this.resolver;
    this.resolver = null;
    this.stateSig.update((s) => ({ ...s, isOpen: false }));
    r?.(result);
  }
}

