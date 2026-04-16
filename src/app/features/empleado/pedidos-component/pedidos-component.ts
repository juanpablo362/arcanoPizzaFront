import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido, Empleado } from './pedidos.service';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';
import { finalize, timeout } from 'rxjs';

type TipoFiltro = 'Todos' | 'Pendiente' | 'En Preparacion' | 'Listo' | 'En Ruta';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Modal: asignación de repartidor
  mostrarModal = false;
  pedidoParaAsignar: Pedido | null = null;
  empleados: Empleado[] = [];
  empleadoSeleccionadoId: number | null = null;
  guardandoAsignacion = false;

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

    if (pedido.estado === 'Listo') {
      // Solo pedidos de reparto requieren repartidor.
      if ((pedido.tipoEntrega || '').toLowerCase() === 'reparto') {
        this.abrirModal(pedido);
        return;
      }
      // Si es recoger, no asignamos repartidor: lo marcamos como entregado/cerrado.
      pedido.procesando = true;
      this.pedidosService.actualizarEstado(pedido.id, 'Entregado').subscribe({
        next: () => {
          this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
          this.aplicarFiltro();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          pedido.procesando = false;
          this.cdr.detectChanges();
        }
      });
      return;
    }

    let nuevoEstado = '';
    if (pedido.estado === 'Pendiente') nuevoEstado = 'En Preparacion';
    else if (pedido.estado === 'En Preparacion') nuevoEstado = 'Listo';
    else if (pedido.estado === 'En Ruta') nuevoEstado = 'Entregado';

    if (nuevoEstado) {
      pedido.procesando = true;

      this.pedidosService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
        next: (respuestaServidor) => {
          console.log('Éxito:', respuestaServidor);

          if (nuevoEstado === 'Entregado') {
            this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
          } else {
            this.pedidos = this.pedidos.map(p => {
              if (p.id === pedido.id) {
                return { ...p, estado: nuevoEstado, procesando: false };
              }
              return p;
            });
          }

          this.aplicarFiltro();
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          pedido.procesando = false;
          this.cdr.detectChanges(); 
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
      case 'En Preparacion': return '#ffc107';
      case 'Listo': return '#198754';
      case 'En Ruta': return '#6f42c1';
      default: return '#6c757d';
    }
  }

  getTextoBoton(pedido: Pedido): string {
    switch (pedido.estado) {
      case 'Pendiente':
        return 'Iniciar Preparación';
      case 'En Preparacion':
        return 'Marcar como Listo';
      case 'Listo':
        return (pedido.tipoEntrega || '').toLowerCase() === 'reparto'
          ? 'Asignar Repartidor'
          : 'Cerrar pedido';
      case 'En Ruta':
        return 'Marcar como Entregado';
      default:
        return 'Actualizar';
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

  abrirModal(pedido: Pedido) {
    this.pedidoParaAsignar = pedido;
    this.empleadoSeleccionadoId = null;
    this.mostrarModal = true;
    
    // Solo cargamos los empleados de la base de datos si no lo hemos hecho antes
    if (this.empleados.length === 0) {
      this.pedidosService.obtenerRepartidores().subscribe({
        next: (data) => {
          this.empleados = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar repartidores:', err);
        },
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoParaAsignar = null;
  }

  confirmarAsignacion() {
    if (!this.pedidoParaAsignar || !this.empleadoSeleccionadoId) return;

    this.guardandoAsignacion = true;
    const pedidoId = this.pedidoParaAsignar.id;

    this.pedidosService.asignarRepartidor(pedidoId, this.empleadoSeleccionadoId).subscribe({
      next: () => {
        // Actualizamos la tarjeta de forma infalible
        this.pedidos = this.pedidos.map(p => 
          p.id === pedidoId ? { ...p, estado: 'En Ruta' } : p
        );

        this.guardandoAsignacion = false;
        this.cerrarModal();
        this.aplicarFiltro();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al asignar:', err);
        this.guardandoAsignacion = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}