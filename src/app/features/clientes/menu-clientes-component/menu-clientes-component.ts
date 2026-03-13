import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-clientes-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-clientes-component.html',
  styleUrl: './menu-clientes-component.css',
})

export class MenuClientesComponent {

  // Inyectamos el Router en el constructor para poder usarlo
  constructor(private router: Router) {}

  // Esta es la función que se ejecuta al hacer clic en la tarjeta
  abrirDetalle() {
    // Le indicamos a Angular que navegue a la ruta de los detalles
    this.router.navigate(['/producto-detalle']);
  }

}