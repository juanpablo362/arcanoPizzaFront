import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido, Empleado } from './pedidos.service';

type TipoFiltro = 'Todos' | 'Pendiente' | 'Preparando' | 'Listo' | 'En Ruta';

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
  
  private pedidosService = inject(PedidosService);
  
  // Inyectamos el detector de cambios de Angular que nos salvó la vez pasada
  private cdr = inject(ChangeDetectorRef); 

 // Variables para el modal (ponlas al inicio de la clase)
  mostrarModal = false;
  pedidoParaAsignar: Pedido | null = null;
  empleados: Empleado[] = [];
  empleadoSeleccionadoId: number | null = null;
  guardandoAsignacion = false;

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

    if (pedido.estado === 'Listo') {
      this.abrirModal(pedido);
      return; 
    }

    let nuevoEstado = '';
    if (pedido.estado === 'Pendiente') nuevoEstado = 'Preparando';
    else if (pedido.estado === 'Preparando') nuevoEstado = 'Listo';
    else if (pedido.estado === 'En Ruta') nuevoEstado = 'Entregado'; // 👈 Agregamos el último paso

    if (nuevoEstado) {
      pedido.procesando = true;

      this.pedidosService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
        next: (respuestaServidor) => {
          console.log('Éxito:', respuestaServidor);

          // 👇 LA MAGIA PARA OCULTARLO
          if (nuevoEstado === 'Entregado') {
            // Si ya se entregó, lo filtramos (lo eliminamos) del arreglo principal
            this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
          } else {
            // Si es otro estado, solo lo actualizamos como siempre
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
      case 'En Ruta': return 'Marcar como Entregado'; // 👈 NUEVO CASO AÑADIDO
      default: return 'Actualizar';
    }
  }

  // 👇 5. Métodos del Modal
  // Métodos del Modal
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
        }
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
}