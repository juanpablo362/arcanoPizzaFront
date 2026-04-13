import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { CarritoService } from './features/clientes/carrito-compra-component/carrito-compra.service';
import { ToastStackComponent } from './shared/toast/toast-stack.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ToastStackComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'arcano-pizza';

  private readonly carritoService = inject(CarritoService);
  private readonly router = inject(Router);

  /** Para que la plantilla reaccione al cambiar de ruta (OnPush no actualizaba el FAB del carrito). */
  protected rutaActual = '';

  constructor() {
    this.rutaActual = this.router.url;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.rutaActual = this.router.url;
      });
  }

  get cantidadEnCarrito(): number {
    return this.carritoService.obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
  }

  /** Oculto en login y en cualquier subruta de /auth. */
  get mostrarCarritoFlotante(): boolean {
    if (this.cantidadEnCarrito <= 0) return false;
    const path = this.rutaActual.split('?')[0];
    return path !== '/auth' && !path.startsWith('/auth/');
  }
}
