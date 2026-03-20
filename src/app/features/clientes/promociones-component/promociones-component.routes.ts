import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { PromocionesComponent } from './promociones-component';

export const promocionesComponentRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./promociones-component').then(m => m.PromocionesComponent)
  }
];