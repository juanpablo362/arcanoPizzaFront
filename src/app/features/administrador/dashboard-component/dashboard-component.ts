import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../../core/services/usuario'; 
import { ProductoService } from '../../../core/services/producto';
import { API_BASE_URL } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';

interface ProductoVendido { nombre: string; vendidos: number; total: number; }
interface PedidosHora { hora: string; cantidad: number; }
interface DashboardData {
  ventasHoy: number;
  pedidosActivos: number;
  productosVendidos: ProductoVendido[];
  pedidosPorHora: PedidosHora[];
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
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  fechaHoy: string = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  private readonly apiUrl = `${API_BASE_URL}/admin/dashboard`;

  totalUsuariosAPI: number = 0;
  totalProductosAPI: number = 0;
  productosActivosAPI: number = 0;

  ventasHoy: number = 0;
  pedidosActivos: number = 0;
  productosVendidos: ProductoVendido[] = [];
  pedidosPorHora: PedidosHora[] = [];

  ngOnInit() {
    this.cargarTotalesBasicos();
    this.cargarMetricasVentas();
  }

  cargarTotalesBasicos() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => { this.totalUsuariosAPI = usuarios?.length || 0; this.cdr.detectChanges(); }
    });
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.totalProductosAPI = productos?.length || 0;
        this.productosActivosAPI = productos?.filter((p: any) => p.activo).length || 0;
        this.cdr.detectChanges();
      }
    });
  }

  cargarMetricasVentas() {
    this.http.get<DashboardData>(this.apiUrl).subscribe({
      next: (data) => {
        if (data) {
          this.ventasHoy = data.ventasHoy || 0;
          this.pedidosActivos = data.pedidosActivos || 0;
          
          // 🔥 CORRECCIÓN: Multiplicamos el total de cada producto por 1.16 para incluir el IVA
          this.productosVendidos = (data.productosVendidos || []).map(p => ({
            ...p,
            total: p.total * 1.16
          }));

          this.pedidosPorHora = data.pedidosPorHora || [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar métricas:', err);
        this.productosVendidos = [];
        this.pedidosPorHora = [];
        this.cdr.detectChanges();
      }
    });
  }

  calcularPorcentaje(producto: ProductoVendido): number {
    if (this.productosVendidos.length === 0) return 0;
    const max = Math.max(...this.productosVendidos.map(p => p.vendidos));
    return max > 0 ? (producto.vendidos / max) * 100 : 0;
  }

  calcularPorcentajePedidos(pedido: PedidosHora): number {
    if (this.pedidosPorHora.length === 0) return 0;
    const max = Math.max(...this.pedidosPorHora.map(p => p.cantidad));
    return max > 0 ? (pedido.cantidad / max) * 100 : 0;
  }

  salir(): void {
    this.auth.logout();
  }
}