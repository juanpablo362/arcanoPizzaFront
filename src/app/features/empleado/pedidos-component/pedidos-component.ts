import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface Articulo {
  cantidad: number;
  nombre: string;
  nota?: string;
}

interface Pedido {
  id: string;
  estado?: 'Nuevo' | 'Preparando' | 'Listo' | 'En Ruta';
  urgente: boolean;
  horaRecibido: string;
  horaEntrega: string;
  cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
  };
  articulos: Articulo[];
  total: number;
}
@Component({
  selector: 'app-pedidos-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-component.html',
  styleUrl: './pedidos-component.css',
})
export class PedidosComponent implements OnInit {
  filtroActual: string = 'Todos';

  pedidos: Pedido[] = [
    {
      id: 'ORD-001234',
      estado: 'Preparando',
      urgente: true,
      horaRecibido: '14:30',
      horaEntrega: '15:00',
      cliente: {
        nombre: 'María González',
        telefono: '(555) 123-4567',
        direccion: 'Av. Reforma 123, Col. Centro'
      },
      articulos: [
        { cantidad: 1, nombre: 'Pepperoni Clásica (Familiar)' },
        { cantidad: 1, nombre: 'Coca Cola 2L' }
      ],
      total: 18.97
    },
    {
      id: 'ORD-001235',
      estado: 'Nuevo',
      urgente: false,
      horaRecibido: '14:35',
      horaEntrega: '15:05',
      cliente: {
        nombre: 'Carlos Ramírez',
        telefono: '(555) 234-5678',
        direccion: 'Calle Juárez 456, Col. Jardines'
      },
      articulos: [
        { cantidad: 2, nombre: 'Hawaiana Tropical (Mediana)' },
        { cantidad: 1, nombre: 'Alitas BBQ', nota: 'Extra picantes' }
      ],
      total: 35.96
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  // Método para obtener el color del badge de estado
  getColorEstado(estado?: string): string {
    switch(estado) {
      case 'Nuevo': return '#0d6efd'; // Azul
      case 'Preparando': return '#ffc107'; // Amarillo
      case 'Listo': return '#198754'; // Verde
      case 'En Ruta': return '#6f42c1'; // Morado
      default: return '#6c757d';
    }
  }

  // Método para obtener el texto del botón de acción
  getTextoBoton(estado?: string): string {
    switch(estado) {
      case 'Nuevo': return 'Iniciar Preparación';
      case 'Preparando': return 'Marcar como Listo';
      case 'Listo': return 'Asignar Repartidor';
      default: return 'Actualizar';
    }
  }
}