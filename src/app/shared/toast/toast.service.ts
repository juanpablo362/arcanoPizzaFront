import { Injectable, signal } from '@angular/core';

export type ToastKind = 'error' | 'success' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  /** Duración hasta el cierre automático (para la barra de progreso en errores). */
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly items = signal<ToastItem[]>([]);

  /** Solo lectura para plantillas */
  readonly toasts = this.items.asReadonly();

  /**
   * Muestra un mensaje flotante que se oculta solo.
   * @param durationMs por defecto ~4–5 s (errores un poco más largos)
   */
  show(
    message: string,
    kind: ToastKind = 'info',
    durationMs?: number,
  ): void {
    const id = ++this.seq;
    const ms =
      durationMs ??
      (kind === 'error' ? 5000 : kind === 'success' ? 3000 : 4000);

    this.items.update((list) => [...list, { id, message, kind, durationMs: ms }]);
    window.setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }
}
