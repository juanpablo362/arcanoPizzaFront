import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../carrito-compra-component/carrito-compra.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-exito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-exito.html',
  styleUrl: './pago-exito.css',
})

export class PagoExito implements OnInit, OnDestroy {
  
  private carritoService = inject(CarritoService);
  private router = inject(Router);
  
  private timeoutId: any;

  ngOnInit() {
    // 1. Vaciamos el carrito
    this.carritoService.vaciarCarrito(); 

    // 2. Iniciamos la cuenta regresiva de 4 segundos (4000 milisegundos)
    this.timeoutId = setTimeout(() => {
      this.router.navigate(['/menu-clientes-component']);
    }, 4000);
  }

  ngOnDestroy() {
    // 3. Limpieza: Si el usuario se va antes de los 4 segundos, cancelamos el temporizador
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}