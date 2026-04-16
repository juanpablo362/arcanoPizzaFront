import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';
import { PedidosAsignadosService, type PedidoAsignado } from './pedidos-asignados.service';

type TipoFiltro = 'Todos' | 'En Ruta' | 'Entregado' | 'Pendiente' | 'En Preparacion' | 'Listo';

@Component({
  selector: 'app-pedidos-asignados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-asignados-component.html',
  styleUrl: './pedidos-asignados-component.css',
})
export class PedidosAsignadosComponent implements OnInit {
  private readonly pedidosService = inject(PedidosAsignadosService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);

  filtroActual: TipoFiltro = 'Todos';
  pedidos: PedidoAsignado[] = [];
  pedidosFiltrados: PedidoAsignado[] = [];

  isLoading = false;
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.isLoading = true;
    this.errorMsg = null;
    this.pedidosService
      .obtenerMisAsignados()
      .pipe(
        timeout(12000),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (datos) => {
          this.pedidos = datos ?? [];
          this.aplicarFiltro();
        },
        error: (err) => {
          console.error('Error al cargar pedidos asignados', err);
          this.pedidos = [];
          this.pedidosFiltrados = [];
          this.errorMsg = 'No pudimos cargar tus pedidos asignados. Revisa tu sesión o intenta nuevamente.';
        },
      });
  }

  cambiarFiltro(nuevoFiltro: TipoFiltro): void {
    this.filtroActual = nuevoFiltro;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroActual === 'Todos') {
      this.pedidosFiltrados = [...this.pedidos];
      return;
    }
    this.pedidosFiltrados = this.pedidos.filter((p) => p.estado === this.filtroActual);
  }

  obtenerConteo(estado?: TipoFiltro): number {
    if (!estado || estado === 'Todos') return this.pedidos.length;
    return this.pedidos.filter((p) => p.estado === estado).length;
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
      case 'Entregado':
        return 'entregado';
      default:
        return 'default';
    }
  }

  getTextoBoton(estado?: string): string {
    switch (estado) {
      case 'En Ruta':
        return 'Marcar como Entregado';
      case 'Entregado':
        return 'Entregado';
      default:
        return '—';
    }
  }

  cambiarEstadoPedido(pedido: PedidoAsignado): void {
    if (pedido.procesando) return;
    if (pedido.estado !== 'En Ruta') return;

    const nuevoEstado = 'Entregado';
    pedido.procesando = true;
    this.pedidosService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
      next: () => {
        this.pedidos = this.pedidos.map((p) =>
          p.id === pedido.id ? { ...p, estado: nuevoEstado, procesando: false } : p,
        );
        this.aplicarFiltro();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar estado', err);
        pedido.procesando = false;
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}

