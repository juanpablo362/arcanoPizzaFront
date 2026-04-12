import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UsuarioService } from '../../../core/services/usuario'; 
import { ProductoService } from '../../../core/services/producto';

interface ProductoVendido {
  nombre: string;
  vendidos: number;
  total: number;
}

interface PedidosHora {
  hora: string;
  cantidad: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  fechaHoy: string = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Variables Dinámicas Reales
  totalUsuariosAPI: number = 0;
  totalProductosAPI: number = 0;
  productosActivosAPI: number = 0;

  // 🔥 Variables en 0 (Esperando futura conexión a API de Ventas/Pedidos)
  ventasHoy: number = 0;
  pedidosActivos: number = 0;

  // 🔥 Arreglos limpios (Sin datos falsos)
  productosVendidos: ProductoVendido[] = [];
  pedidosPorHora: PedidosHora[] = [];

  ngOnInit() {
    this.cargarDatosReales();
  }

  cargarDatosReales() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.totalUsuariosAPI = usuarios.length;
        this.cdr.detectChanges();
      }
    });

    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.totalProductosAPI = productos.length;
        this.productosActivosAPI = productos.filter((p: any) => p.activo).length;
        this.cdr.detectChanges();
      }
    });
  }

  calcularPorcentaje(producto: ProductoVendido): number {
    if (this.productosVendidos.length === 0) return 0;
    const max = Math.max(...this.productosVendidos.map(p => p.vendidos));
    return (producto.vendidos / max) * 100;
  }

  calcularPorcentajePedidos(pedido: PedidosHora): number {
    if (this.pedidosPorHora.length === 0) return 0;
    const max = Math.max(...this.pedidosPorHora.map(p => p.cantidad));
    return (pedido.cantidad / max) * 100;
  }
}