import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
export class PagoCancelado implements OnInit, OnDestroy {
  
  private router = inject(Router);
  private timeoutId: any;

  ngOnInit() {
    // Redirigimos de vuelta al carrito en 4 segundos para que intente pagar de nuevo
    this.timeoutId = setTimeout(() => {
      this.router.navigate(['/carrito-compra']);
    }, 4000);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}