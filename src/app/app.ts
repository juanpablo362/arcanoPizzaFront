import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from './features/clientes/carrito-compra-component/carrito-compra.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  title = 'arcano-pizza';
  
  // 👇 2. Inyectamos el servicio para poder leer los datos
  private carritoService = inject(CarritoService);

  // 👇 3. Creamos una función que suma cuántas pizzas hay en total
  get cantidadEnCarrito(): number {
    return this.carritoService.obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
  }
}