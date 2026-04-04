
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido } from './pedidos.service';

type TipoFiltro = 'Todos' | 'Pendiente' | 'Preparando' | 'Listo' | 'En Ruta';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-component.html',
  styleUrls: ['./pedidos-component.css']
})
export class PedidosComponent implements OnInit {
  filtroActual: TipoFiltro = 'Todos';
  
  pedidos: Pedido[] = []; 
  pedidosFiltrados: Pedido[] = []; 
  
  private pedidosService = inject(PedidosService);

  private cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.obtenerPedidos().subscribe({
      next: (datos) => {
        this.pedidos = datos;
        this.aplicarFiltro();
      },
      error: (err) => console.error('Error al cargar pedidos', err)
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
    if (pedido.estado === 'Pendiente') nuevoEstado = 'Preparando';
    else if (pedido.estado === 'Preparando') nuevoEstado = 'Listo';
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
      case 'Preparando': return 'Marcar como Listo';
      case 'Listo': return 'Asignar Repartidor';
      default: return 'Actualizar';
    }
  }
}