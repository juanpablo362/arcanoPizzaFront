import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CarritoCompraComponent } from './carrito-compra-component';

export const carritoCompraComponentRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./carrito-compra-component').then(m => m.CarritoCompraComponent)
  }
];