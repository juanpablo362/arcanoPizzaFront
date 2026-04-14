import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido } from './pedidos.service';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';
import { finalize, timeout } from 'rxjs';

type TipoFiltro = 'Todos' | 'Pendiente' | 'En Preparacion' | 'Listo' | 'En Ruta';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-component.html',
  styleUrl: './pedidos-component.css'
})
export class PedidosComponent implements OnInit {
  filtroActual: TipoFiltro = 'Todos';
  
  pedidos: Pedido[] = []; 
  pedidosFiltrados: Pedido[] = []; 

  isLoading = false;
  errorMsg: string | null = null;
  
  private pedidosService = inject(PedidosService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  // Forzamos redibujado cuando el server responde y Angular no refresca por referencia.
  private cdr = inject(ChangeDetectorRef); 

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.isLoading = true;
    this.errorMsg = null;
    this.pedidosService
      .obtenerPedidos()
      .pipe(
        timeout(12000),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (datos) => {
          this.pedidos = datos;
          this.aplicarFiltro();
        },
        error: (err) => {
          console.error('Error al cargar pedidos', err);
          this.pedidos = [];
          this.pedidosFiltrados = [];
          this.errorMsg = 'No pudimos cargar los pedidos. Revisa tu sesión o intenta nuevamente.';
        },
      });
  }

  aplicarFiltro() {
    if (this.filtroActual === 'Todos') {
      this.pedidosFiltrados = [...this.pedidos];
    } else {
      this.pedidosFiltrados = this.pedidos.filter(pedido => pedido.estado === this.filtroActual);
    }
  }

  cambiarFiltro(nuevoFiltro: TipoFiltro) {
    this.filtroActual = nuevoFiltro;
    this.aplicarFiltro();
  }

  cambiarEstadoPedido(pedido: Pedido) {
    if (pedido.procesando) return;

    let nuevoEstado = '';
    if (pedido.estado === 'Pendiente') nuevoEstado = 'En Preparacion';
    else if (pedido.estado === 'En Preparacion') nuevoEstado = 'Listo';
    else if (pedido.estado === 'Listo') nuevoEstado = 'En Ruta';

    if (nuevoEstado) {
      pedido.procesando = true; // Empieza el spinner

      this.pedidosService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
        next: (respuestaServidor) => {
          console.log('Éxito:', respuestaServidor);

          // A) Mapeamos el arreglo para crear referencias de memoria nuevas.
          // Esto es infalible para que el @for de Angular note el cambio.
          this.pedidos = this.pedidos.map(p => {
            if (p.id === pedido.id) {
              // Creamos una copia del pedido, pero con el estado nuevo y el spinner apagado
              return { ...p, estado: nuevoEstado, procesando: false };
            }
            return p; // Los demás pedidos los dejamos intactos
          });

          // B) Re-filtramos para que desaparezca de la columna actual
          this.aplicarFiltro();

          // C) EL MARTILLO: Forzamos el redibujado de la pantalla
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          pedido.procesando = false;
          this.cdr.detectChanges(); // Forzamos redibujado también si falla
        }
      });
    }
  }

  obtenerConteo(estado?: TipoFiltro): number {
    if (!estado || estado === 'Todos') return this.pedidos.length;
    return this.pedidos.filter(pedido => pedido.estado === estado).length;
  }

  getColorEstado(estado?: string): string {
    switch(estado) {
      case 'Pendiente': return '#0d6efd';
      case 'Preparando': return '#ffc107';
      case 'Listo': return '#198754';
      case 'En Ruta': return '#6f42c1';
      default: return '#6c757d';
    }
  }

  getTextoBoton(estado?: string): string {
    switch(estado) {
      case 'Pendiente': return 'Iniciar Preparación';
      case 'En Preparacion': return 'Marcar como Listo';
      case 'Listo': return 'Asignar Repartidor';
      default: return 'Actualizar';
    }
  }

  getEstadoClass(estado?: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'pendiente';
      case 'En Preparacion':
        return 'en-preparacion';
      case 'Listo':
        return 'listo';
      case 'En Ruta':
        return 'en-ruta';
      default:
        return 'default';
    }
  }

  logout(): void {
    this.auth.logout();
  }
}