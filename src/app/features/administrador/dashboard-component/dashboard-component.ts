import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


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
export class DashboardComponent {
  fecha: string = 'Lunes, 9 de Marzo 2026';

  ventasHoy: number = 2847.50;
  pedidosActivos: number = 23;
  clientesDia: number = 156;

  productosVendidos: ProductoVendido[] = [
    { nombre: 'Pepperoni Clásica', vendidos: 45, total: 584.55 },
    { nombre: 'Hawaiana Tropical', vendidos: 38, total: 455.62 },
    { nombre: 'Meat Lovers', vendidos: 32, total: 479.68 },
    { nombre: 'Vegetariana Suprema', vendidos: 28, total: 321.72 },
    { nombre: 'Margarita Fresca', vendidos: 25, total: 274.75 },
  ];

  pedidosPorHora: PedidosHora[] = [
    { hora: '11:00', cantidad: 5 },
    { hora: '12:00', cantidad: 12 },
    { hora: '13:00', cantidad: 18 },
    { hora: '14:00', cantidad: 23 },
    { hora: '15:00', cantidad: 15 },
  ];

  // Calcula el porcentaje de barra de cada producto
  calcularPorcentaje(producto: ProductoVendido): number {
    const max = Math.max(...this.productosVendidos.map(p => p.vendidos));
    return (producto.vendidos / max) * 100;
  }

  // Calcula el porcentaje de barra de pedidos por hora
  calcularPorcentajePedidos(pedido: PedidosHora): number {
    const max = Math.max(...this.pedidosPorHora.map(p => p.cantidad));
    return (pedido.cantidad / max) * 100;
  }
}