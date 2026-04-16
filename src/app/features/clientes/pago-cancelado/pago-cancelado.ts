import { Component, OnDestroy, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-cancelado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-cancelado.html',
  styleUrl: './pago-cancelado.css',
})
export class PagoCancelado implements OnDestroy {
  private readonly router = inject(Router);

  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      this.timeoutId = setTimeout(() => {
        void this.router.navigate(['/carrito']);
      }, 4000);
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
  }
}
