import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

export interface Promocion {
  id: number;
  titulo: string;
  descripcion: string;
  validez: string;
  precioOriginal: number;
  precioOferta: number;
  descuentoPorcentaje: number;
  ahorro: number;
  imagen: string;
  ingredientes: string[]; // <-- 1. Agregamos esto para la vista de detalles
}

@Component({
  selector: 'app-promociones-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promociones-component.html',
  styleUrl: './promociones-component.css',
})

export class PromocionesComponent {
  private router = inject(Router);

  listaPromociones: Promocion[] = [
    {
      id: 1,
      titulo: 'Ritual Familiar',
      descripcion: '2 pizzas grandes + 4 bebidas místicas + pan del conjuro',
      validez: '31 de Marzo, 2026',
      precioOriginal: 49.90,
      precioOferta: 39.90,
      descuentoPorcentaje: 20,
      ahorro: 10.00,
      imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      // 👇 2. Agregamos lo que incluye el paquete 👇
      ingredientes: ['2 Pizzas Grandes Clásicas (a elegir)', '4 Refrescos de cola 600ml', '1 Orden de Pan del Conjuro'] 
    },
    {
      id: 2,
      titulo: 'Martes Arcano',
      descripcion: 'Todas las pizzas especiales con 25% de descuento',
      validez: 'Todos los martes',
      precioOriginal: 19.90,
      precioOferta: 14.93,
      descuentoPorcentaje: 25,
      ahorro: 4.97,
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      // 👇 2. Agregamos las reglas/términos 👇
      ingredientes: ['Aplica para cualquier pizza Especial', 'Válido en cualquier tamaño', 'Solo para consumo en tienda o pasar a recoger']
    }
  ];

  irAlMenu() {
    this.router.navigate(['/menu-clientes-component']);
  }

  // 👇 3. Esta es la función mágica que adapta los datos 👇
  abrirDetalle(promo: Promocion) {
    
    // Transformamos la 'Promocion' para que se disfrace de 'Producto'
    const promoAdaptada = {
      id: promo.id + 1000, // ID distinto para no chocar con las pizzas normales
      nombre: promo.titulo, // El detalle espera la variable 'nombre'
      precio: promo.precioOferta, // El detalle espera la variable 'precio'
      descripcion: promo.descripcion + ' (Válido hasta: ' + promo.validez + ')',
      imagen: promo.imagen,
      categoria: 'Promoción',
      ingredientes: promo.ingredientes
      // No mandamos "tamanos", así que la pantalla de detalles los ocultará automáticamente
    };

    // La enviamos exactamente igual que en el menú
    this.router.navigate(['/producto-detalle'], { state: { producto: promoAdaptada } });
  }
}