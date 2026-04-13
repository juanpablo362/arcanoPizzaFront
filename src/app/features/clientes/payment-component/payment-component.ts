import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-component',
standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-component.html',
  styleUrl: './payment-component.css',
})

export class PaymentComponent {
  private readonly toast = inject(ToastService);

  // Total simulado a pagar
  totalAPagar: number = 230.00; 

  // Variables del formulario
  nombreTitular: string = '';
  numeroTarjeta: string = '';
  fechaExpiracion: string = '';
  cvv: string = '';

  // Controla si el CVV es visible o no
  mostrarCvv: boolean = false;

  toggleCvv() {
    this.mostrarCvv = !this.mostrarCvv;
  }

  // --- NUEVA FUNCIÓN: Bloquea caracteres especiales en el teclado ---
  permitirSoloNumeros(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Solo permite códigos ASCII del 48 (0) al 57 (9)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  // Limpia el texto (por si copian y pegan texto sucio) y fuerza 16 dígitos
  formatearTarjeta(valor: string) {
    let limpio = valor.replace(/\D/g, ''); 
    this.numeroTarjeta = limpio.substring(0, 16);
  }

  // Limpia el texto y fuerza el formato MM/AA
  formatearFecha(valor: string) {
    let limpio = valor.replace(/\D/g, ''); 
    if (limpio.length > 2) {
      limpio = limpio.substring(0, 2) + '/' + limpio.substring(2, 4);
    }
    this.fechaExpiracion = limpio;
  }

  // Limpia el texto y fuerza a 3 dígitos exactos
  formatearCvv(valor: string) {
    let limpio = valor.replace(/\D/g, '');
    this.cvv = limpio.substring(0, 3);
  }

  // Valida que todo esté correcto antes de "cobrar"
  procesarPago() {
    if (!this.nombreTitular || this.numeroTarjeta.length < 16 || this.fechaExpiracion.length < 5 || this.cvv.length < 3) {
      this.toast.show(
        'Completá todos los datos de la tarjeta antes de continuar.',
        'error',
      );
      return;
    }
    console.log('Procesando pago de:', this.nombreTitular);
    this.toast.show('Pago simulado correcto. ¡Preparando tu pizza…', 'success');
  }
}