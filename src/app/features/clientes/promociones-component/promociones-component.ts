import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PromocionesService, Promocion } from '../../../core/services/promociones.service';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';

@Component({
  selector: 'app-promociones-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ClienteTopNavComponent],
  templateUrl: './promociones-component.html',
  styleUrl: './promociones-component.css',
})

export class PromocionesComponent implements OnInit {
  private router = inject(Router);
  private promocionesService = inject(PromocionesService);
  private cdr = inject(ChangeDetectorRef);

  promocionesReales: Promocion[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.promocionesService.obtenerPromocionesActivas().subscribe({
      next: (datos) => {
        this.promocionesReales = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar promociones:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  irAlMenu() {
    this.router.navigate(['/menu-clientes-component']);
  }

  abrirDetalle(promo: Promocion) {
    let listaContenido: string[] = [];
    if (promo.contenido) {
      listaContenido = promo.contenido.split(',').map((item: string) => item.trim());
    }

    const promoAdaptada = {
      id: promo.idPromocion,
      nombre: promo.titulo,
      precio: promo.precioPromocional,
      descripcion: promo.descripcion,
      imagen: promo.imagenURL,
      categoria: 'Promoción',
      ingredientes: listaContenido
    };

    this.router.navigate(['/producto-detalle'], { state: { producto: promoAdaptada } });
  }
}